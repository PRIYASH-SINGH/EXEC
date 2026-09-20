# EXEC: Code Architecture & Stack Inventory

An architectural evaluation, stack inventory, and code quality assessment of the **EXEC** repository ([PRIYASH-SINGH/EXEC](https://github.com/PRIYASH-SINGH/EXEC)).

---

## 1. Project Overview

- **App Name & Purpose:**  
  **EXEC** (Action Engine) is a hyper-adaptive learning and productivity execution application designed to eliminate procrastination via micro-actions (120-second starters), dynamically schedule tasks around real-world physical and cognitive contexts using the H.E.E.D. matrix (Hands, Eyes, Ears, Duration), deliver spaced interval theory micro-reads, and validate daily learning mastery through gamified end-of-day MCQ tests.
- **Current Tech Stack:**
  - **Frontend:** React 19 (`react@^19.0.1`, `react-dom@^19.0.1`), TypeScript (`~5.8.2`), Vite 6 (`vite@^6.2.3`), Tailwind CSS v4 (`@tailwindcss/vite@^4.1.14`, `tailwindcss@^4.1.14`), Lucide React (`lucide-react@^0.546.0`), Canvas Confetti (`canvas-confetti@^1.9.4`), Motion (`motion@^12.23.24`).
  - **Backend:** Node.js, Express (`express@^4.21.2`), TypeScript runtime via `tsx@^4.21.0`, bundler via `esbuild@^0.25.0`, `@google/genai@^2.4.0` (official Google Gen AI SDK), `dotenv@^17.2.3`.
  - **Database:** None (zero server-side database). Ephemeral client-side state synchronized to browser `localStorage`.
- **Deployment Status:**  
  **Local only / Container-ready scaffold**. Configured for local development via `tsx server.ts` with Vite middleware mode. Includes a production build script (`vite build && esbuild server.ts ...`) targeting a single bundled Node service (`dist/server.cjs`), with environment variables (`GEMINI_API_KEY`, `APP_URL`) prepared for Google Cloud Run / Google AI Studio deployment.

---

## 2. Frontend Architecture

### Framework
- **React 19** Single-Page Application (SPA) bundled with **Vite 6** and configured with full TypeScript strict mode (`tsconfig.json`).

### Current Component Structure & File Tree
```
src/
├── App.tsx                               # Root orchestrator: state management, modals, localStorage sync
├── main.tsx                              # React DOM root entrypoint with StrictMode
├── index.css                             # Tailwind CSS v4 entrypoint (@import "tailwindcss";)
├── types.ts                              # Domain interfaces, union types, and API contract models
├── data/
│   └── defaultPlans.ts                   # Seed data (Java Core + DSA plan, initial tasks, mock drops)
├── services/
│   ├── api.ts                            # HTTP client layer with offline heuristic fallbacks
│   └── notifications.ts                  # Web Notifications, Web Audio API chimes, Web Speech TTS
└── components/
    ├── Header.tsx                        # Top navigation, plan selector, stats, notification toggle
    ├── TodayExecutionQueue.tsx           # Execution dashboard, #1 Priority Hero card, timer & substeps
    ├── TaskVault.tsx                     # Backlog inventory, priority filtering, quick-add form
    ├── IntervalTheoryView.tsx            # Spaced micro-reads, Markdown viewer, TTS narration
    ├── RealWorldContextDrawer.tsx        # Slide-over context matcher (activity presets & custom input)
    ├── PlanIntakeModal.tsx               # AI plan breakdown modal with quick-start templates
    ├── DailyMCQModal.tsx                 # End-of-day quiz modal, scoring, confetti, streak updates
    └── ProcrastinationUnblockerModal.tsx # Anti-friction diagnosis and 120-second starter timer
```

### UI Library
- **No external UI component library** (no Material-UI, Chakra, or Shadcn UI installed).
- All UI elements (modals, slide-out drawers, progress bars, cards, badges, selects, tabs) are **custom handcrafted Tailwind CSS components**.
- Iconography is provided uniformly by `lucide-react`.

### State Management
- **Local React State + Prop Drilling**: Root state is declared and managed inside [`src/App.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/App.tsx) using standard React hooks (`useState`, `useEffect`).
- **No global store library** (no Redux, Zustand, Recoil, or React Context API).
- **Persistence Layer**: Six separate `localStorage` keys synchronized via side-effect `useEffect` hooks:
  - `exec_plans`: Array of `LearningPlan` objects
  - `exec_tasks`: Array of `TaskItem` objects
  - `exec_theory_drops`: Array of `TheoryDrop` objects
  - `exec_active_plan`: Active plan ID string
  - `exec_streak`: Number of consecutive active days
  - `exec_today_completed`: Boolean daily completion flag

### Styling Approach
- **Tailwind CSS v4** utility classes using the modern `@tailwindcss/vite` plugin.
- Dark theme palette: Zinc background (`bg-zinc-950`, `bg-zinc-900`, `border-zinc-800`), Amber accents for execution/momentum (`amber-500`), Emerald for completion/success (`emerald-500`), Sky Blue for interval theory learning (`sky-400`), and Red for friction/high-priority items (`red-500`).
- Micro-animations handled via Tailwind transition utilities and inline keyframe classes (`animate-in`, `animate-pulse`, `animate-spin`).

---

## 3. Backend Architecture

### Language & Framework
- **Language:** TypeScript (`server.ts`) executed via `tsx` in development and bundled using `esbuild` for Node.js CommonJS runtime in production.
- **Framework:** **Express 4.21.2** hosting both the JSON REST API and Vite SPA middleware.

### API Endpoints Implemented
Located in [`server.ts`](file:///c:/Users/Priyash/Documents/EXEC/server.ts):

| Method | Endpoint | Purpose | Request Body | Response Format |
|---|---|---|---|---|
| `POST` | `/api/plan/breakdown` | Deconstructs unstructured syllabi, raw notes, or project ideas into 3–8 concrete, actionable tasks with H.E.E.D. parameters. | `{ rawPlan: string, planType: string }` | `{ tasks: TaskItem[] }` |
| `POST` | `/api/execute/context-match` | Analyzes user's current physical activity (e.g., walking, commuting, desk) and returns the most compatible task without cognitive/physical conflict. | `{ currentActivity: string, tasks: TaskItem[] }` | `ContextMatchResponse` (task ID, rationale, strategy, audio option) |
| `POST` | `/api/theory/generate-drop` | Generates a 1–4 minute (200–350 word) theory micro-lesson drop covering key concepts, intuition, and thought experiments. | `{ planTitle, subjectOrSkill, currentDay, dropIndex, previousConcepts }` | `TheoryDrop` (title, readTimeMinutes, keyConcept, content) |
| `POST` | `/api/mcq/generate-daily-test` | Creates a 3–4 question multiple-choice quiz validating understanding of concepts and completed tasks from today. | `{ planTitle, theoryDrops, completedTasks }` | `{ questions: MCQQuestion[] }` |
| `POST` | `/api/procrastination/unblock` | Diagnoses psychological friction behind a resisted task and provides a 120-second zero-resistance micro-action. | `{ taskTitle, taskDescription, userObstacle? }` | `ProcrastinationUnblockResponse` |

### Authentication Method
- **None**. All endpoints are open and public without authentication, sessions, API keys, or user rate limiting.

### External API Integrations
- **Google Gemini API (`@google/genai` Node SDK)**:
  - Client initialized lazily in `server.ts` using `process.env.GEMINI_API_KEY`.
  - Primary model: `gemini-3.8-flash`.
  - Fallback model: `gemini-3.1-flash-lite` (automatically downgraded if consecutive 503/429 errors persist after 3 attempts).
  - Uses structured JSON mode (`responseMimeType: "application/json"`, `responseSchema: Type.OBJECT / Type.ARRAY`).
  - Implements exponential backoff retry loop (`maxRetries = 6`, exponential delays `2s, 4s, 8s, 16s, 32s`).
- **Browser Web APIs (Client-Side Integrations)**:
  - **Web Speech API (`window.speechSynthesis`)**: Text-to-Speech audio reader in [`src/services/notifications.ts`](file:///c:/Users/Priyash/Documents/EXEC/src/services/notifications.ts) for hands-free audio execution.
  - **Web Audio API (`window.AudioContext`)**: Synthesized zero-asset audio oscillator chimes for interval drops, task completion, and timer expirations.
  - **Web Notification API (`window.Notification`)**: Native desktop/browser notifications for spaced learning drops and reminders.

---

## 4. Database

### Database Type
- **None (No SQL or NoSQL database exists)**.
- Data is entirely ephemeral or client-bound inside browser `localStorage`. No server-side persistence, cache (Redis), or ORM is configured.

### Schema Structure & Current Data Models
All models are defined in [`src/types.ts`](file:///c:/Users/Priyash/Documents/EXEC/src/types.ts):

#### 1. `LearningPlan`
```typescript
export interface LearningPlan {
  id: string;                    // Unique identifier (e.g. "plan-java-dsa-core")
  title: string;                 // Display title
  subjectOrSkill: string;        // Domain subject (e.g. "Java, DSA")
  description: string;           // Plan scope summary
  totalDays: number;             // Total duration in days
  currentDay: number;            // Active day index
  daily_time_available: number;  // Daily time budget in minutes
  activity_windows: string[];    // Time slots (e.g. ["07:00-08:30"])
  quiet_hours: string[];         // Do-not-disturb windows
  dropsPerDay: number;           // Target interval drops per day
  intervalMinutes: number;       // Minutes between theory drops
  lastDropAt?: string;           // ISO timestamp of last generated drop
  isIntervalActive: boolean;     // Whether interval drops are scheduled
  todayCompleted: boolean;       // Whether end-of-day MCQ was passed
  createdDate: string;           // Creation date string
  mastery_nodes: MasteryNode[];  // Hierarchical concept graph
}
```

#### 2. `TaskItem`
```typescript
export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  category: 'learning' | 'project' | 'routine' | 'deep_work' | 'quick_win';
  type: 'screen-task' | 'paper-task' | 'audio-task' | 'physical-task';
  heed: {
    hands: 'Free' | 'Busy';
    eyes: 'Free' | 'Busy';
    ears: 'Free' | 'Busy';
    duration: number;
  };
  inTodayQueue: boolean;         // Flag indicating task is staged for today
  todayOrder: number;            // Priority sorting index
  status: 'todo' | 'in_progress' | 'completed';
  completedAt?: string;
  planId?: string;               // Associated LearningPlan ID
  substeps?: { id: string; text: string; done: boolean }[];
  progress?: { total: number; completed: number; percentage: number };
  contextual_content?: {
    audio_script?: string;
    micro_flashcards?: { q: string; a: string }[];
    technical_breakdown?: {
      snippet?: string;
      dry_run_instructions?: string;
      code_architecture?: string;
    };
  };
}
```

#### 3. `TheoryDrop`
```typescript
export interface TheoryDrop {
  id: string;
  planId: string;
  dayNumber: number;
  dropIndex: number;
  title: string;
  readTimeMinutes: number;
  content: string;               // Markdown-formatted micro-lesson
  keyConcept: string;
  deliveredAt: string;           // ISO timestamp
  isRead: boolean;
}
```

#### 4. `DailyMCQTest` & `MCQQuestion`
```typescript
export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];             // Array of 4 answer options
  correctAnswerIndex: number;    // 0..3
  explanation: string;
  conceptTested: string;
}

export interface DailyMCQTest {
  id: string;
  date: string;
  planTitle: string;
  questions: MCQQuestion[];
  userAnswers: Record<string, number>;
  score?: number;
  passed?: boolean;
  completedAt?: string;
}
```

---

## 5. Current Features Implemented

### Working Features
- **AI Plan Deconstruction**: Intake modal accepts arbitrary text, syllabus, or prompts and generates structured tasks with H.E.E.D. metadata.
- **Client Offline Heuristic Fallbacks**: In [`src/services/api.ts`](file:///c:/Users/Priyash/Documents/EXEC/src/services/api.ts), all 5 endpoints feature comprehensive fallback parsers if the backend API or Gemini is unavailable.
- **Queue Execution & Ordering**:
  - Distinct `#1 Perform First` Hero spotlight card.
  - One-click task ordering (`ArrowUp`, `ArrowDown`) adjusting `todayOrder`.
  - Backlog-to-Today transfer and removal.
  - Substep interactive checklists with real-time percentage progress bars.
- **Anti-Procrastination Kickstarters**:
  - Interactive 120-second friction-breaker countdown timer.
  - Full focus sprint timer with pause, reset, and synthesized audio cues.
- **Real-World Context Matching**: Matches pending tasks against physical activities (dishes, commuting, walking, desk) via Gemini and provides audio playback options.
- **Interval Micro-Reads & Audio Narration**:
  - On-demand generation of 1–5 minute markdown micro-lessons.
  - Browser notifications and custom audio chimes upon drop arrival.
  - Web Speech API integration to read theory lessons out loud.
- **Daily MCQ Mastery Quiz**:
  - Dynamically synthesizes questions from completed tasks and delivered theory drops.
  - 60% passing threshold with canvas-confetti celebration, audio feedback, and streak incrementing.

### Half-Implemented / Broken Features
- **Multi-Plan Task Isolation is Broken**:  
  When a user switches active plans in the dropdown, `activePlanId` updates, but [`TodayExecutionQueue.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/TodayExecutionQueue.tsx) and [`TaskVault.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/TaskVault.tsx) do not filter tasks by `task.planId`. All tasks from all plans are shown simultaneously in a shared queue.
- **Automated Interval Timer is Missing**:  
  Although `LearningPlan.intervalMinutes` (e.g. 25m, 45m) is defined and displayed in the UI, there is no background timer or interval trigger (`setInterval`) that automatically generates or pushes drops. Drops are only generated when the user manually clicks "Deliver Next Drop Now".
- **Mastery Knowledge Graph (`mastery_nodes`) is Completely Unrendered**:  
  `LearningPlan` defines a hierarchical tree of concepts (`mastery_nodes` with `parent` and `status: 'locked' | 'learning' | 'mastered'`), and initial nodes are populated in `defaultPlans.ts`, but there is **no UI component in the codebase** to render or interact with this graph.
- **Audio Script Task Playback**:  
  Tasks generated with `type: 'audio-task'` contain `contextual_content.audio_script`, but unlike the Theory Drop component, there is no audio play/TTS button rendered on the task card to listen to the script.
- **Abandoned XP Feature**:  
  Comments in `App.tsx` and `DailyMCQModal.tsx` reference awarding "15 XP", but the XP state variable and gamification leveling system were removed or left unwritten.

### Missing Critical Features for NotebookLM Integration
- **No NotebookLM API / Document Source Ingestion**: No capability to upload, parse, or index source documents (PDFs, research notes, lecture transcripts).
- **No Source Grounding & Citations**: Neither task breakdowns nor theory drops cite or link back to specific source page numbers or notebook references.
- **No Notebook Synchronization**: Inability to pull generated NotebookLM Study Guides, Audio Overviews (Deep Dives), or FAQs directly into EXEC.

---

## 6. Code Quality Issues

### Styling Inconsistencies
- **Fragmented Accent Colors**:  
  Actions inconsistently toggle between Amber (`amber-500` for primary controls and execution), Emerald (`emerald-500` for MCQ and completion), Sky (`sky-400` for theory drops), and Red/Orange (`red-400`, `orange-400` for streak and anti-procrastination). A single unified primary accent token is missing.
- **Arbitrary Corner Radii**:  
  Inconsistent border radii (`rounded-lg`, `rounded-xl`, `rounded-2xl`) used arbitrarily across inputs, cards, and modal dialogs without design system tokens.
- **Varying Modal Backdrop Opacity**:  
  `DailyMCQModal` uses `bg-black/75`, `PlanIntakeModal` uses `bg-black/70`, and `RealWorldContextDrawer` uses `bg-black/60`.

### UI Alignment Problems
- **Header Overflow on Tablet/Laptop (768px–1024px)**:  
  In [`src/components/Header.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/Header.tsx#L90-L160), the right action group contains the Context Matcher button, Theory button, Daily MCQ button, streak badge, and notification bell. On viewports between 768px and 1024px, these elements crowd the header and cause layout wrapping.
- **Uneven Grid Heights in Task Vault**:  
  In [`src/components/TaskVault.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/TaskVault.tsx#L210-L266), `grid-cols-1 md:grid-cols-2` displays cards with varying vertical heights depending on description lengths and category tags, causing uneven rows and awkward gaps.
- **Substep Alignment**:  
  In [`TodayExecutionQueue.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/TodayExecutionQueue.tsx#L346-L365), substep checkbox icons (`Square`, `CheckSquare`) are not vertically centered with wrapped multi-line substep text.

### Responsive Design Gaps
- **Mobile Plan Selector is Completely Inaccessible**:  
  In [`src/components/Header.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/Header.tsx#L66-L88), the active plan dropdown and the `+ Add Plan` button are marked `hidden sm:flex`. On mobile devices (<640px), the user has **no way to switch plans or import a new plan from the header**.
- **Drawer Viewport Clipping on Mobile**:  
  [`RealWorldContextDrawer.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/RealWorldContextDrawer.tsx#L85) uses `max-w-xl` with fixed padding and lacks mobile safe-area bottom insets, leading to bottom action buttons ("Execute This Now") colliding with mobile browser navigation toolbars.

### Component Reusability Problems
- **Monolithic Component Files**:  
  [`TodayExecutionQueue.tsx`](file:///c:/Users/Priyash/Documents/EXEC/src/components/TodayExecutionQueue.tsx) is over 450 lines of code handling queue sorting, hero spotlight cards, timer intervals, substeps, flashcards, technical code snippets, and audio chimes. It should be decomposed into `<ActiveTaskHero />`, `<TaskCard />`, `<TaskSubsteps />`, and `<ContextualContentPreview />`.
- **Duplicated Timer & Audio Logic**:  
  Countdown timer `setInterval` logic is duplicated across `TodayExecutionQueue.tsx` and `ProcrastinationUnblockerModal.tsx`. A shared custom hook (e.g. `useCountdownTimer`) is missing.
- **Copy-Pasted Modal Scaffolding**:  
  All 4 modals duplicate identical dialog wrappers (`fixed inset-0 z-50 flex items-center justify-center bg-black/... backdrop-blur-sm`, header bar, close icon button) instead of using a shared `<Modal />` primitive.

---

## 7. NotebookLM Integration Points

### 1. Where would NotebookLM API calls happen?
- **Exclusively on the Backend (`server.ts` or a new `src/routes/notebooklm.ts` module)**.
- **Rationale**: NotebookLM / Vertex AI Search integrations require Google Cloud OAuth2 tokens, Service Account credentials, or private API keys. Calling NotebookLM endpoints directly from the browser would expose confidential credentials and trigger Cross-Origin Resource Sharing (CORS) blocks.
- A dedicated backend proxy route pattern:
  ```
  POST /api/notebooklm/notebooks          # List user notebooks
  POST /api/notebooklm/sources/upload     # Upload syllabus / PDFs
  POST /api/notebooklm/synthesize-drops   # Generate grounded theory drops
  POST /api/notebooklm/generate-quiz      # Source-grounded MCQs
  GET  /api/notebooklm/audio-overview     # Retrieve generated audio podcast
  ```

### 2. What data needs to be pulled from NotebookLM?
- **Grounded Study Guides & Briefings**: Source-verified conceptual summaries to populate `TheoryDrop.content` without hallucinations.
- **Audio Overviews (Deep Dive Transcripts & Audio files)**: NotebookLM's dual-host conversational summaries, directly feeding EXEC's `type: 'audio-task'` and H.E.E.D. hands-free commuting/walking modes.
- **Syllabus Key Topics & Prerequisites**: Populating the currently unrendered `LearningPlan.mastery_nodes` knowledge tree.
- **Source Citations**: Exact file names, page numbers, and direct quotes supporting each task substep and theory question.

### 3. How is it currently (not) connected?
- **Currently 100% disconnected**:
  - `server.ts` makes direct calls to Google Gemini (`@google/genai`) using ungrounded generic system prompts.
  - The application lacks any Google OAuth2 flow, Google Drive picker, or file upload endpoint (e.g., Multer multipart file handler for PDFs).
  - While [`AGENTS.md`](file:///c:/Users/Priyash/Documents/EXEC/AGENTS.md) specifies a "Dynamic Source Engine (Context-Aware RAG)", this logic currently only operates on raw text strings passed manually in the intake modal.

---

## 8. Recommended Changes for Next Phase

### Priority 1: Blocking / Core Functionality Fixes
1. **Fix Plan-Task Filtering**:  
   Filter tasks by `task.planId === activePlanId` in `TodayExecutionQueue.tsx` and `TaskVault.tsx` so users do not see cross-plan task pollution.
2. **Expose Mobile Plan Navigation**:  
   Move the plan selector into a responsive mobile dropdown or hamburger drawer in `Header.tsx` so mobile users can manage plans.
3. **Persist State to a Real Database**:  
   Replace `localStorage` with a database (e.g. SQLite via Prisma/Drizzle or Supabase/PostgreSQL) with REST endpoints (`GET /api/plans`, `POST /api/tasks`, `PUT /api/tasks/:id`) to prevent data loss across devices.
4. **API Schema Validation**:  
   Implement runtime payload validation (using `zod`) on all Express endpoints in `server.ts` to guard against malformed JSON or prompt injections.

### Priority 2: Improves UX & Completes Half-Built Features
1. **Automate Interval Theory Drops**:  
   Introduce a Web Worker or client-side background timer in `App.tsx` that evaluates `plan.intervalMinutes` and triggers the next theory drop automatically, accompanied by desktop notifications and audio chimes.
2. **Audio Task Player**:  
   Add a direct "Play Narration" button on any task card where `type === 'audio-task'` to speak `contextual_content.audio_script` hands-free via `speechSynthesis`.
3. **Mastery Graph Component**:  
   Build a visual skill tree / DAG component to render `plan.mastery_nodes` with locked, learning, and mastered states.
4. **Refactor Shared Primitives**:  
   Extract a reusable `<Modal />` component and custom hooks (`useTimer`, `useAudioChime`, `useSpeech`) to eliminate ~400 lines of duplicated code.

### Priority 3: Nice to Have & Deep NotebookLM Integration
1. **NotebookLM & Google Drive Bridge**:  
   Add Google OAuth2 login and Google Drive / NotebookLM file picker to directly import notebooks and PDFs into EXEC.
2. **Grounded Citation Badges**:  
   Display source badges (e.g. `[Doc: JavaConcurrency.pdf, p. 42]`) on theory drops and quiz questions.
3. **PWA & Offline Service Worker**:  
   Configure `vite-plugin-pwa` to cache theory drops and audio scripts for full offline execution while traveling or walking without internet connectivity.
4. **Gamification Progression**:  
   Re-introduce XP levels, streak freeze shields, and weekly execution analytics charts.
