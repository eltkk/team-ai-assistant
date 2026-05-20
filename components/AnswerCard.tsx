"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Copy, CheckCheck, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface AnswerCardProps {
  answer: string
  isLoading: boolean
  error?: string
  onRetry?: () => void
}

export function AnswerCard({ answer, isLoading, error, onRetry }: AnswerCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading && !answer) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 pt-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="flex items-start justify-between gap-4 pt-2">
          <p className="text-sm text-destructive-foreground">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!answer) return null

  return (
    <Card>
      <CardContent className="pt-2">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Answer
          </span>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
            {copied ? (
              <>
                <CheckCheck className="size-3.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
        <div className="prose prose-sm prose-invert max-w-none [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:text-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {answer}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}
