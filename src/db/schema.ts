import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// Learning plans
export const learningPlans = sqliteTable('learning_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  totalDays: integer('total_days').notNull(),
  dailyTimeAvailableMinutes: integer('daily_time_available_minutes').default(60),
  notebooklmNotebookId: text('notebooklm_notebook_id'),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
});

// Daily tasks
export const dailyTasks = sqliteTable('daily_tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text('plan_id').notNull().references(() => learningPlans.id),
  dayNumber: integer('day_number').notNull(),
  topicTitle: text('topic_title').notNull(),
  topicDescription: text('topic_description'),
  conceptKeyword: text('concept_keyword'),
  durationMinutes: integer('duration_minutes').default(45),
  taskType: text('task_type').default('read-and-code'),
  status: text('status').default('pending'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
}, (table) => ({
  index: unique().on(table.planId, table.dayNumber),
}));

// Theory drops
export const theoryDrops = sqliteTable('theory_drops', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  dailyTaskId: text('daily_task_id').notNull().references(() => dailyTasks.id),
  title: text('title').notNull(),
  contentMarkdown: text('content_markdown').notNull(),
  readTimeMinutes: integer('read_time_minutes').notNull(),
  keyConceptsJsonb: text('key_concepts_jsonb'),
  codeExampleSnippet: text('code_example_snippet'),
  notebooklmSourcePage: text('notebooklm_source_page'),
  audioNarrationUrl: text('audio_narration_url'),
  generatedFrom: text('generated_from').default('gemini'),
  generatedAt: integer('generated_at', { mode: 'timestamp' }).defaultNow(),
});

// Daily MCQs
export const dailyMcqs = sqliteTable('daily_mcqs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  dailyTaskId: text('daily_task_id').notNull().references(() => dailyTasks.id),
  quizDate: integer('quiz_date', { mode: 'timestamp' }).notNull(), // Drizzle SQLite integer mode: 'timestamp' or 'number', there's no 'date'.
  questionsJsonb: text('questions_jsonb').notNull(),
  userAnswersJsonb: text('user_answers_jsonb'),
  scorePercentage: integer('score_percentage'),
  passed: integer('passed', { mode: 'boolean' }).default(false),
  attempts: integer('attempts').default(0),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  feedbackJsonb: text('feedback_jsonb'),
  generatedAt: integer('generated_at', { mode: 'timestamp' }).defaultNow(),
});

// User streaks and progress
export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull().references(() => learningPlans.id),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastCompletionDate: integer('last_completion_date', { mode: 'timestamp' }),
  totalTasksCompleted: integer('total_tasks_completed').default(0),
  totalMcqsAttempted: integer('total_mcqs_attempted').default(0),
  totalMcqsPassed: integer('total_mcqs_passed').default(0),
  averageMcqScore: integer('average_mcq_score').default(0),
  streakShieldsUsed: integer('streak_shields_used').default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});
