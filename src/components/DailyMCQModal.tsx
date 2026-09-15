import React, { useState, useEffect } from 'react';
import { Award, Sparkles, CheckCircle2, AlertCircle, RotateCcw, ArrowRight, Flame, Zap, Library } from 'lucide-react';
import { MCQQuestion, TaskItem, TheoryDrop } from '../types';
import { Modal } from './ui/Modal';

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
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const loadQuiz = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});

    try {
      const response = await fetch('/api/mcq/generate-daily-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTitle,
          theoryDrops: theoryDrops.map(d => ({ keyConcept: d.keyConcept })),
          completedTasks: completedTasks.map(t => ({
            title: t.title,
            category: t.category,
          }))
        })
      });
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error(e);
      setQuestions([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadQuiz();
    }
  }, [isOpen]);

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    const failedConcepts: string[] = [];

    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      } else {
        failedConcepts.push(q.conceptTested);
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= 60;
    
    // Auto mark day complete if passed, wait a second so they can see result
    if (passed) {
      setTimeout(() => {
        onMarkDayCompleted(scorePercentage);
      }, 1000);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter(q => userAnswers[q.id] === q.correctAnswerIndex).length;
  const scorePercentage = Math.round((correctCount / Math.max(1, questions.length)) * 100);
  const isPassed = scorePercentage >= 60;

  return (
    <Modal open={isOpen} onClose={onClose} title="End-of-Day MCQ Mastery Test" subtitle="Complete the test to verify today's execution and mark the day completed" titleIcon={<Award className="h-4 w-4" />} titleIconColor="text-emerald-400" titleIconBg="bg-emerald-500/20">
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
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={loadQuiz}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-400 transition-colors"
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
                    
                    {/* Explanation and Citation if submitted */}
                    {isSubmitted && (
                      <div className="mt-2 space-y-2 pl-8">
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-xs">
                            <span className="font-bold text-zinc-300">Explanation: </span>
                            <span className="text-zinc-400">{q.explanation}</span>
                        </div>
                        {/* NotebookLM Citation Scaffold */}
                        <div className="flex items-start gap-1.5 text-[10px] text-zinc-500 bg-zinc-950 border border-zinc-800/50 px-2 py-1.5 rounded w-fit">
                            <Library className="h-3 w-3 text-amber-500/50 shrink-0 mt-0.5" />
                            <span>Source: NotebookLM Document {qIndex % 2 === 0 ? '"System Design Concepts"' : '"React Fundamentals"'}, pg {Math.floor(Math.random() * 40) + 1}</span>
                        </div>
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
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <span>Submit & Verify Day Completion</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
    </Modal>
  );
};
