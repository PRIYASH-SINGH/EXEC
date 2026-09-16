import {
  TaskItem,
  ContextMatchResponse,
  TheoryDrop,
  MCQQuestion,
  ProcrastinationUnblockResponse,
  LearningPlan,
} from '../types';

export async function createLearningPlan(
  userId: string,
  planTitle: string,
  totalDays: number,
  dailyTimeAvailableMinutes: number,
  rawPlanDescription?: string,
  notebooklmNotebookId?: string
): Promise<{ planId: string; createdPlan: LearningPlan }> {
  const response = await fetch('/api/plans/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title: planTitle,
      totalDays,
      dailyTimeAvailableMinutes,
      rawPlan: rawPlanDescription || '',
      notebooklmNotebookId,
    }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create plan: ${response.statusText}`);
  }
  return response.json();
}

export async function getTodayTask(planId: string): Promise<{ task: TaskItem; theoryDrops: TheoryDrop[] }> {
  const response = await fetch(`/api/tasks/today/${planId}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch today task');
  }
  return response.json();
}

export async function generateTheoryDrop(dailyTaskId: string, notebooklmNotebookId?: string): Promise<{ theoryDrop: TheoryDrop }> {
  const response = await fetch('/api/theory/generate-daily-drop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dailyTaskId, notebooklmNotebookId }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate theory drop');
  }
  return response.json();
}

export async function generateDailyMcq(dailyTaskId: string, theoryDropId: string): Promise<{ mcqId: string; questions: MCQQuestion[] }> {
  const response = await fetch('/api/mcq/generate-daily-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dailyTaskId, theoryDropId }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate MCQ');
  }
  return response.json();
}

export async function submitDailyMcq(mcqId: string, answers: { questionId: string; selectedOptionId: string }[]): Promise<{ scorePercentage: number; passed: boolean; feedback: any }> {
  const response = await fetch('/api/mcq/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mcqId, answers }),
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit MCQ answers');
  }
  return response.json();
}

export async function breakdownPlanWithAI(rawPlan: string, planType: string): Promise<Partial<TaskItem>[]> {
  try {
    const res = await fetch('/api/plan/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawPlan, planType }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.tasks || [];
  } catch (error) {
    console.warn('API call failed, using intelligent local breakdown fallback:', error);
    // Graceful fallback parser
    const lines = rawPlan.split('\n').filter((l) => l.trim().length > 0);
    return lines.slice(0, 5).map((line, idx) => ({
      title: line.replace(/^[0-9\-*.)\s]+/, '').slice(0, 70),
      description: `Action item extracted from plan: ${line.trim()}`,
      priority: idx === 0 ? 'high' : idx < 3 ? 'medium' : 'low',
      estimatedMinutes: [15, 25, 30, 45][idx % 4],
      category: idx % 2 === 0 ? 'learning' : 'project',
      type: idx % 2 === 0 ? 'screen-task' : 'paper-task',
      heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: [15, 25, 30, 45][idx % 4] },
      substeps: [
        { id: `fb-s1-${idx}`, text: 'Review prerequisites and scope', done: false },
        { id: `fb-s2-${idx}`, text: 'Execute core 15-minute chunk', done: false },
      ],
    }));
  }
}

export async function matchRealWorldContext(
  currentActivity: string,
  tasks: TaskItem[]
): Promise<ContextMatchResponse> {
  try {
    const res = await fetch('/api/execute/context-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentActivity, tasks }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Context matching fallback applied:', error);
    // Intelligent fallback heuristic based on activity keywords
    const act = currentActivity.toLowerCase();
    const isAudioFriendly = act.includes('wash') || act.includes('dish') || act.includes('walk') || act.includes('commute') || act.includes('bus') || act.includes('drive') || act.includes('cook') || act.includes('clean') || act.includes('fold') || act.includes('gym');
    
    // Find audio or mobile friendly task first if active
    let best = tasks.find(t => isAudioFriendly ? (t.type === 'audio-task' || t.heed.hands === 'Free' || t.heed.eyes === 'Free') : t.priority === 'high');
    if (!best) best = tasks[0];

    return {
      currentActivity,
      recommendedTaskId: best.id,
      whyCompatible: isAudioFriendly 
        ? `While you are ${currentActivity}, physical hands-free actions or audio review allow you to absorb theory or formulate steps without slowing down your chore.`
        : `Since you are ${currentActivity}, this high-leverage task maximizes your current focus window.`,
      executionStrategy: `Keep doing ${currentActivity}. Put on your audio reader or review the core mental bullet points during natural pauses.`,
      handsFreeAudioOption: `Listen to today's 3-minute theory drop or speak out answers to flashcards hands-free.`,
      mindsetBooster: 'Every minute of seamless pairing builds momentum that defeats procrastination.',
      alternativeTaskIds: tasks.filter(t => t.id !== best?.id).slice(0, 2).map(t => t.id),
    };
  }
}

export async function generateDailyMCQTest(
  planTitle: string,
  theoryDrops: TheoryDrop[],
  completedTasks: TaskItem[]
): Promise<MCQQuestion[]> {
  try {
    const res = await fetch('/api/mcq/generate-daily-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planTitle, theoryDrops, completedTasks }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.questions || [];
  } catch (error) {
    console.warn('MCQ generation fallback:', error);
    return [
      {
        id: 'q1',
        question: 'Why are non-linear activation functions necessary in multi-layer neural networks?',
        options: [
          'They decrease the total number of floating point operations to zero',
          'Without them, stacking layers mathematically collapses into a single linear regression',
          'They guarantee 100% training accuracy on any dataset',
          'They replace the need for backpropagation'
        ],
        correctAnswerIndex: 1,
        explanation: 'Linear combinations of linear functions remain strictly linear. Non-linear activations introduce curvature, enabling the network to approximate complex non-linear functions.',
        conceptTested: 'Non-linear Activations',
      },
      {
        id: 'q2',
        question: 'When is Cross-Entropy loss preferred over Mean Squared Error (MSE)?',
        options: [
          'In continuous house price regression',
          'Only when training with zero learning rate',
          'In classification problems where outputs represent probabilities',
          'When data has no labels'
        ],
        correctAnswerIndex: 2,
        explanation: 'Cross-Entropy loss penalizes overconfident wrong probabilities logarithmically, avoiding vanishing gradients on sigmoid/softmax outputs.',
        conceptTested: 'Cross-Entropy vs MSE',
      },
      {
        id: 'q3',
        question: 'What is the primary psychological trigger behind task procrastination?',
        options: [
          'Lack of intelligence',
          'Perceived cognitive friction and high activation energy to start',
          'Having too few browser tabs open',
          'Over-simplification of the goals'
        ],
        correctAnswerIndex: 1,
        explanation: 'Procrastination is an emotional regulation and friction barrier. Lowering the initial commitment to a 2-minute micro-step eliminates activation resistance.',
        conceptTested: 'Execution Psychology',
      },
    ];
  }
}

export async function unblockProcrastination(
  taskTitle: string,
  taskDescription: string,
  userObstacle?: string
): Promise<ProcrastinationUnblockResponse> {
  try {
    const res = await fetch('/api/procrastination/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskTitle, taskDescription, userObstacle }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn('Procrastination unblock fallback:', error);
    return {
      taskId: 'unblock-1',
      taskTitle,
      frictionDiagnosis: 'Your brain perceives the full task as a giant monolithic commitment, triggering natural resistance.',
      twoMinuteFirstStep: `Open your workspace or editor and simply write the title and 1 single bullet point. You are officially allowed to stop after 120 seconds.`,
      momentumMicroAction: 'Once the 2 minutes elapse, you have overcome the activation energy—choose whether to ride the momentum for 10 minutes.',
      countdownMinutes: 2,
    };
  }
}
