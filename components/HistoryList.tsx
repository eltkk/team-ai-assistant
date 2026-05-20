"use client"

import { useMemo } from "react"
import { Clock } from "lucide-react"
import { getHistory } from "@/lib/storage"

interface HistoryListProps {
  onSelect: (question: string) => void
  refreshKey?: number
}

function relativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 10) return "just now"
  if (diffSec < 60) return `${diffSec}s ago`

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export function HistoryList({ onSelect, refreshKey }: HistoryListProps) {
  // refreshKey in the dep array causes re-read when parent increments it
  const history = useMemo(() => getHistory(), [refreshKey])

  if (history.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">No history yet.</p>
    )
  }

  return (
    <ul className="flex flex-col gap-1">
      {history.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => onSelect(item.question)}
            className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
          >
            <span className="block truncate text-foreground/90 group-hover:text-foreground">
              {item.question}
            </span>
            <span className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {relativeTime(item.timestamp)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
