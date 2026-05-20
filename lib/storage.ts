import type { Message } from "@/types"

const KEY = "team-ai-history"
const MAX_ENTRIES = 5

export function getHistory(): Message[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Message[]) : []
  } catch {
    return []
  }
}

export function saveToHistory(msg: Message): void {
  const history = getHistory()
  const updated = [msg, ...history].slice(0, MAX_ENTRIES)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function clearHistory(): void {
  localStorage.removeItem(KEY)
}
