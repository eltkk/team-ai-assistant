import { streamAnswer } from "@/lib/openrouter"
import type { ApiError } from "@/types"

export const maxDuration = 30

export async function POST(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body", code: 400 }, { status: 400 })
  }

  const question = (body as Record<string, unknown>)?.question
  if (!question || typeof question !== "string" || !question.trim()) {
    return Response.json({ error: "question is required", code: 400 }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamAnswer(question.trim(), (chunk) => {
          controller.enqueue(encoder.encode(chunk))
        })
      } catch (err) {
        const apiErr = err as ApiError
        const code = apiErr.code ?? 500

        if (code === 429) {
          controller.enqueue(
            encoder.encode(
              `\x00JSON:${JSON.stringify({ error: "Rate limited, try again in a moment", code: 429 })}`
            )
          )
        } else {
          controller.enqueue(
            encoder.encode(
              `\x00JSON:${JSON.stringify({ error: apiErr.message ?? "Internal server error", code })}`
            )
          )
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
