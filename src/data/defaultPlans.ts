import { TaskItem, LearningPlan, TheoryDrop } from '../types';

export const INITIAL_LEARNING_PLANS: LearningPlan[] = [
  {
    id: 'plan-java-dsa-core',
    title: 'Java Core Repair + DSA Foundations',
    subjectOrSkill: 'Java, DSA',
    description: 'Structured daily execution plan to repair Java fundamentals and build core DSA array skills within a strict 75-minute daily budget.',
    totalDays: 5,
    currentDay: 1,
    daily_time_available: 75,
    activity_windows: ['07:00-08:30', '17:30-19:00'],
    quiet_hours: ['22:00-06:00'],
    dropsPerDay: 3,
    intervalMinutes: 25,
    isIntervalActive: true,
    todayCompleted: false,
    createdDate: '2026-09-15',
    mastery_nodes: [
      { id: 'node-java-core', concept: 'Java Core Mechanics', status: 'learning' },
      { id: 'node-wrappers', concept: 'Wrapper Classes: parseInt vs valueOf', parent: 'node-java-core', status: 'locked' },
      { id: 'node-strings', concept: 'String Methods & Immutability', parent: 'node-java-core', status: 'locked' },
      { id: 'node-oop', concept: 'OOP Essentials', parent: 'node-java-core', status: 'locked' },
      { id: 'node-comparators', concept: 'Comparable vs Comparator', parent: 'node-java-core', status: 'locked' },
      { id: 'node-dsa-core', concept: 'DSA Foundations', status: 'locked' },
      { id: 'node-arrays', concept: 'Arrays Basics', parent: 'node-dsa-core', status: 'locked' },
      { id: 'node-prefix-sum', concept: 'Prefix / Suffix Sum', parent: 'node-dsa-core', status: 'locked' },
    ],
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-j-1',
    title: 'Audio Review: parseInt vs valueOf Mechanics',
    description: 'Listen to the breakdown of memory allocation differences between returning primitives vs objects in Java.',
    priority: 'high',
    estimatedMinutes: 15,
    category: 'learning',
    type: 'audio-task',
    heed: { hands: 'Free', eyes: 'Free', ears: 'Busy', duration: 15 },
    inTodayQueue: true,
    todayOrder: 1,
    status: 'in_progress',
    planId: 'plan-java-dsa-core',
    progress: { total: 1, completed: 0, percentage: 0 },
    substeps: [
      { id: 's-j1', text: 'Start audio breakdown during a walk or chore', done: false },
    ],
    contextual_content: {
      audio_script: "Today we are looking at Integer.parseInt versus Integer.valueOf. It's a classic interview trap. parseInt returns a primitive int. That means it doesn't create a new object on the heap, saving memory. valueOf, on the other hand, returns an Integer object. However, watch out for the Integer cache. Java caches Integer objects from -128 to 127. If you use valueOf in that range, it reuses the object, but outside that range, it creates a new one. Remember: parseInt for primitives, valueOf for objects."
    },
    requires_triage: false,
  },
  {
    id: 'task-j-2',
    title: 'Dry Run: String Methods & Immutability',
    description: 'Write down memory references for String concat vs StringBuilder.append() on paper to visualize the String Pool.',
    priority: 'high',
    estimatedMinutes: 35,
    category: 'deep_work',
    type: 'paper-task',
    heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: 35 },
    inTodayQueue: true,
    todayOrder: 2,
    status: 'todo',
    planId: 'plan-java-dsa-core',
    progress: { total: 2, completed: 0, percentage: 0 },
    substeps: [
      { id: 's-j2', text: 'Draw HEAP vs String Pool memory blocks', done: false },
      { id: 's-j3', text: 'Map out variable references for 3 distinct string operations', done: false },
    ],
    requires_triage: false,
  },
  {
    id: 'task-j-3',
    title: 'Implementation: OOP Essentials Skeleton',
    description: 'Draft a class hierarchy skeleton (Abstract class -> Concrete class) highlighting polymorphic method calls.',
    priority: 'medium',
    estimatedMinutes: 25,
    category: 'project',
    type: 'screen-task',
    heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: 25 },
    inTodayQueue: true,
    todayOrder: 3,
    status: 'todo',
    planId: 'plan-java-dsa-core',
    progress: { total: 2, completed: 0, percentage: 0 },
    substeps: [
      { id: 's-j4', text: 'Define abstract Base entity with a final method', done: false },
      { id: 's-j5', text: 'Extend with 2 concrete classes overriding a common behavior', done: false },
    ],
    contextual_content: {
      micro_flashcards: [
        { q: "Can an abstract class have a constructor?", a: "Yes, it is called when a concrete subclass is instantiated." },
        { q: "What is polymorphism?", a: "The ability of an object to take on many forms, typically via method overriding." }
      ]
    },
    requires_triage: false,
  },
];

export const INITIAL_THEORY_DROPS: TheoryDrop[] = [];

