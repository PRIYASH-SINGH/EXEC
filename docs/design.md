# Design — EXEC

## Color Palette (`src/design-tokens.ts`)

| Token | Tailwind class | Role |
|---|---|---|
| Primary | `amber-500` / `amber-600` (hover) | CTAs, active states, accent |
| Success | `emerald-500` | Correct answer, pass state |
| Insight | `cyan-400` | Theory drop badges, info |
| Alert | `red-500` | Error, fail state |
| Background | `zinc-950` | Page and modal background |
| Surface | `zinc-900` | Cards, input fields |
| Border | `zinc-800` | Dividers, card outlines |
| Text | `zinc-100` | Primary body text |
| Text Muted | `zinc-400` | Labels, helper text |

All colours are applied as Tailwind utility classes directly in JSX — no CSS variables or custom properties.

---

## Typography

- **Font**: System sans-serif (Tailwind default — no custom font loaded)
- **Scale**: Tailwind's default type scale; `text-xs` dominates inside modals and cards, `text-sm` for body, `text-lg`/`text-xl` for headings
- **Weight**: `font-bold` for headings and labels; `font-medium` for interactive elements; regular for body text
- **Mono**: `font-mono` used exclusively for code snippets inside theory drops

---

## Component Patterns

### Modal Primitive (`src/components/ui/Modal.tsx`)
- Dark overlay + centred panel
- Props: `open`, `onClose`, `title`, `subtitle`
- All feature modals (`PlanIntakeModal`, `DailyMCQModal`, etc.) are composed inside this primitive

### TaskCard Pattern (`src/components/TaskVault.tsx`, `TodayExecutionQueue.tsx`)
- Rounded `xl` border, `zinc-900` surface, `amber-500` accent on active/hover
- Progress bar driven by `progress.percentage` from the AI task object
- Substeps rendered as a checklist below the card body

---

## Responsive Breakpoints

- `sm:` (640px) — used for two-column grids in forms and card layouts
- No `md:` or `lg:` breakpoints in current component set
- Mobile-first: single column is the base layout everywhere
