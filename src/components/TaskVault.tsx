import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  Clock,
  Layers,
  Filter,
  CheckCircle2,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import { TaskItem, Priority, TaskCategory, TaskModality } from '../types';

interface TaskVaultProps {
  tasks: TaskItem[];
  onTransferToToday: (taskId: string) => void;
  onAddTask: (newTask: Partial<TaskItem>) => void;
  onOpenIntake: () => void;
}

export const TaskVault: React.FC<TaskVaultProps> = ({
  tasks,
  onTransferToToday,
  onAddTask,
  onOpenIntake,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'learning' | 'backlog'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newMinutes, setNewMinutes] = useState<number>(25);
  const [newCategory, setNewCategory] = useState<TaskCategory>('learning');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      description: 'Custom added task',
      priority: newPriority,
      estimatedMinutes: Number(newMinutes) || 20,
      category: newCategory,
      type: newMinutes > 30 ? 'screen-task' : 'audio-task',
      heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: Number(newMinutes) || 20 },
      inTodayQueue: false,
      status: 'todo',
    });

    setNewTitle('');
    setIsQuickAddOpen(false);
  };

  // Filter tasks that are in backlog or all
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'backlog') return !t.inTodayQueue;
    if (filter === 'high') return t.priority === 'high';
    if (filter === 'learning') return t.category === 'learning';
    return true;
  });

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Task Vault &amp; Plan Backlog
            </h3>
            <p className="text-xs text-zinc-400">
              All entered tasks • Transfer to "What to do today" based on priority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
          <button
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Plan Intake</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      {isQuickAddOpen && (
        <form
          onSubmit={handleQuickAdd}
          className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 space-y-3"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter task name..."
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <label>Priority:</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <label>Est. Minutes:</label>
              <input
                type="number"
                min={5}
                max={240}
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <label>Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
              >
                <option value="learning">Learning</option>
                <option value="project">Project</option>
                <option value="deep_work">Deep Work</option>
                <option value="routine">Routine</option>
                <option value="quick_win">Quick Win</option>
              </select>
            </div>

            <button
              type="submit"
              className="ml-auto rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black hover:bg-amber-400"
            >
              Add to Vault
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('backlog')}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            filter === 'backlog'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          In Backlog ({tasks.filter((t) => !t.inTodayQueue).length})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            filter === 'high'
              ? 'bg-red-500/20 text-red-300'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => setFilter('learning')}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            filter === 'learning'
              ? 'bg-sky-500/20 text-sky-300'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Learning Skills
        </button>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
              task.inTodayQueue
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {task.priority}
                </span>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedMinutes}m</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{task.title}</h4>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2.5 text-xs">
              <span className="text-[10px] text-zinc-500 capitalize">
                {task.category} • {(task.type || 'unknown').replace('-', ' ')}
              </span>

              {task.inTodayQueue ? (
                <span className="flex items-center gap-1 font-bold text-[11px] text-amber-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>In Today's Queue</span>
                </span>
              ) : (
                <button
                  onClick={() => onTransferToToday(task.id)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-amber-500 hover:text-black transition-colors"
                >
                  <span>Transfer to Today</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
