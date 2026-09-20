# Coding Rules — EXEC

## TypeScript

- Strict mode on (`tsconfig` — `tsc --noEmit` is the lint command)
- All API route inputs validated with **Zod** before touching the DB or calling Gemini
- No `any` on Zod-parsed values; `any` only used in Gemini response shapes (external boundary)
- React components typed with `React.FC<Props>` and explicit prop interfaces

## Styling

- **Tailwind utility classes only** — no external UI component library (no shadcn, no MUI, no Radix)
- All spacing, colour, and radius values come from `src/design-tokens.ts` tokens where practical
- Dark-first: default background is `zinc-950`; light mode not implemented
- Responsive: `sm:` prefix used for two-column layouts; no `md:` or `lg:` breakpoints in current components

## File / Folder Structure

```
src/
  components/         # React UI components (one file per component)
    ui/               # Generic primitives (Modal, etc.)
    execution/        # Execution-flow specific sub-components
  routes/
    api.ts            # All CRUD + AI-backed REST routes (Express Router)
  db/
    schema.ts         # Drizzle table definitions
    index.ts          # DB client singleton
    init-db.ts        # Seed script (run via npm run db:seed)
  design-tokens.ts    # Color, spacing, radius constants
  types.ts            # Shared TypeScript types
server.ts             # Express entry point; Gemini endpoints + Vite middleware
```

## API Conventions

- All routes use `try/catch` and return `{ error: message }` on failure
- Gemini calls go through a `generateWithRetry` helper (exponential backoff, model fallback)
- Answers to MCQs are **never** sent to the client — stripped server-side before response

## Commit Convention

No enforced format was adopted during the hackathon build. Commits are descriptive sentence-case messages.
