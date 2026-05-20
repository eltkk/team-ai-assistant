# Team AI Assistant

> AI-powered dashboard for dev teams — ask questions, get structured answers, keep history.

A lightweight internal tool that gives your team a senior-engineer-style AI assistant. Ask anything technical and get a clean, structured answer: TL;DR first, then details, then a code example if it helps.

---

## Features

- **Streaming answers** — responses appear word-by-word as they're generated, no waiting for the full reply
- **Markdown + syntax highlighting** — code blocks, headings, lists, and inline code render properly with github-dark colours
- **Last 5 questions history** — recent questions are saved locally and shown in the sidebar for quick re-use
- **Copy button** — one click to copy the full answer to clipboard, with a 2-second confirmation flash
- **Keyboard shortcut** — `Cmd+Enter` (or `Ctrl+Enter` on Windows/Linux) to submit without reaching for the mouse
- **Dark theme** — dark-first UI, easy on the eyes during long coding sessions

---

## Tech Stack

| Library | Why |
|---|---|
| **Next.js 16 + App Router** | File-based routing and API routes in one project — no separate backend needed |
| **TypeScript** | Catches mistakes at compile time; especially useful for the streaming response parsing |
| **Tailwind CSS v4** | Utility-first, no context switching between CSS files and components |
| **shadcn/ui** | Unstyled-by-default Radix primitives — we own the components, no black-box library to fight |
| **react-markdown + remark-gfm + rehype-highlight** | Full GFM markdown with syntax highlighting in one small dependency chain |
| **OpenRouter** | Single API key to access multiple models; easy to swap models without touching the client code |

---

## Quick Start

```bash
git clone https://github.com/eltkk/team-ai-assistant.git
cd team-ai-assistant
npm install
```

Create a `.env.local` file in the project root:

```
OPENROUTER_API_KEY=your_key_here
```

Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture Decisions

**Next.js API route as a proxy (`/api/ask`)**
The OpenRouter API key lives only in the server environment. The browser never sees it — no key in `localStorage`, no key in JS bundles. All requests go through the `/api/ask` route which reads `process.env.OPENROUTER_API_KEY` server-side.

**Streaming responses**
Long technical answers can take 5–15 seconds to fully generate. Without streaming, the user stares at a spinner the whole time. With streaming, text starts appearing within ~500ms and the experience feels responsive. The route pipes the OpenRouter SSE stream directly to the browser via `ReadableStream`.

**Structured system prompt**
Raw model responses tend to be verbose and meandering. The system prompt enforces a TL;DR → details → code example structure so answers are scannable. It also instructs the model to mirror the language of the question, which matters for multilingual teams.

---

## Project Structure

```
team-ai-assistant/
├── app/
│   ├── api/ask/route.ts     # POST endpoint — proxies to OpenRouter, streams response
│   ├── globals.css          # Dark theme, prose styles, hljs token colours
│   ├── layout.tsx           # Root layout — fonts, Toaster
│   └── page.tsx             # Main dashboard — state, streaming logic, two-column layout
├── components/
│   ├── ui/                  # shadcn/ui primitives (Button, Card, Input, Skeleton, Toast)
│   ├── AnswerCard.tsx       # Markdown renderer, copy button, skeleton loader, error state
│   ├── EmptyState.tsx       # Shown before the first question
│   ├── HistoryList.tsx      # Last 5 questions from localStorage, relative timestamps
│   └── QuestionForm.tsx     # Auto-resize textarea, Cmd+Enter submit
├── hooks/
│   └── use-toast.ts         # Toast state management
├── lib/
│   ├── openrouter.ts        # streamAnswer() — fetch wrapper with 30s timeout
│   ├── prompts.ts           # SYSTEM_PROMPT constant
│   ├── storage.ts           # localStorage helpers (get/save/clear history)
│   └── utils.ts             # cn() helper
└── types/
    └── index.ts             # Message, ApiError interfaces
```
