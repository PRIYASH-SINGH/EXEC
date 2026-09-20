# Memory — EXEC Project Context

## Why This Was Built

EXEC was built for **HACK DEVENGERS 2.0** to address a specific, personal problem: the execution gap between making a learning plan and actually following through on it. The hypothesis is that structured daily forcing functions — a timed theory drop, followed by an MCQ that must be passed to close the day — create the accountability loop that generic to-do apps don't.

---

## What It Solves

Not "what to learn" — that's solved by YouTube and courses.  
Not "how to learn" — that's solved by spaced repetition and Anki.  
**EXEC solves: "Did I actually do it today, and can I prove it?"**

---

## Key Decisions Made During the Build

| Decision | Why |
|---|---|
| Dropped PDF upload | No time to integrate a local LLM or a reliable PDF-to-text pipeline during the hackathon window. Disabled gracefully with a "Coming soon" label rather than leaving a broken button. |
| SQLite over Postgres | Zero config, zero infra. Drizzle ORM makes it a one-line change to Turso/Postgres later. |
| Google Gemini over local LLM | Reliability under demo conditions. Llama 3.2 PDF parsing is the first post-hackathon item. |
| Single Express process for API + Vite | One command to run, one port to share — reduces friction during the demo. |
| Retry + model fallback on 503/429 | Gemini overload during peak demo hours is a real risk. Fallback to `gemini-3.6-flash` keeps the demo alive. |
| TTS Markdown Regex | Rather than importing a heavy AST markdown parser to clean AI theory scripts before text-to-speech, used a lightweight 5-pass regex to drop symbols like #, *, and code blocks. Keeps bundle size down while preventing awkward robotic narration. |
| NotebookLM stubbed, not removed | The schema column and API endpoint exist; the stub signals intent without pretending it works. |
| Zod on all API inputs | Caught three incorrect payload shapes during development before they hit the DB. |
| Answers stripped server-side | MCQ answers never leave the server — prevents browser DevTools inspection from trivially cheating. |

---

## Stack Choices In One Line Each

- **React 19** — latest stable at build time; concurrent features available if needed
- **Tailwind 4** — zero-config with Vite plugin; no PostCSS setup required
- **Drizzle ORM** — typed schema-first; `db:push` is fast enough for hackathon iteration
- **canvas-confetti** — MCQ pass celebration; zero-dependency, one import
- **Motion (Framer)** — modal and card entrance animations; tree-shakeable
