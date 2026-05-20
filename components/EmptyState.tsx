import { Sparkles } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Sparkles className="size-7 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">
        Ask your team&apos;s AI anything
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Get structured answers from your senior engineer AI — TL;DR first, then
        details and code examples when needed.
      </p>
    </div>
  )
}
