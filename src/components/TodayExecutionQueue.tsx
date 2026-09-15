import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Flame,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { TaskItem } from '../types';
import { playChime } from '../services/notifications';

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
  // Timer state for active task
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const todayTasks = tasks
    .filter((t) => t.inTodayQueue)
    .sort((a, b) => {
      // Completed items go to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.todayOrder - b.todayOrder;
    });

  const pendingToday = todayTasks.filter((t) => t.status !== 'completed');
  const completedToday = todayTasks.filter((t) => t.status === 'completed');

  // Next task to perform first
  const nextToPerformFirst = pendingToday[0] || null;

  // Active task object
  const activeTask = todayTasks.find((t) => t.id === activeTaskId) || nextToPerformFirst;

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playChime('timer_end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTaskTimer = (task: TaskItem, minutes: number = task.estimatedMinutes) => {
    setActiveTaskId(task.id);
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
    playChime('click');
  };

  const startTwoMinuteKickstart = (task: TaskItem) => {
    setActiveTaskId(task.id);
    setTimerSeconds(120); // 2 minutes
    setIsTimerRunning(true);
    playChime('click');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalMinutesToday = todayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const completionPercentage = todayTasks.length > 0
    ? Math.round((completedToday.length / todayTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Priority #1 "Next to Perform First" Hero Spotlight */}
      {nextToPerformFirst && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 p-5 shadow-xl shadow-amber-500/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                  <Zap className="h-3 w-3 fill-black" />
                  Perform First • Top Priority
                </span>
                <span className="rounded-lg bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">
                  ~{nextToPerformFirst.estimatedMinutes} mins
                </span>
                <span className="rounded-lg bg-zinc-800/80 px-2 py-0.5 text-xs capitalize text-zinc-400">
                  {nextToPerformFirst.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {nextToPerformFirst.title}
              </h2>
              <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                {nextToPerformFirst.description}
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => startTwoMinuteKickstart(nextToPerformFirst)}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/60 bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all"
                title="Only 120 seconds to shatter initial procrastination"
              >
                <Flame className="h-4 w-4 text-amber-400" />
                <span>2-Min Starter</span>
              </button>

              <button
                onClick={() => startTaskTimer(nextToPerformFirst)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <Play className="h-4 w-4 fill-black" />
                <span>Focus Sprint</span>
              </button>

              <button
                onClick={() => onOpenUnblocker(nextToPerformFirst)}
                className="flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800/80 p-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                title="Stuck? Open anti-friction unblocker"
              >
                <HelpCircle className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Active Timer Banner if this task is timing */}
          {activeTask?.id === nextToPerformFirst.id && timerSeconds > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/30 bg-black/40 p-3 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="font-mono text-2xl font-black tracking-wider text-amber-400">
                  {formatTime(timerSeconds)}
                </div>
                <div className="text-xs text-zinc-400">
                  {timerSeconds <= 120 ? '⚡ 2-Minute Activation Burst' : 'In execution zone'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="rounded-lg bg-zinc-800 p-2 text-zinc-200 hover:bg-zinc-700"
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setTimerSeconds(0)}
                  className="rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:text-zinc-200"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    onToggleTaskStatus(nextToPerformFirst.id);
                    setTimerSeconds(0);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Execution Queue Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                What To Do Today
              </h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {completedToday.length}/{todayTasks.length} Done
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Prioritized execution stack • {totalMinutesToday}m planned
            </p>
          </div>

          {/* Quick Context Action Helper */}
          <button
            onClick={onOpenContextMatcher}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Multi-task with real-world activity</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Empty State */}
        {todayTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-500">
              <Zap className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              No tasks selected for today yet
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Transfer tasks from your Plan / Task Vault below based on priority to build your high-momentum execution list.
            </p>
          </div>
        )}

        {/* Task Cards List */}
        <div className="space-y-3">
          {todayTasks.map((task, index) => {
            const isCompleted = task.status === 'completed';
            const isFirst = index === 0 && !isCompleted;

            return (
              <div
                key={task.id}
                className={`group rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-zinc-800/40 bg-zinc-950/40 opacity-60'
                    : isFirst
                    ? 'border-amber-500/40 bg-zinc-900/90 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                } p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Status Checkbox & Title */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className="mt-0.5 rounded-lg p-0.5 text-zinc-400 hover:text-emerald-400 transition-colors"
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <div className="h-5 w-5 rounded-md border-2 border-zinc-600 hover:border-amber-400 transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-500">
                          #{index + 1}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'high'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <Clock className="h-3 w-3" />
                          {task.estimatedMinutes}m
                        </span>
                        <span className="text-[11px] text-zinc-500 capitalize">
                          {(task.type || task.category || 'task').replace('-', ' ')}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Substeps if available */}
                      {task.substeps && task.substeps.length > 0 && (
                        <div className="mt-2 space-y-1 pl-1">
                          {task.substeps.map((sub) => (
                            <div
                              key={sub.id}
                              onClick={() => onToggleSubstep(task.id, sub.id)}
                              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                            >
                              {sub.done ? (
                                <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Square className="h-3.5 w-3.5 text-zinc-600" />
                              )}
                              <span className={sub.done ? 'line-through text-zinc-500' : ''}>
                                {sub.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ordering & Quick Action Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isCompleted && (
                      <>
                        <button
                          onClick={() => startTwoMinuteKickstart(task)}
                          className="hidden sm:flex items-center gap-1 rounded-lg bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-colors"
                          title="2-Minute starter"
                        >
                          <Flame className="h-3 w-3 text-amber-400" />
                          <span>2m</span>
                        </button>
                        <button
                          onClick={() => onOpenUnblocker(task)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          title="Stuck? Unblock"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onMovePriority(task.id, 'up')}
                      disabled={index === 0}
                      className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onMovePriority(task.id, 'down')}
                      disabled={index === todayTasks.length - 1}
                      className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveFromToday(task.id)}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                      title="Move back to backlog"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
