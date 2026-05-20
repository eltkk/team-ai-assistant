import { SYSTEM_PROMPT } from "@/lib/prompts"
import type { ApiError } from "@/types"

export const MODEL = "openai/gpt-oss-120b:free"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export async function streamAnswer(
  question: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  if (!OPENROUTER_API_KEY) {
    throw { message: "OPENROUTER_API_KEY is not set", code: 500 } satisfies ApiError
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  let response: Response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
      }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    if ((err as Error).name === "AbortError") {
      throw { message: "Request timed out after 30 seconds", code: 408 } satisfies ApiError
    }
    throw { message: "Network error", code: 503 } satisfies ApiError
  }

  clearTimeout(timeout)

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw { message: body || response.statusText, code: response.status } satisfies ApiError
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw { message: "No response body", code: 500 } satisfies ApiError
  }

  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const lines = decoder.decode(value, { stream: true }).split("\n")
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue
      const data = line.slice(6).trim()
      if (data === "[DONE]") return

      try {
        const json = JSON.parse(data)
        const chunk: string = json.choices?.[0]?.delta?.content ?? ""
        if (chunk) onChunk(chunk)
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}
