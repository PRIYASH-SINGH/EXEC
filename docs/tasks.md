# Tasks — EXEC Hackathon Build

## Done ✅

- [x] Express server with Vite middleware (single `npm run dev` command)
- [x] SQLite schema — 6 tables via Drizzle ORM (`db:push` + `db:seed`)
- [x] User registration / upsert by email
- [x] Plan intake modal — raw text input + 3 quick-start templates
- [x] Gemini plan breakdown — AI deconstructs raw notes into typed tasks with substeps, progress, H.E.E.D. metadata
- [x] Daily task sequencing — `GET /api/tasks/today/:planId` calculates current day from plan start date
- [x] Theory drop generation — Gemini micro-read (200–350 words, markdown) stored in `theory_drops`
- [x] Daily MCQ generation — 3 questions from theory drop content, answers stripped server-side
- [x] MCQ grading — pass/fail at ≥60%, feedback with missed question explanations
- [x] Streak tracking — `currentStreak` / `longestStreak` updated on pass, persisted in `user_progress`
- [x] Anti-procrastination unblocker — 2-minute first step + momentum action from Gemini
- [x] Context matcher — Gemini picks compatible task for current real-world activity
- [x] Audio narration fix — Context matcher TTS now reads the AI-generated `audio_script` stripped of markdown instead of UI labels
- [x] Gemini retry helper — exponential backoff + lighter model fallback on 503/429
- [x] PDF tab disabled with "coming soon" label (scope discipline)

## Explicitly Deferred 🚧

- [ ] PDF upload and parsing (tab visible but disabled — see Roadmap)
- [ ] Local LLM (Llama 3.2 1B) for offline PDF ingestion
- [ ] NotebookLM API integration (column + stub endpoint exist, not wired)
- [ ] H.E.E.D. Matrix wired to real device/activity sensors
- [ ] Push notification scheduling
- [ ] Mastery map visualisation
- [ ] Auth beyond email (no passwords, sessions, or JWT)

## Known Issues

- `notebooklm_notebook_id` column exists on `learning_plans` but the integration endpoint returns a static stub message
- `streakShieldsUsed` column exists in `user_progress` schema but no UI or logic reads/writes it
- Gemini model string `"gemini-3.8-flash"` used in both `server.ts` and `api.ts` — verify against actual model availability in your API key tier
