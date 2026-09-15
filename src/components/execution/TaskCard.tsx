import React from 'react';
import { 
  ArrowUp, ArrowDown, Trash2, Flame, HelpCircle, Clock
} from 'lucide-react';
import { TaskItem } from '../../types';
import { TaskSubsteps } from './TaskSubsteps';
import { ContextualContentPreview } from './ContextualContentPreview';

interface TaskCardProps {
  task: TaskItem;
  index: number;
  totalTasks: number;
  isCompleted: boolean;
  onToggleSubstep: (taskId: string, substepId: string) => void;
  startTwoMinuteKickstart?: (task: TaskItem) => void;
  onOpenUnblocker?: (task: TaskItem) => void;
  onMovePriority?: (taskId: string, direction: 'up' | 'down') => void;
  onRemoveFromToday?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  totalTasks,
  isCompleted,
  onToggleSubstep,
  startTwoMinuteKickstart,
  onOpenUnblocker,
  onMovePriority,
  onRemoveFromToday
}) => {

  return (
    <div className={`p-4 transition-colors ${
      isCompleted ? 'bg-zinc-900/50 opacity-60' : 'bg-zinc-900'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Core Task Info */}
        <div className="flex items-start gap-4 flex-1 w-full">
          {/* Status Indicator / Number */}
          <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
              isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {index + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  task.priority === 'high'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : task.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}>
                {task.priority}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-800">
                <Clock className="h-3 w-3" />
                {task.estimatedMinutes}m
              </span>
              <span className="text-[10px] text-zinc-500 capitalize bg-zinc-800/30 px-2 py-0.5 rounded">
                {(task.type || task.category || 'task').replace('-', ' ')}
              </span>
            </div>
            
            <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
              {task.title}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {task.description}
            </p>

            {/* Progress Bar */}
            {task.progress && task.progress.total > 0 && (
              <div className="mt-2.5 max-w-sm">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Progress</span>
                  <span>{task.progress.completed} / {task.progress.total}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${task.progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Substeps */}
            <TaskSubsteps 
              taskId={task.id} 
              substeps={task.substeps || []} 
              onToggleSubstep={onToggleSubstep} 
            />

            {/* Contextual Content Preview */}
            <ContextualContentPreview content={task.contextual_content} />
          </div>
        </div>

        {/* Ordering & Quick Action Controls */}
        <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
          {!isCompleted && startTwoMinuteKickstart && onOpenUnblocker && (
            <div className="flex sm:flex-col gap-1 mr-auto sm:mr-0">
              <button
                onClick={() => startTwoMinuteKickstart(task)}
                className="flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1.5 text-[10px] font-bold text-amber-500 hover:bg-amber-500/20 transition-colors"
                title="2-Minute starter"
              >
                <Flame className="h-3 w-3" />
                <span className="sm:hidden">2m Starter</span>
              </button>
              <button
                onClick={() => onOpenUnblocker(task)}
                className="flex items-center justify-center gap-1 rounded-lg bg-zinc-800/50 px-2 py-1.5 text-[10px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                title="Stuck? Unblock"
              >
                <HelpCircle className="h-3 w-3" />
                <span className="sm:hidden">Unblock</span>
              </button>
            </div>
          )}
          
          {onMovePriority && onRemoveFromToday && (
            <div className="flex gap-1">
              <button
                onClick={() => onMovePriority(task.id, 'up')}
                disabled={index === 0}
                className="rounded-lg p-1.5 bg-zinc-800/30 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 transition-colors"
                title="Move Up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onMovePriority(task.id, 'down')}
                disabled={index === totalTasks - 1}
                className="rounded-lg p-1.5 bg-zinc-800/30 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-30 transition-colors"
                title="Move Down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onRemoveFromToday(task.id)}
                className="rounded-lg p-1.5 bg-zinc-800/30 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-colors ml-1"
                title="Move back to backlog"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
