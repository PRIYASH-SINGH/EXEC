import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Headphones,
  Footprints,
  Utensils,
  Bus,
  Laptop,
  Moon,
} from 'lucide-react';
import { TaskItem, ContextMatchResponse } from '../types';
import { matchRealWorldContext } from '../services/api';
import { speakText, stopSpeaking } from '../services/notifications';

interface RealWorldContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  onSelectTaskToExecute: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

const PRESET_ACTIVITIES = [
  { label: 'Washing dishes / doing chores', icon: Utensils },
  { label: 'Commuting on bus or train', icon: Bus },
  { label: 'Taking a walk outside', icon: Footprints },
  { label: 'At my desk with dual screens', icon: Laptop },
  { label: 'Waiting in line / idle 5 mins', icon: Clock },
  { label: 'In bed / low energy before sleep', icon: Moon },
];

export const RealWorldContextDrawer: React.FC<RealWorldContextDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTaskToExecute,
  onCompleteTask,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<ContextMatchResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async (activityText: string) => {
    if (!activityText.trim() || tasks.length === 0) return;
    setIsAnalyzing(true);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const result = await matchRealWorldContext(activityText, tasks);
      setMatchResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recommendedTask = tasks.find((t) => t.id === matchResult?.recommendedTaskId);

  const toggleSpeech = (textToRead: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="flex h-full w-full max-w-xl flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Context Execution Matcher</h2>
              <p className="text-xs text-zinc-400">
                Execute tasks without hindering what you are doing in the real world
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Query section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              What are you doing in the real world right now?
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-2">
              {PRESET_ACTIVITIES.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setCustomInput(preset.label);
                      handleAnalyze(preset.label);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 p-2.5 text-left text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-white transition-all"
                  >
                    <IconComponent className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="line-clamp-1">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze(customInput);
              }}
              className="relative mt-2"
            >
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Or type custom activity: e.g. Folding clothes, cooking dinner..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-3.5 pr-24 text-sm text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!customInput.trim() || isAnalyzing}
                className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Match</span>
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Analysis / Results */}
          {isAnalyzing && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                Scanning your tasks for cognitive & physical compatibility...
              </p>
              <p className="text-xs text-zinc-500">
                Finding what you can execute without disturbing your current activity.
              </p>
            </div>
          )}

          {matchResult && recommendedTask && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                      Recommended Parallel Task
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-white leading-snug">
                      {recommendedTask.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-zinc-800/80 px-2 py-1 text-xs text-zinc-300 shrink-0">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    <span>~{recommendedTask.estimatedMinutes}m</span>
                  </div>
                </div>

                {/* Compatibility Explanation */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs space-y-2">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Why it fits without hindering you:</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {matchResult.whyCompatible}
                  </p>
                </div>

                {/* Strategy */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Execution Strategy:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80">
                    {matchResult.executionStrategy}
                  </p>
                </div>

                {/* Hands-Free Audio Option */}
                {matchResult.handsFreeAudioOption && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                        <Headphones className="h-4 w-4" />
                        <span>Hands-Free Audio Option</span>
                      </div>
                      <button
                        onClick={() =>
                          toggleSpeech(
                            `${recommendedTask.title}. ${matchResult.executionStrategy}. ${matchResult.handsFreeAudioOption}`
                          )
                        }
                        className="flex items-center gap-1 rounded-lg bg-sky-500/20 px-2 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition-colors"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="h-3.5 w-3.5" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Listen Narration</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-sky-200/90 leading-relaxed">
                      {matchResult.handsFreeAudioOption}
                    </p>
                  </div>
                )}

                {/* Mindset booster */}
                <div className="text-[11px] italic text-amber-300/80 pl-2 border-l-2 border-amber-500/40">
                  "{matchResult.mindsetBooster}"
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      onSelectTaskToExecute(recommendedTask.id);
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Execute This Now</span>
                  </button>
                  <button
                    onClick={() => {
                      onCompleteTask(recommendedTask.id);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Done</span>
                  </button>
                </div>
              </div>

              {/* Alternative Tasks */}
              {matchResult.alternativeTaskIds && matchResult.alternativeTaskIds.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Other Compatible Tasks
                  </span>
                  <div className="space-y-2">
                    {matchResult.alternativeTaskIds.map((altId) => {
                      const altTask = tasks.find((t) => t.id === altId);
                      if (!altTask) return null;
                      return (
                        <div
                          key={altId}
                          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 hover:border-zinc-700 transition-colors"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">{altTask.title}</h4>
                            <span className="text-[10px] text-zinc-400">
                              ~{altTask.estimatedMinutes}m • {altTask.type || 'unknown'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              onSelectTaskToExecute(altTask.id);
                              onClose();
                            }}
                            className="rounded-lg bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700"
                          >
                            Execute
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
