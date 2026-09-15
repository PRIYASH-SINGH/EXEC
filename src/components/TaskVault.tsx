import React, { useState } from 'react';
import { Plus, ListTodo, Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { TaskItem, Priority, TaskCategory } from '../types';

interface TaskVaultProps {
  tasks: TaskItem[];
  onTransferToToday: (taskId: string) => void;
  onOpenIntake: () => void;
  onQuickAdd?: (title: string, priority: Priority, category: TaskCategory, mins: number) => void;
}

export const TaskVault: React.FC<TaskVaultProps> = ({
  tasks,
  onTransferToToday,
  onOpenIntake,
  onQuickAdd,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'learning' | 'backlog'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('project');
  const [newMinutes, setNewMinutes] = useState(25);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && onQuickAdd) {
      onQuickAdd(newTitle, newPriority, newCategory, newMinutes);
      setNewTitle('');
      setIsQuickAddOpen(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
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
              Task Vault & Plan Backlog
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
              className="ml-auto rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              Add to Vault
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-800 pb-2 text-xs">
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
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Learning Skills
        </button>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 auto-rows-max">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 h-full ${
              task.inTodayQueue
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {task.priority}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedMinutes}m</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-zinc-100 line-clamp-1">{task.title}</h4>
              <p className="text-xs text-zinc-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {task.description}
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
              <span className="text-[10px] font-medium text-zinc-500 capitalize bg-zinc-900 px-2 py-1 rounded">
                {task.category} • {(task.type || 'task').replace('-', ' ')}
              </span>
              
              {task.inTodayQueue ? (
                <span className="flex items-center gap-1 font-bold text-[11px] text-amber-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>In Queue</span>
                </span>
              ) : (
                <button
                  onClick={() => onTransferToToday(task.id)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors"
                >
                  <span>Transfer</span>
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
