"use client"

import { useState, useCallback } from "react"
import { EmptyState } from "@/components/EmptyState"
import { QuestionForm } from "@/components/QuestionForm"
import { AnswerCard } from "@/components/AnswerCard"
import { HistoryList } from "@/components/HistoryList"
import { saveToHistory } from "@/lib/storage"
import type { Message } from "@/types"

const ERROR_MARKER = "\x00JSON:"

export default function Home() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastQuestion, setLastQuestion] = useState("")

  const submit = useCallback(async (q: string) => {
    if (!q.trim() || isLoading) return

    setLastQuestion(q)
    setAnswer("")
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Server error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        // Detect in-stream error marker written by the API route on failure
        const markerIdx = chunk.indexOf(ERROR_MARKER)
        if (markerIdx !== -1) {
          const jsonStr = chunk.slice(markerIdx + ERROR_MARKER.length)
          let errMsg = "Something went wrong"
          try {
            const errData = JSON.parse(jsonStr) as { error?: string }
            errMsg = errData.error ?? errMsg
          } catch {
            // malformed error payload — use generic message
          }
          throw new Error(errMsg)
        }

        accumulated += chunk
        setAnswer(accumulated)
      }

      if (accumulated) {
        const msg: Message = {
          id: crypto.randomUUID(),
          question: q,
          answer: accumulated,
          timestamp: Date.now(),
        }
        saveToHistory(msg)
        setRefreshKey((k) => k + 1)
      }
    } catch (err) {
      setError((err as Error).message ?? "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  function handleSubmit(q: string) {
    submit(q)
  }

  function handleHistorySelect(q: string) {
    setQuestion(q)
    setAnswer("")
    setError(null)
  }

  function handleRetry() {
    if (lastQuestion) submit(lastQuestion)
  }

  const showEmpty = !isLoading && !answer && !error

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-6 py-4">
        <h1 className="text-base font-semibold tracking-tight">Team Tech Lead AI</h1>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* left column: form + answer */}
          <div className="flex flex-col gap-6">
            <QuestionForm
              value={question}
              onChange={setQuestion}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {showEmpty ? (
              <EmptyState />
            ) : (
              <AnswerCard
                answer={answer}
                isLoading={isLoading}
                error={error ?? undefined}
                onRetry={handleRetry}
              />
            )}
          </div>

          {/* right column: history */}
          <aside className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent questions
            </h2>
            <HistoryList onSelect={handleHistorySelect} refreshKey={refreshKey} />
          </aside>
        </div>
      </main>
    </div>
  )
}
