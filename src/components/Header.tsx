import React, { useState } from 'react';
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
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activePlan = plans.find((p) => p.id === activePlanId);

  const MobileMenuContent = () => (
    <div className="flex flex-col gap-4 p-4 border-t border-zinc-800 bg-zinc-950">
      {/* Plan Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase">Active Plan</label>
        <select
          value={activePlanId}
          onChange={(e) => {
            onSelectPlan(e.target.value);
            setMobileMenuOpen(false);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-200 focus:border-amber-500 focus:outline-none w-full"
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} (Day {p.currentDay}/{p.totalDays})
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            onOpenIntake();
            setMobileMenuOpen(false);
          }}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors w-full"
        >
          <Plus className="h-4 w-4" />
          Add / Import Plan
        </button>
      </div>

      <div className="h-px bg-zinc-800 w-full" />

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            onOpenContextMatcher();
            setMobileMenuOpen(false);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 transition-all hover:bg-amber-500/20 w-full"
        >
          <Compass className="h-4 w-4 text-amber-400" />
          Context Matcher (AI)
        </button>

        <button
          onClick={() => {
            onOpenTheoryDrops();
            setMobileMenuOpen(false);
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-400 transition-colors w-full"
        >
          <BookOpen className="h-4 w-4" />
          Theory Drops
          {unreadDropsCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-xs font-bold text-black ml-2">
              {unreadDropsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onOpenDailyMCQ();
            setMobileMenuOpen(false);
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all w-full ${
            isTodayCompleted
              ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
              : 'border border-emerald-500 bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isTodayCompleted ? 'Day Complete ✅' : 'Take Daily MCQ'}
        </button>
      </div>

      <div className="h-px bg-zinc-800 w-full" />

      {/* Gamification & Settings */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold text-orange-400">
          <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
          <span>{streakDays}d Streak</span>
          <ShieldCheck className="h-4 w-4 text-zinc-500 ml-2" title="1 Streak Shield Available" />
        </div>

        <button
          onClick={onToggleNotifications}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            notificationsEnabled ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 bg-zinc-900'
          }`}
        >
          {notificationsEnabled ? (
            <><BellRing className="h-4 w-4" /> Notifications On</>
          ) : (
            <><Bell className="h-4 w-4" /> Notifications Off</>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-black text-black shadow-lg shadow-amber-500/20">
            <Zap className="h-5 w-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">EXEC</span>
              <span className="hidden rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 lg:inline-block">
                ACTION ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Nav */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <select
              value={activePlanId}
              onChange={(e) => onSelectPlan(e.target.value)}
              aria-label="Active Execution Plan"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 focus:border-amber-500 focus:outline-none max-w-[150px] md:max-w-[200px] truncate"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenIntake}
              title="Add Plan"
              className="flex items-center justify-center rounded-lg border border-dashed border-zinc-700 p-1.5 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onOpenContextMatcher}
            className="group relative flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:bg-amber-500/20 hover:border-amber-500"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            <Compass className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-45" />
            <span className="hidden lg:inline">What are you doing?</span>
            <span className="hidden md:inline lg:hidden">Context AI</span>
          </button>

          <button
            onClick={onOpenTheoryDrops}
            className="relative flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
            title="Interval Theory Micro-Reads"
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">Drops</span>
            {unreadDropsCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-black">
                {unreadDropsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenDailyMCQ}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isTodayCompleted
                ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border border-emerald-500 bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{isTodayCompleted ? 'Day Done ✅' : 'Daily MCQ'}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-zinc-800">
            <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-orange-400" title="Streak">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              <span>{streakDays}d</span>
            </div>
            <button
              onClick={onToggleNotifications}
              className={`rounded-lg p-1.5 text-zinc-400 transition-colors ${
                notificationsEnabled ? 'text-amber-400 hover:text-amber-300' : 'hover:text-zinc-200'
              }`}
            >
              {notificationsEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="sm:hidden p-2 -mr-2 text-zinc-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

      </div>

      {/* Mobile Menu Expansion */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute w-full left-0 top-full shadow-2xl">
          <MobileMenuContent />
        </div>
      )}
    </header>
  );
};
