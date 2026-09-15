import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  Flame,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MCQQuestion, TheoryDrop, TaskItem } from '../types';
import { generateDailyMCQTest } from '../services/api';
import { playChime } from '../services/notifications';

interface DailyMCQModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTitle: string;
  theoryDrops: TheoryDrop[];
  completedTasks: TaskItem[];
  isTodayCompleted: boolean;
  onMarkDayCompleted: (score: number) => void;
}

export const DailyMCQModal: React.FC<DailyMCQModalProps> = ({
  isOpen,
  onClose,
  planTitle,
  theoryDrops,
  completedTasks,
  isTodayCompleted,
  onMarkDayCompleted,
}) => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);

  useEffect(() => {
    if (isOpen && questions.length === 0) {
      loadQuiz();
    }
  }, [isOpen]);

  const loadQuiz = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});
    try {
      const generated = await generateDailyMCQTest(planTitle, theoryDrops, completedTasks);
      setQuestions(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectAnswer = (qId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setScorePercentage(percent);
    setIsSubmitted(true);

    if (percent >= 60) {
      // Triumphant chime and confetti!
      playChime('complete');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onMarkDayCompleted(percent);
    } else {
      playChime('timer_end');
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const isPassed = isSubmitted && scorePercentage >= 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">End-of-Day MCQ Mastery Test</h2>
              <p className="text-xs text-zinc-400">
                Complete the test to verify today's execution and mark the day completed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 animate-spin">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-zinc-200">
                Generating daily mastery questions from today's tasks and theory drops...
              </p>
              <p className="text-xs text-zinc-500">
                Targeting core principles you practiced today.
              </p>
            </div>
          )}

          {/* Test Status Banner */}
          {!isLoading && isSubmitted && (
            <div
              className={`rounded-2xl border p-5 text-center space-y-2 ${
                isPassed
                  ? 'border-emerald-500/50 bg-emerald-950/30'
                  : 'border-red-500/50 bg-red-950/30'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isPassed ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-400" />
                )}
                <h3 className="text-lg font-black text-white">
                  {isPassed ? 'Day Successfully Completed!' : 'Mastery Threshold Not Reached'}
                </h3>
              </div>
              <p className="text-xs text-zinc-300">
                You scored <span className="font-bold text-white">{scorePercentage}%</span> (Passing score: 60%).
              </p>
              {isPassed ? (
                <div className="flex items-center justify-center gap-3 pt-2 text-xs font-semibold text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
                    Streak Extended!
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </span>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={loadQuiz}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry Daily Test</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Questions List */}
          {!isLoading && questions.length > 0 && (
            <div className="space-y-6">
              {questions.map((q, qIndex) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const selectedOpt = userAnswers[q.id];
                const isCorrect = isSubmitted && selectedOpt === q.correctAnswerIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 font-mono text-xs font-bold text-zinc-300 shrink-0">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
                          {q.question}
                        </h4>
                      </div>
                      <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 shrink-0">
                        {q.conceptTested}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-2 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        let optionStyle = 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700';

                        if (isSubmitted) {
                          if (optIdx === q.correctAnswerIndex) {
                            optionStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-red-500 bg-red-950/50 text-red-300';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-amber-500 bg-amber-500/10 text-amber-200 font-semibold';
                        }

                        return (
                          <button
                            type="button"
                            key={optIdx}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            disabled={isSubmitted}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs transition-all ${optionStyle}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 font-mono text-[10px]">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {isSubmitted && (
                      <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-xs pl-8">
                        <span className="font-bold text-zinc-300">Explanation: </span>
                        <span className="text-zinc-400">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit Controls */}
              {!isSubmitted && (
                <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                  <span className="text-xs text-zinc-400">
                    {answeredCount} of {questions.length} answered
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={answeredCount < questions.length}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <span>Submit &amp; Verify Day Completion</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
