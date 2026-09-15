import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { TaskSubstep } from '../../types';

interface TaskSubstepsProps {
  taskId: string;
  substeps: TaskSubstep[];
  onToggleSubstep: (taskId: string, substepId: string) => void;
}

export function TaskSubsteps({ taskId, substeps, onToggleSubstep }: TaskSubstepsProps) {
  if (!substeps || substeps.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5 pl-1">
      {substeps.map((sub) => (
        <div
          key={sub.id}
          onClick={() => onToggleSubstep(taskId, sub.id)}
          className="flex items-start gap-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer group"
        >
          <div className="mt-0.5 shrink-0">
            {sub.done ? (
              <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Square className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-500/50 transition-colors" />
            )}
          </div>
          <span className={`leading-relaxed ${sub.done ? 'line-through text-zinc-600' : ''}`}>
            {sub.text}
          </span>
        </div>
      ))}
    </div>
  );
}
