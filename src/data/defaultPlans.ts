import { TaskItem, LearningPlan, TheoryDrop } from '../types';

export const INITIAL_LEARNING_PLANS: LearningPlan[] = [
  {
    id: 'plan-ml-101',
    title: 'Machine Learning & Neural Nets Sprint',
    subjectOrSkill: 'Deep Learning & Neural Network Architectures',
    description: 'A 7-day execution blueprint covering backprop, loss functions, CNNs, and model evaluation.',
    totalDays: 7,
    currentDay: 1,
    daily_time_available: 120,
    activity_windows: ['08:00-10:00', '18:00-20:00'],
    quiet_hours: ['22:00-06:00'],
    dropsPerDay: 3,
    intervalMinutes: 45,
    isIntervalActive: true,
    todayCompleted: false,
    createdDate: '2026-09-15',
    mastery_nodes: [
      { id: 'mn-1', concept: 'Neural Networks Core', status: 'learning' },
      { id: 'mn-2', concept: 'Backpropagation', parent: 'mn-1', status: 'locked' },
      { id: 'mn-3', concept: 'Loss Functions', parent: 'mn-1', status: 'locked' },
    ],
  },
  {
    id: 'plan-fullstack',
    title: 'Full-Stack App Execution',
    subjectOrSkill: 'System Design, RESTful APIs & React State',
    description: 'Practical build sprint from database schema to containerized deployment.',
    totalDays: 5,
    currentDay: 1,
    daily_time_available: 180,
    activity_windows: ['09:00-12:00', '15:00-18:00'],
    quiet_hours: ['23:00-07:00'],
    dropsPerDay: 3,
    intervalMinutes: 60,
    isIntervalActive: false,
    todayCompleted: false,
    createdDate: '2026-09-14',
    mastery_nodes: [
      { id: 'mn-4', concept: 'System Design', status: 'learning' },
      { id: 'mn-5', concept: 'RESTful APIs', parent: 'mn-4', status: 'locked' },
    ],
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Derive Backpropagation & Gradient Descent Intuition',
    description: 'Work through the chain rule mechanics for a 2-layer perceptron on paper.',
    priority: 'high',
    estimatedMinutes: 25,
    category: 'learning',
    type: 'paper-task',
    heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: 25 },
    inTodayQueue: true,
    todayOrder: 1,
    status: 'in_progress',
    planId: 'plan-ml-101',
    substeps: [
      { id: 's-1', text: 'Draw 2-layer forward pass computation graph', done: true },
      { id: 's-2', text: 'Compute partial derivatives for weights W2', done: true },
      { id: 's-3', text: 'Apply chain rule backward for hidden layer W1', done: false },
    ],
    requires_triage: false,
  },
  {
    id: 't-2',
    title: 'Listen to Podcast Breakdown: Transformer Attention Heads',
    description: 'Review the intuition behind Query, Key, Value vectors during commute or chores.',
    priority: 'medium',
    estimatedMinutes: 15,
    category: 'learning',
    type: 'audio-task',
    heed: { hands: 'Free', eyes: 'Free', ears: 'Busy', duration: 15 },
    inTodayQueue: true,
    todayOrder: 2,
    status: 'todo',
    planId: 'plan-ml-101',
    substeps: [
      { id: 's-4', text: 'Plug in headphones and start audio player', done: false },
      { id: 's-5', text: 'Mentally visualize the Q-K dot product matrix', done: false },
    ],
    requires_triage: false,
  },
  {
    id: 't-3',
    title: 'Clean Dataset & Handle Missing Values in Pandas',
    description: 'Preprocess raw sensor data, impute missing medians, normalize feature scales.',
    priority: 'high',
    estimatedMinutes: 30,
    category: 'project',
    type: 'screen-task',
    heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: 30 },
    inTodayQueue: true,
    todayOrder: 3,
    status: 'todo',
    planId: 'plan-ml-101',
    substeps: [
      { id: 's-6', text: 'Inspect null counts across 12 feature columns', done: false },
      { id: 's-7', text: 'Apply StandardScaler and check distributions', done: false },
    ],
    requires_triage: false,
  },
  {
    id: 't-4',
    title: 'Mental Flashcard Review: Bias vs Variance Tradeoff',
    description: 'Test recall of high variance symptoms (overfitting, big train-val gap) while taking a short walk.',
    priority: 'low',
    estimatedMinutes: 10,
    category: 'quick_win',
    type: 'audio-task',
    heed: { hands: 'Free', eyes: 'Free', ears: 'Busy', duration: 10 },
    inTodayQueue: false,
    todayOrder: 4,
    status: 'todo',
    planId: 'plan-ml-101',
    requires_triage: false,
  },
  {
    id: 't-5',
    title: 'Configure Docker Container & Test API Port Binding',
    description: 'Write Dockerfile multi-stage build and verify local port forwarding on port 3000.',
    priority: 'medium',
    estimatedMinutes: 20,
    category: 'project',
    type: 'screen-task',
    heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: 20 },
    inTodayQueue: false,
    todayOrder: 5,
    status: 'todo',
    planId: 'plan-fullstack',
    requires_triage: false,
  },
  {
    id: 't-6',
    title: 'Review System Design: Rate Limiting Algorithms',
    description: 'Quick read on Token Bucket vs Leaky Bucket tradeoffs.',
    priority: 'low',
    estimatedMinutes: 12,
    category: 'learning',
    type: 'audio-task',
    heed: { hands: 'Free', eyes: 'Free', ears: 'Busy', duration: 12 },
    inTodayQueue: false,
    todayOrder: 6,
    status: 'todo',
    planId: 'plan-fullstack',
    requires_triage: true,
  },
];

export const INITIAL_THEORY_DROPS: TheoryDrop[] = [
  {
    id: 'drop-1',
    planId: 'plan-ml-101',
    dayNumber: 1,
    dropIndex: 1,
    title: 'Activation Functions: Why Non-Linearity Matters',
    readTimeMinutes: 3,
    keyConcept: 'Without non-linear activations, stacking 100 neural layers collapses mathematically into a single linear regression.',
    content: `### 1. The Core Paradox
Imagine stacking 10 linear transformations: $y = W_3(W_2(W_1 x + b_1) + b_2) + b_3$. Mathematically, this collapses into a single matrix multiplication $y = W_{combined} x + b_{combined}$. No matter how deep your network is, it can only draw straight decision boundaries.

### 2. The Solution: Non-Linear Gates
Activation functions introduce curvature, allowing networks to approximate any arbitrary mathematical function (Universal Approximation Theorem):
- **ReLU (Rectified Linear Unit)**: $f(x) = \max(0, x)$. Fast to compute, prevents gradient saturation for positive inputs, but can suffer from "dead neurons" if inputs stay negative.
- **GELU / SiLU**: Smooth, probabilistic approximations favored in modern LLMs and Transformers (e.g. GPT-4, Gemini, LLaMA).
- **Softmax**: Normalizes raw logits into a valid probability distribution where all outputs sum to 1.0.

### 3. Actionable Takeaway
When debugging vanishing gradients in deep networks, inspect if ReLU activations died out due to high learning rates pushing weights permanently into negative territory.`,
    deliveredAt: '2026-09-15T08:30:00.000Z',
    isRead: true,
  },
  {
    id: 'drop-2',
    planId: 'plan-ml-101',
    dayNumber: 1,
    dropIndex: 2,
    title: 'Cross-Entropy Loss vs Mean Squared Error',
    readTimeMinutes: 2,
    keyConcept: 'Use Cross-Entropy for probabilities and classification; use MSE strictly for continuous regression targets.',
    content: `### 1. Intuition in 60 Seconds
Why shouldn't you use Mean Squared Error (MSE) for classification? Because when combined with sigmoid or softmax outputs, MSE produces a non-convex loss landscape with plateaus where gradients vanish to near zero—causing training to stall!

### 2. The Cross-Entropy Advantage
Cross-Entropy penalizes overconfident wrong predictions exponentially:
$L = -\\sum y_i \\log(\\hat{y}_i)$
- If the true label is 1 and your model predicts 0.99, loss is nearly 0.
- If your model predicts 0.01 with 99% confidence in the wrong direction, loss blows up towards infinity! This provides a massive gradient push to steer the model back on track.

### 3. Quick Rule of Thumb
- Categorical prediction (e.g., Dog vs Cat, Topic Classification) $\\rightarrow$ **Cross-Entropy**.
- Continuous scalar prediction (e.g., House Price, Temperature) $\\rightarrow$ **MSE or Huber Loss**.`,
    deliveredAt: '2026-09-15T10:15:00.000Z',
    isRead: false,
  },
];
