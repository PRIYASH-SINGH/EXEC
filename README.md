# EXEC — The Execution Layer for Learning Plans

> Turn any syllabus or learning goal into a structured daily execution system — with AI-generated theory drops, end-of-day MCQ validation, and streak tracking.

---

## Problem

Most people know *what* to learn. They even write the plan. Then life interrupts, momentum stalls, and the plan dies in a Notion doc.  
EXEC solves the execution gap: it takes your raw plan, breaks it into daily tasks, drip-feeds theory at timed intervals, and proves you absorbed it with a daily quiz before the day closes.

---

## What's Working Right Now

- **Plan intake** — paste raw notes or a syllabus; Gemini AI deconstructs it into 3–8 prioritised, typed tasks with substeps and progress tracking
- **AI theory drops** — timed micro-reads (200–350 words) generated per daily task topic; stored in SQLite
- **Daily MCQ validation** — 3 questions generated from each theory drop; answers graded server-side (pass = ≥60%)
- **Streak tracking** — `currentStreak` / `longestStreak` updated on MCQ pass, persisted in `user_progress`
- **Anti-procrastination unblocker** — paste a task + obstacle; Gemini returns a 2-minute first step and momentum action
- **Context matcher** — describe what you're doing right now; Gemini picks the most compatible pending task and can read its **AI-generated audio script** aloud via TTS.
- **Quick-start templates** — React Core, Python CLI, DSA Trees & Graphs pre-loaded in the intake modal

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | Express 4 (served via `tsx` in dev, `esbuild` bundle in prod) |
| Database | SQLite via `@libsql/client` + Drizzle ORM |
| AI | Google Gemini API (`@google/genai` v2) |
| Animations | Motion (Framer), canvas-confetti |
| Validation | Zod (all API inputs) |

---

## Run Locally

```bash
# 1. Clone
git clone <repo-url>
cd EXEC

# 2. Install
npm install

# 3. Create .env
echo "GEMINI_API_KEY=your_key_here" > .env

# 4. Push schema to SQLite
npm run db:push

# 5. Seed initial data
npm run db:seed

# 6. Start dev server (Express + Vite on port 3000)
npm run dev
```

---

## Architecture

```
Browser (React 19 SPA)
        │  fetch /api/*
        ▼
Express server (server.ts + src/routes/api.ts)
  ├── /api/plan/breakdown          → Gemini: task deconstruction
  ├── /api/theory/generate-drop    → Gemini: micro-read content
  ├── /api/mcq/generate-daily-quiz → Gemini: 3 MCQs from theory drop
  ├── /api/mcq/submit-answer       → grades + updates streak
  ├── /api/execute/context-match   → Gemini: activity-aware task picker
  ├── /api/procrastination/unblock → Gemini: 2-min first step
  └── CRUD routes (plans, tasks, progress)
        │
        ▼
    SQLite (Drizzle ORM)
    users | learning_plans | daily_tasks | theory_drops | daily_mcqs | user_progress
```

In dev, Vite middleware runs inside the same Express process. In production, the SPA is served as static files from `dist/`.

---

## Screenshots

See `/screenshots` folder.

---

## Roadmap *(not yet built)*

- Local LLM-powered PDF parsing (Llama 3.2 1B) for offline syllabus ingestion — planned next.
- Full NotebookLM API grounded citations (schema column `notebooklm_notebook_id` is ready; integration is stubbed)
- H.E.E.D. Matrix context matching wired to real device/activity signals
- Mastery map visualisation across plan completion

---

## Hackathon

**HACK DEVENGERS 2.0**
