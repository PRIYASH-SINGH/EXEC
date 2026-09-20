# Architecture — EXEC

## System Boundaries

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│   Browser (React 19)    │        │   Google Gemini API          │
│   Vite SPA              │        │   gemini-3.8-flash (primary) │
│   Tailwind / Motion     │        │   gemini-3.6-flash (fallback)│
└────────────┬────────────┘        └──────────────┬───────────────┘
             │ fetch /api/*                        │ generateContent
             ▼                                     │
┌─────────────────────────────────────────────────▼──────────────┐
│   Express Server  (server.ts + src/routes/api.ts)              │
│   Port 3000 — tsx in dev, esbuild bundle in prod               │
│   Retry helper: exponential backoff, model fallback on 503/429 │
└─────────────────────────────┬──────────────────────────────────┘
                              │ Drizzle ORM
                              ▼
              ┌───────────────────────────┐
              │   SQLite  (libsql/client) │
              │   local file  (dev)       │
              └───────────────────────────┘
```

---

## Database Schema (`src/db/schema.ts`)

| Table | Purpose |
|---|---|
| `users` | Email-keyed user identity (UUID PK, upsert on register) |
| `learning_plans` | One plan per user; stores title, duration, daily time budget |
| `daily_tasks` | One row per day-of-plan; unique on `(plan_id, day_number)` |
| `theory_drops` | AI-generated micro-reads linked to a daily task |
| `daily_mcqs` | 3-question quiz per theory drop; stores questions + user answers as JSON |
| `user_progress` | Streak counters, MCQ aggregate stats per `(user, plan)` |

---

## API Endpoints (`src/routes/api.ts` + `server.ts`)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Upsert user by email; returns `userId` |
| `POST` | `/api/plans/create` | Create plan + Gemini daily breakdown + init progress row |
| `GET` | `/api/plans/:planId` | Fetch plan, tasks, and progress |
| `GET` | `/api/tasks/today/:planId` | Return today's task + its theory drops |
| `POST` | `/api/theory/generate-daily-drop` | Generate + persist theory micro-read via Gemini |
| `POST` | `/api/mcq/generate-daily-quiz` | Generate 3 MCQs from a theory drop; strip answers before send |
| `POST` | `/api/mcq/submit-answer` | Grade answers, update streak + MCQ stats |
| `GET` | `/api/progress/:userId/:planId` | Return streak + MCQ aggregate |
| `POST` | `/api/notebooklm/notebooks` | **Stub** — returns static message |
| `POST` | `/api/plan/breakdown` | Stateless Gemini task deconstruction (intake flow) |
| `POST` | `/api/execute/context-match` | Gemini picks best task for current real-world activity |
| `POST` | `/api/theory/generate-drop` | Stateless theory drop (alternate flow) |
| `POST` | `/api/mcq/generate-daily-test` | Stateless MCQ for given topics |
| `POST` | `/api/procrastination/unblock` | Gemini returns 2-min first step for stuck task |

---

## Key Decisions

| Decision | Rationale |
|---|---|
| SQLite over Postgres | Zero infra setup during hackathon; Drizzle makes migration to Turso/Postgres trivial later |
| Gemini over local LLM | Reliability and speed under time pressure; Llama 3.2 PDF parsing is next roadmap item |
| Vite inside Express process | Single `npm run dev` command; no separate frontend server to manage |
| Zod on all API inputs | Catch bad payloads at the boundary, not inside business logic |
| Retry + model fallback | Gemini 503/429 spikes are common; fallback to lighter model keeps demo stable |
| Answers stripped server-side | MCQ `correctAnswerId` never sent to client — prevents trivial inspection |
