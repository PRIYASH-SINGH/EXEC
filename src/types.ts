export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'learning' | 'project' | 'routine' | 'deep_work' | 'quick_win';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskModality = 'screen-task' | 'paper-task' | 'audio-task' | 'physical-task';

export interface HEEDMatrix {
  hands: 'Free' | 'Busy';
  eyes: 'Free' | 'Busy';
  ears: 'Free' | 'Busy';
  duration: number; // in minutes
}

export interface TaskSubstep {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedMinutes: number;
  category: TaskCategory;
  type: TaskModality;
  heed: HEEDMatrix;
  inTodayQueue: boolean;
  todayOrder: number;
  status: TaskStatus;
  completedAt?: string;
  planId?: string;
  substeps?: TaskSubstep[];
  requires_triage?: boolean;
}

export interface MasteryNode {
  id: string;
  concept: string;
  parent?: string; // id of parent node
  status: 'locked' | 'learning' | 'mastered';
}

export interface LearningPlan {
  id: string;
  title: string;
  subjectOrSkill: string;
  description: string;
  totalDays: number;
  currentDay: number;
  daily_time_available: number;
  activity_windows: string[];
  quiet_hours: string[];
  dropsPerDay: number;
  intervalMinutes: number;
  lastDropAt?: string;
  isIntervalActive: boolean;
  todayCompleted: boolean;
  createdDate: string;
  mastery_nodes: MasteryNode[];
}

export interface TheoryDrop {
  id: string;
  planId: string;
  dayNumber: number;
  dropIndex: number;
  title: string;
  readTimeMinutes: number;
  content: string;
  keyConcept: string;
  deliveredAt: string;
  isRead: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
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
  repetition_injection?: string[];
  completedAt?: string;
}

export interface ContextMatchResponse {
  currentActivity: string;
  recommendedTaskId: string;
  whyCompatible: string;
  executionStrategy: string;
  handsFreeAudioOption?: string;
  mindsetBooster: string;
  alternativeTaskIds: string[];
}

export interface ProcrastinationUnblockResponse {
  taskId: string;
  taskTitle: string;
  frictionDiagnosis: string;
  twoMinuteFirstStep: string;
  momentumMicroAction: string;
  countdownMinutes: number;
}
