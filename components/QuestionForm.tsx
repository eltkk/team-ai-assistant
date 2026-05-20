"use client"

import { useRef, useEffect, KeyboardEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuestionFormProps {
  onSubmit: (question: string) => void
  isLoading: boolean
  value: string
  onChange: (value: string) => void
}

export function QuestionForm({ onSubmit, isLoading, value, onChange }: QuestionFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a technical question…"
        rows={3}
        disabled={isLoading}
        className={cn(
          "w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[80px] max-h-[320px] overflow-y-auto"
        )}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter to submit
        </span>
        <Button onClick={handleSubmit} disabled={isLoading || !value.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Thinking…
            </>
          ) : (
            "Ask AI"
          )}
        </Button>
      </div>
    </div>
  )
}
