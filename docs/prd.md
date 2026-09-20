# PRD — EXEC (Hackathon v1)

## Problem

People write learning plans they never execute. The gap isn't knowledge or intent — it's the absence of a daily forcing function that structures *when* to study, *what* to absorb, and *whether* it was retained.

---

## Target User

**The Plan-Writer Who Doesn't Execute**  
A student or self-learner who has written a study schedule at least once, felt good about it, and then let it decay. They are motivated in bursts, overwhelmed by scope, and have no lightweight feedback loop to close the day.

---

## Core User Flow

```
1. IMPORT  →  Paste syllabus / raw notes into PlanIntakeModal
              Gemini deconstructs it into daily tasks with substeps

2. EXECUTE  → Each day: read a theory micro-drop (1–5 min)
              Context matcher surfaces the right task for what you're doing right now
              Anti-procrastination unblocker removes friction on stuck tasks

3. VALIDATE → End-of-day: answer 3 MCQs drawn from today's theory drop
              Pass (≥60%) closes the day and increments streak
              Fail: streak pauses, feedback shown
```

---

## Success Metrics

- **Streak maintained** — user passes MCQ on consecutive days
- **MCQ pass rate** — `totalMcqsPassed / totalMcqsAttempted` stored in `user_progress`
- **Theory drop read rate** — drops generated per plan (proxy for engagement)

---

## Out of Scope — This Version

- PDF upload / local LLM parsing
- NotebookLM grounded citations (column reserved, endpoint stubbed)
- Push notifications / scheduled reminders
- Social / leaderboard features
- Mobile native app
- Offline mode
