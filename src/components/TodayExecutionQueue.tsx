import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { TaskItem } from '../types';
import { ActiveTaskHero } from './execution/ActiveTaskHero';
import { TaskCard } from './execution/TaskCard';

interface TodayExecutionQueueProps {
  tasks: TaskItem[];
  onToggleTaskStatus: (taskId: string) => void;
  onRemoveFromToday: (taskId: string) => void;
  onMovePriority: (taskId: string, direction: 'up' | 'down') => void;
  onToggleSubstep: (taskId: string, substepId: string) => void;
  onOpenUnblocker: (task: TaskItem) => void;
  onOpenContextMatcher: () => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
}

export const TodayExecutionQueue: React.FC<TodayExecutionQueueProps> = ({
  tasks,
  onToggleTaskStatus,
  onRemoveFromToday,
  onMovePriority,
  onToggleSubstep,
  onOpenUnblocker,
  onOpenContextMatcher,
  activeTaskId,
  setActiveTaskId,
}) => {
  const todayTasks = tasks
    .filter((t) => t.inTodayQueue)
    .sort((a, b) => a.todayOrder - b.todayOrder);

  // Auto-set the first uncompleted task as active if none is set
  useEffect(() => {
    if (!activeTaskId && todayTasks.length > 0) {
      const firstUncompleted = todayTasks.find((t) => t.status !== 'completed');
      if (firstUncompleted) {
        setActiveTaskId(firstUncompleted.id);
      }
    }
  }, [todayTasks, activeTaskId, setActiveTaskId]);

  const activeTask = todayTasks.find((t) => t.id === activeTaskId);

  if (todayTasks.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
        <div className="mb-4 rounded-full bg-zinc-900 p-4">
          <Sparkles className="h-8 w-8 text-amber-500/50" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-zinc-100">Queue is empty</h3>
        <p className="max-w-md text-sm text-zinc-400">
          Your daily execution queue is clear. Pull tasks from the backlog or take a break.
        </p>
      </div>
    );
  }

  const handleCompleteActiveTask = (taskId: string) => {
    onToggleTaskStatus(taskId);
    
    // Find next uncompleted task
    const currentIndex = todayTasks.findIndex(t => t.id === taskId);
    const nextTask = todayTasks.slice(currentIndex + 1).find(t => t.status !== 'completed');
    if (nextTask) {
      setActiveTaskId(nextTask.id);
    } else {
      setActiveTaskId(null);
    }
  };

  const handleSkipActiveTask = () => {
    if (!activeTask) return;
    const currentIndex = todayTasks.findIndex(t => t.id === activeTask.id);
    const nextTask = todayTasks.slice(currentIndex + 1).find(t => t.status !== 'completed');
    if (nextTask) {
      setActiveTaskId(nextTask.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Today's Execution</h2>
          <p className="text-sm text-zinc-400">Execute ruthlessly. Protect the focus window.</p>
        </div>
        <button
          onClick={onOpenContextMatcher}
          className="hidden sm:flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Context Matcher
        </button>
      </div>

      {activeTask && activeTask.status !== 'completed' && (
        <ActiveTaskHero 
          task={activeTask} 
          onComplete={handleCompleteActiveTask} 
          onSkip={handleSkipActiveTask} 
        />
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
        <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-300">Up Next</h3>
          <span className="text-xs text-zinc-500 font-mono">
            {todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length} Done
          </span>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {todayTasks.map((task, index) => {
            const isCompleted = task.status === 'completed';
            
            return (
              <TaskCard 
                key={task.id}
                task={task}
                index={index}
                totalTasks={todayTasks.length}
                isCompleted={isCompleted}
                onToggleSubstep={onToggleSubstep}
                startTwoMinuteKickstart={onOpenUnblocker} 
                onOpenUnblocker={onOpenUnblocker}
                onMovePriority={onMovePriority}
                onRemoveFromToday={onRemoveFromToday}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
