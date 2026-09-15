import React from 'react';
import { 
  Play, Pause, RotateCcw, Flame, CheckCircle2, AlertCircle
} from 'lucide-react';
import { TaskItem } from '../../types';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { useAudioChime } from '../../hooks/useAudioChime';

interface ActiveTaskHeroProps {
  task: TaskItem;
  onComplete: (taskId: string) => void;
  onSkip: () => void;
}

export function ActiveTaskHero({ task, onComplete, onSkip }: ActiveTaskHeroProps) {
  const { playChime } = useAudioChime();
  const initialSeconds = (task.estimatedMinutes || 25) * 60;
  
  const { 
    timeLeft, isActive, formattedTime, toggleTimer, resetTimer 
  } = useCountdownTimer(initialSeconds, () => {
    playChime();
  });

  const progressPercent = 100 - (timeLeft / initialSeconds) * 100;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-amber-500/30 p-6 shadow-2xl shadow-amber-900/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-950">
        <div 
          className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
              <Flame className="h-3 w-3" />
              Active Focus
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              [{(task.type || task.category || 'task').replace('-', ' ').toUpperCase()}]
            </span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">{task.title}</h2>
          <p className="text-sm text-zinc-400">{task.description}</p>
        </div>

        <div className="flex flex-col items-center gap-3 shrink-0 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 w-full md:w-auto">
          <div className="text-4xl font-black tabular-nums tracking-tighter text-amber-500 drop-shadow-sm">
            {formattedTime}
          </div>
          
          <div className="flex items-center gap-2 w-full justify-center">
            <button
              onClick={toggleTimer}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg"
              title={isActive ? 'Pause' : 'Start Focus'}
            >
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onComplete(task.id)}
              className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors border border-emerald-500/30"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
