import React from 'react';
import {
  Zap,
  Flame,
  Bell,
  BellRing,
  Compass,
  CheckCircle2,
  BookOpen,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { LearningPlan } from '../types';

interface HeaderProps {
  plans: LearningPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenIntake: () => void;
  onOpenContextMatcher: () => void;
  onOpenDailyMCQ: () => void;
  streakDays: number;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  isTodayCompleted: boolean;
  unreadDropsCount: number;
  onOpenTheoryDrops: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenIntake,
  onOpenContextMatcher,
  onOpenDailyMCQ,
  streakDays,
  notificationsEnabled,
  onToggleNotifications,
  isTodayCompleted,
  unreadDropsCount,
  onOpenTheoryDrops,
}) => {
  const activePlan = plans.find((p) => p.id === activePlanId);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Plan Selector */}
        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-black text-black shadow-lg shadow-amber-500/20">
              <Zap className="h-5 w-5 fill-black stroke-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">EXEC</span>
                <span className="hidden rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 sm:inline-block">
                  ACTION ENGINE
                </span>
              </div>
            </div>
          </div>

          {/* Active Plan Selector Dropdown */}
          <div className="hidden items-center gap-2 sm:flex">
            <select
              value={activePlanId}
              onChange={(e) => onSelectPlan(e.target.value)}
              aria-label="Active Execution Plan"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 focus:border-amber-500 focus:outline-none"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (Day {p.currentDay}/{p.totalDays})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenIntake}
              title="Import or Enter New Plan / Tasks"
              className="flex items-center gap-1 rounded-lg border border-dashed border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Add Plan</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Gamification */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-World Context Matcher Trigger */}
          <button
            id="btn-context-matcher"
            onClick={onOpenContextMatcher}
            className="group relative flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:bg-amber-500/20 hover:border-amber-500"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <Compass className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-45" />
            <span className="hidden sm:inline">What are you doing right now?</span>
            <span className="sm:hidden">Context AI</span>
          </button>

          {/* Micro-Read Theory Drops Button */}
          <button
            onClick={onOpenTheoryDrops}
            className="relative flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
            title="Interval Theory Micro-Reads"
          >
            <BookOpen className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden md:inline">Theory Drops</span>
            {unreadDropsCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-black">
                {unreadDropsCount}
              </span>
            )}
          </button>

          {/* Daily MCQ Completion Button */}
          <button
            onClick={onOpenDailyMCQ}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isTodayCompleted
                ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'border border-emerald-500 bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isTodayCompleted ? 'Day Done ✅' : 'Daily MCQ'}</span>
          </button>

          {/* Gamification Stats: Streak */}
          <div className="hidden items-center gap-2 pl-1 lg:flex">
            <div
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-orange-400"
              title={`${streakDays} Day Execution Streak`}
            >
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span>{streakDays}d</span><ShieldCheck className="h-3.5 w-3.5 text-zinc-500 ml-1" title="1 Streak Shield Available" />
            </div>
          </div>

          {/* Notification Permission Toggle */}
          <button
            onClick={onToggleNotifications}
            title={notificationsEnabled ? 'Interval notifications active' : 'Enable browser notifications'}
            className={`rounded-lg p-1.5 text-zinc-400 transition-colors ${
              notificationsEnabled ? 'text-amber-400 hover:text-amber-300' : 'hover:text-zinc-200'
            }`}
          >
            {notificationsEnabled ? (
              <BellRing className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
