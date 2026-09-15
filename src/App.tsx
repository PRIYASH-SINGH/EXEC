import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  CheckCircle2,
  BookOpen,
  Compass,
  Bell,
  Sparkles,
  ListTodo,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { TaskItem, LearningPlan, TheoryDrop } from './types';
import {
  INITIAL_LEARNING_PLANS,
  INITIAL_TASKS,
  INITIAL_THEORY_DROPS,
} from './data/defaultPlans';
import { Header } from './components/Header';
import { TodayExecutionQueue } from './components/TodayExecutionQueue';
import { TaskVault } from './components/TaskVault';
import { IntervalTheoryView } from './components/IntervalTheoryView';
import { RealWorldContextDrawer } from './components/RealWorldContextDrawer';
import { PlanIntakeModal } from './components/PlanIntakeModal';
import { DailyMCQModal } from './components/DailyMCQModal';
import { ProcrastinationUnblockerModal } from './components/ProcrastinationUnblockerModal';
import { generateTheoryDrop } from './services/api';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  playChime,
} from './services/notifications';

export default function App() {
  // Persistence via localStorage with clean fallbacks
  const [plans, setPlans] = useState<LearningPlan[]>(() => {
    const saved = localStorage.getItem('exec_plans');
    return saved ? JSON.parse(saved) : INITIAL_LEARNING_PLANS;
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const saved = localStorage.getItem('exec_active_plan');
    return saved || INITIAL_LEARNING_PLANS[0].id;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('exec_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [theoryDrops, setTheoryDrops] = useState<TheoryDrop[]>(() => {
    const saved = localStorage.getItem('exec_theory_drops');
    return saved ? JSON.parse(saved) : INITIAL_THEORY_DROPS;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('exec_streak');
    return saved ? Number(saved) : 3;
  });


  const [isTodayCompleted, setIsTodayCompleted] = useState<boolean>(() => {
    const saved = localStorage.getItem('exec_today_completed');
    return saved === 'true';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  // Modal & Drawer visibility states
  const [isContextMatcherOpen, setIsContextMatcherOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isDailyMCQOpen, setIsDailyMCQOpen] = useState(false);
  const [unblockingTask, setUnblockingTask] = useState<TaskItem | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isGeneratingDrop, setIsGeneratingDrop] = useState(false);
  const [inAppAlert, setInAppAlert] = useState<{ title: string; subtitle: string } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('exec_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('exec_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('exec_theory_drops', JSON.stringify(theoryDrops));
  }, [theoryDrops]);

  useEffect(() => {
    localStorage.setItem('exec_active_plan', activePlanId);
  }, [activePlanId]);

  useEffect(() => {
    localStorage.setItem('exec_streak', streakDays.toString());
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem('exec_today_completed', isTodayCompleted.toString());
  }, [isTodayCompleted]);

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0];

  // Request browser notification toggle
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        sendBrowserNotification('EXEC Notifications Active', {
          body: 'You will receive 1-5 min theory micro-reads at intervals and daily MCQ reminders.',
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Trigger next theory micro-read drop (1-5 min read)
  const handleTriggerNextDrop = async () => {
    if (isGeneratingDrop) return;
    setIsGeneratingDrop(true);

    try {
      const planDrops = theoryDrops.filter((d) => d.planId === activePlan.id);
      const nextIndex = planDrops.length + 1;
      const prevConcepts = planDrops.map((d) => d.keyConcept);

      const generated = await generateTheoryDrop(
        activePlan.title,
        activePlan.subjectOrSkill,
        activePlan.currentDay,
        nextIndex,
        prevConcepts
      );

      const newDrop: TheoryDrop = {
        ...generated,
        id: `drop-${Date.now()}`,
        planId: activePlan.id,
        deliveredAt: new Date().toISOString(),
        isRead: false,
      };

      setTheoryDrops((prev) => [...prev, newDrop]);
      playChime('drop');

      // Trigger notification & in-app banner
      const notificationTitle = `Theory Drop #${nextIndex}: ${newDrop.title}`;
      sendBrowserNotification(notificationTitle, {
        body: `⚡ ${newDrop.readTimeMinutes} min micro-read: ${newDrop.keyConcept}`,
      });

      setInAppAlert({
        title: notificationTitle,
        subtitle: `⚡ ${newDrop.readTimeMinutes} min read delivered • ${newDrop.keyConcept}`,
      });

      // Award 15 XP for receiving interval drop

      setTimeout(() => setInAppAlert(null), 7000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDrop(false);
    }
  };

  // Mark theory drop as read
  const handleMarkDropAsRead = (dropId: string) => {
    setTheoryDrops((prev) =>
      prev.map((d) => (d.id === dropId ? { ...d, isRead: true } : d))
    );
  };

  // Transfer task from backlog to today based on priority
  const handleTransferToToday = (taskId: string) => {
    setTasks((prev) => {
      const highestOrder = prev
        .filter((t) => t.inTodayQueue)
        .reduce((max, t) => Math.max(max, t.todayOrder || 0), 0);

      return prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            inTodayQueue: true,
            todayOrder: highestOrder + 1,
          };
        }
        return t;
      });
    });
    playChime('click');
  };

  // Remove from today back to backlog
  const handleRemoveFromToday = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, inTodayQueue: false } : t))
    );
  };

  // Reorder today queue
  const handleMovePriority = (taskId: string, direction: 'up' | 'down') => {
    setTasks((prev) => {
      const today = prev
        .filter((t) => t.inTodayQueue)
        .sort((a, b) => a.todayOrder - b.todayOrder);

      const index = today.findIndex((t) => t.id === taskId);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === today.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const currentTask = today[index];
      const targetTask = today[targetIndex];

      const currentOrder = currentTask.todayOrder;
      const targetOrder = targetTask.todayOrder;

      return prev.map((t) => {
        if (t.id === currentTask.id) return { ...t, todayOrder: targetOrder };
        if (t.id === targetTask.id) return { ...t, todayOrder: currentOrder };
        return t;
      });
    });
  };

  // Toggle task status
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'completed';
          if (!isDone) {
            playChime('complete');
          }
          return {
            ...t,
            status: isDone ? 'todo' : 'completed',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  // Toggle substep
  const handleToggleSubstep = (taskId: string, substepId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.substeps) {
          const newSubsteps = t.substeps.map((s) =>
            s.id === substepId ? { ...s, done: !s.done } : s
          );
          
          let progress = t.progress;
          if (progress) {
            const completed = newSubsteps.filter(s => s.done).length;
            progress = {
              ...progress,
              completed,
              percentage: progress.total > 0 ? Math.round((completed / progress.total) * 100) : 0
            };
          }

          return {
            ...t,
            substeps: newSubsteps,
            progress
          };
        }
        return t;
      })
    );
  };

  // Add custom task
  const handleAddTask = (newTask: Partial<TaskItem>) => {
    const created: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'New Task',
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      estimatedMinutes: newTask.estimatedMinutes || 25,
      category: newTask.category || 'learning',
      type: newTask.type || 'screen-task',
      heed: newTask.heed || { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: 25 },
      inTodayQueue: false,
      todayOrder: 99,
      status: 'todo',
      planId: activePlanId,
    };
    setTasks((prev) => [created, ...prev]);
    playChime('click');
  };

  // Import plan from AI breakdown
  const handleImportPlan = (newPlan: LearningPlan, newTasks: TaskItem[]) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setTasks((prev) => [...newTasks, ...prev]);
    playChime('complete');
  };

  // Daily MCQ completion handler
  const handleMarkDayCompleted = (score: number) => {
    setIsTodayCompleted(true);
    setStreakDays((prev) => prev + 1);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === activePlanId
          ? {
              ...p,
              todayCompleted: true,
              currentDay: Math.min(p.currentDay + 1, p.totalDays),
            }
          : p
      )
    );
  };

  const unreadDropsCount = theoryDrops.filter(
    (d) => d.planId === activePlanId && !d.isRead
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Navigation Header */}
      <Header
        plans={plans}
        activePlanId={activePlanId}
        onSelectPlan={setActivePlanId}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenContextMatcher={() => setIsContextMatcherOpen(true)}
        onOpenDailyMCQ={() => setIsDailyMCQOpen(true)}
        streakDays={streakDays}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        isTodayCompleted={isTodayCompleted}
        unreadDropsCount={unreadDropsCount}
        onOpenTheoryDrops={() => {
          const el = document.getElementById('section-theory');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Live In-App Notification Banner */}
      {inAppAlert && (
        <div className="fixed top-16 right-4 z-40 max-w-md animate-in slide-in-from-top-3 duration-300">
          <div className="rounded-2xl border border-sky-500/40 bg-zinc-900 p-4 shadow-2xl shadow-sky-500/10 flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-bold text-white">{inAppAlert.title}</h4>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {inAppAlert.subtitle}
              </p>
            </div>
            <button
              onClick={() => setInAppAlert(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Execution Dashboard */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
        {/* Active Plan Meta Bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Active Execution Plan
              </span>
              <span className="text-xs text-zinc-400">
                Day {activePlan.currentDay} of {activePlan.totalDays}
              </span>
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">
              {activePlan.title}
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl">{activePlan.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsContextMatcherOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Match Real-World Activity</span>
            </button>

            <button
              onClick={() => setIsDailyMCQOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                isTodayCompleted
                  ? 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>{isTodayCompleted ? 'Day Verified Complete ✅' : 'Take Daily MCQ Test'}</span>
            </button>
          </div>
        </div>

        {/* Core Layout: Primary Today Execution Queue + Side Panels */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: What to do today & Priority Hero (7 cols) */}
          <section className="lg:col-span-7 space-y-6">
            <TodayExecutionQueue
              tasks={tasks}
              onToggleTaskStatus={handleToggleTaskStatus}
              onRemoveFromToday={handleRemoveFromToday}
              onMovePriority={handleMovePriority}
              onToggleSubstep={handleToggleSubstep}
              onOpenUnblocker={(t) => setUnblockingTask(t)}
              onOpenContextMatcher={() => setIsContextMatcherOpen(true)}
              activeTaskId={activeTaskId}
              setActiveTaskId={setActiveTaskId}
            />
          </section>

          {/* Right Column: Theory Micro-Reads & Task Backlog (5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            {/* Interval Theory Micro-Reads (1-5 min) */}
            <div id="section-theory">
              <IntervalTheoryView
                plan={activePlan}
                theoryDrops={theoryDrops}
                onTriggerNextDrop={handleTriggerNextDrop}
                onMarkAsRead={handleMarkDropAsRead}
                isGeneratingDrop={isGeneratingDrop}
              />
            </div>

            {/* Task Vault & Backlog (Transfer to Today based on Priority) */}
            <TaskVault
              tasks={tasks}
              onTransferToToday={handleTransferToToday}
              onAddTask={handleAddTask}
              onOpenIntake={() => setIsIntakeOpen(true)}
            />
          </section>
        </div>
      </main>

      {/* Modals & Drawers */}
      <RealWorldContextDrawer
        isOpen={isContextMatcherOpen}
        onClose={() => setIsContextMatcherOpen(false)}
        tasks={tasks}
        onSelectTaskToExecute={(taskId) => {
          handleTransferToToday(taskId);
          setActiveTaskId(taskId);
        }}
        onCompleteTask={(taskId) => handleToggleTaskStatus(taskId)}
      />

      <PlanIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onImportPlan={handleImportPlan}
      />

      <DailyMCQModal
        isOpen={isDailyMCQOpen}
        onClose={() => setIsDailyMCQOpen(false)}
        planTitle={activePlan.title}
        theoryDrops={theoryDrops.filter((d) => d.planId === activePlan.id)}
        completedTasks={tasks.filter((t) => t.status === 'completed')}
        isTodayCompleted={isTodayCompleted}
        onMarkDayCompleted={handleMarkDayCompleted}
      />

      <ProcrastinationUnblockerModal
        task={unblockingTask}
        onClose={() => setUnblockingTask(null)}
        onStartFocusSprint={(t) => {
          handleTransferToToday(t.id);
          setActiveTaskId(t.id);
        }}
      />
    </div>
  );
}
