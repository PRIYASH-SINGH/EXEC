import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  BellRing,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Zap,
} from 'lucide-react';
import { TheoryDrop, LearningPlan } from '../types';
import { speakText, stopSpeaking, playChime } from '../services/notifications';

interface IntervalTheoryViewProps {
  plan: LearningPlan;
  theoryDrops: TheoryDrop[];
  onTriggerNextDrop: () => Promise<void>;
  onMarkAsRead: (dropId: string) => void;
  isGeneratingDrop: boolean;
}

export const IntervalTheoryView: React.FC<IntervalTheoryViewProps> = ({
  plan,
  theoryDrops,
  onTriggerNextDrop,
  onMarkAsRead,
  isGeneratingDrop,
}) => {
  const [expandedDropId, setExpandedDropId] = useState<string | null>(
    theoryDrops.length > 0 ? theoryDrops[theoryDrops.length - 1].id : null
  );
  const [speakingDropId, setSpeakingDropId] = useState<string | null>(null);

  const planDrops = theoryDrops.filter((d) => d.planId === plan.id);

  const handleToggleSpeech = (drop: TheoryDrop) => {
    if (speakingDropId === drop.id) {
      stopSpeaking();
      setSpeakingDropId(null);
    } else {
      stopSpeaking();
      setSpeakingDropId(drop.id);
      speakText(`${drop.title}. Key concept: ${drop.keyConcept}. ${drop.content}`, () => {
        setSpeakingDropId(null);
      });
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Interval Theory Micro-Reads
              </h3>
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                1–5 Min Reads
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              High-signal concepts delivered at intervals for {plan.subjectOrSkill}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
            <Clock className="h-3 w-3 text-sky-400" />
            <span>Interval: every {plan.intervalMinutes}m</span>
          </div>

          <button
            onClick={onTriggerNextDrop}
            disabled={isGeneratingDrop}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg shadow-sky-500/20 hover:bg-sky-400 disabled:opacity-50 transition-all"
          >
            {isGeneratingDrop ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Crafting Read...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Deliver Next Drop Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {planDrops.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center space-y-2">
          <p className="text-xs text-zinc-400">
            No theory drops delivered yet for this plan.
          </p>
          <button
            onClick={onTriggerNextDrop}
            disabled={isGeneratingDrop}
            className="text-xs font-bold text-sky-400 hover:underline"
          >
            Click here to trigger your first 2-minute micro-read
          </button>
        </div>
      )}

      {/* Drops List */}
      <div className="space-y-3">
        {planDrops.map((drop, idx) => {
          const isExpanded = expandedDropId === drop.id;
          const isSpeaking = speakingDropId === drop.id;

          return (
            <div
              key={drop.id}
              className={`rounded-xl border transition-all ${
                drop.isRead
                  ? 'border-zinc-800 bg-zinc-950/60'
                  : 'border-sky-500/40 bg-zinc-900/90 shadow-md'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedDropId(isExpanded ? null : drop.id)}
                className="flex cursor-pointer items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 font-mono text-xs font-bold text-sky-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{drop.title}</h4>
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                        ⚡ {drop.readTimeMinutes} min read
                      </span>
                      {drop.isRead && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">
                      {drop.keyConcept}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSpeech(drop);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                      isSpeaking
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                    title={isSpeaking ? 'Stop narration' : 'Listen to Audio'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-amber-500" />
                        <span className="hidden sm:inline">Listen</span>
                      </>
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              </div>

              {/* Expanded Reader Content */}
              {isExpanded && (
                <div className="border-t border-zinc-800/80 p-4 space-y-4 bg-zinc-950/40">
                  {/* Key concept highlight box */}
                  <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 text-xs">
                    <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px]">
                      Core Principle:
                    </span>
                    <p className="mt-1 font-medium text-sky-200 leading-relaxed">
                      {drop.keyConcept}
                    </p>
                  </div>

                  {/* Markdown content formatted */}
                  <div className="text-xs text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line font-sans">
                    {drop.content}
                  </div>

                  {/* Bottom action */}
                  <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
                    <span className="text-[11px] text-zinc-500">
                      Delivered: {new Date(drop.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500">
                        <BookOpen className="h-3 w-3 text-amber-500/50" />
                        Source: NotebookLM Doc {idx % 2 === 0 ? "A" : "B"}
                      </span>
                      {!drop.isRead ? (
                        <button
                          onClick={() => {
                            onMarkAsRead(drop.id);
                            playChime('drop');
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mark as Read</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-400">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
