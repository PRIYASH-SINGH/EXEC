import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { TaskItem, ProcrastinationUnblockResponse } from '../types';
import { unblockProcrastination } from '../services/api';
import { playChime } from '../services/notifications';

interface ProcrastinationUnblockerModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onStartFocusSprint: (task: TaskItem) => void;
}

export const ProcrastinationUnblockerModal: React.FC<ProcrastinationUnblockerModalProps> = ({
  task,
  onClose,
  onStartFocusSprint,
}) => {
  const [unblockData, setUnblockData] = useState<ProcrastinationUnblockResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userObstacle, setUserObstacle] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (task) {
      fetchUnblocker();
    }
  }, [task]);

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

  if (!task) return null;

  const fetchUnblocker = async (customObstacle?: string) => {
    setIsLoading(true);
    setIsTimerRunning(false);
    setTimerSeconds(120);
    try {
      const res = await unblockProcrastination(task.title, task.description, customObstacle);
      setUnblockData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Anti-Procrastination Shield</h2>
              <p className="text-xs text-zinc-400">
                Break activation energy in 120 seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Target Task */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Task Struggling With:
            </span>
            <h3 className="text-sm font-bold text-zinc-100">{task.title}</h3>
          </div>

          {isLoading ? (
            <div className="py-8 text-center space-y-2">
              <Sparkles className="mx-auto h-6 w-6 text-amber-400 animate-spin" />
              <p className="text-xs text-zinc-400">
                Diagnosing psychological friction and crafting 2-minute step...
              </p>
            </div>
          ) : unblockData ? (
            <div className="space-y-4">
              {/* Diagnosis */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs space-y-1">
                <span className="font-bold text-amber-400">Why your brain resists:</span>
                <p className="text-zinc-300 leading-relaxed">
                  {unblockData.frictionDiagnosis}
                </p>
              </div>

              {/* The 2-minute step */}
              <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-500/15 to-transparent p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Flame className="h-4 w-4" />
                  <span>The 120-Second Micro-Action</span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {unblockData.twoMinuteFirstStep}
                </p>
                <div className="text-[11px] text-zinc-400 italic">
                  Rule: You are legally permitted to stop after 2 minutes. The only goal is starting.
                </div>
              </div>

              {/* 120-Second Countdown Timer */}
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/60 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-black text-amber-400">
                    {formatTime(timerSeconds)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {timerSeconds === 0
                      ? '⚡ Friction broken! Momentum unlocked.'
                      : 'Friction breaker clock'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsTimerRunning(!isTimerRunning);
                      playChime('click');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-black" />
                        <span>Start 120s</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTimerSeconds(120);
                      setIsTimerRunning(false);
                    }}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
                    title="Reset"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Transition to full focus sprint */}
              {timerSeconds === 0 && (
                <button
                  onClick={() => {
                    onStartFocusSprint(task);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Ride the Momentum: Start Full Focus Sprint</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : null}

          {/* Custom Obstacle Input */}
          <div className="border-t border-zinc-800/80 pt-3">
            <label className="text-[11px] font-medium text-zinc-400">
              Stuck on something specific? (Distraction, fatigue, confusion)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={userObstacle}
                onChange={(e) => setUserObstacle(e.target.value)}
                placeholder="e.g. Too tired, don't know where to start, phone notifications..."
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => fetchUnblocker(userObstacle)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Re-Diagnose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
