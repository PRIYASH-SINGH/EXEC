import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { TaskItem, LearningPlan } from '../types';
import { breakdownPlanWithAI } from '../services/api';

interface PlanIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPlan: (newPlan: LearningPlan, newTasks: TaskItem[]) => void;
}

const TEMPLATES = [
  {
    title: 'Machine Learning & Neural Nets Sprint',
    subject: 'Machine Learning & PyTorch',
    type: 'learning',
    sample: `1. Understand Backprop and gradient descent mechanics (25 mins)\n2. Implement a 2-layer Neural Network from scratch in Python (40 mins)\n3. Convolutional Networks & Feature maps (30 mins)\n4. Hyperparameter tuning and Cross-Validation (20 mins)\n5. Mini project: MNIST digit classifier with 98% accuracy (45 mins)`,
  },
  {
    title: 'Full-Stack SaaS Build Sprint',
    subject: 'React, Node.js & Database Architecture',
    type: 'project',
    sample: `1. Design Relational Schema & Migration scripts (35 mins)\n2. Setup Express REST endpoints with JWT authentication (45 mins)\n3. Build responsive React dashboard with optimistic UI updates (50 mins)\n4. Integrate Payment Webhooks and test idempotency (30 mins)\n5. Deploy container to Cloud Run with automated CI/CD (25 mins)`,
  },
  {
    title: 'Data Structures & Algorithms Mastery',
    subject: 'Trees, Graphs & Dynamic Programming',
    type: 'learning',
    sample: `1. Binary Search Trees & Tree Traversals (Inorder/Preorder/Postorder) (25 mins)\n2. Graph BFS vs DFS & Cycle Detection (30 mins)\n3. Dijkstra's Shortest Path Algorithm (35 mins)\n4. 1D Dynamic Programming: Fibonacci & Coin Change (30 mins)\n5. 2D DP: Longest Common Subsequence (40 mins)`,
  },
];

export const PlanIntakeModal: React.FC<PlanIntakeModalProps> = ({
  isOpen,
  onClose,
  onImportPlan,
}) => {
  const [planTitle, setPlanTitle] = useState('');
  const [subjectOrSkill, setSubjectOrSkill] = useState('');
  const [planType, setPlanType] = useState<'learning' | 'project'>('learning');
  const [rawPlanText, setRawPlanText] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setPlanTitle(tmpl.title);
    setSubjectOrSkill(tmpl.subject);
    setPlanType(tmpl.type as 'learning' | 'project');
    setRawPlanText(tmpl.sample);
  };

  const handleDeconstruct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawPlanText.trim()) return;

    setIsProcessing(true);
    try {
      const generatedTasks = await breakdownPlanWithAI(rawPlanText, planType);
      const planId = `plan-${Date.now()}`;

      const newPlan: LearningPlan = {
        id: planId,
        title: planTitle.trim() || 'Custom Execution Plan',
        subjectOrSkill: subjectOrSkill.trim() || planTitle.trim() || 'Execution Sprint',
        description: `Plan with ${generatedTasks.length} actionable execution milestones.`,
        totalDays: 7,
        currentDay: 1,
        daily_time_available: 120,
        activity_windows: ['09:00-11:00', '15:00-17:00'],
        quiet_hours: ['22:00-07:00'],
        dropsPerDay: 3,
        intervalMinutes: Number(intervalMinutes) || 45,
        isIntervalActive: planType === 'learning',
        todayCompleted: false,
        createdDate: new Date().toISOString().split('T')[0],
        mastery_nodes: [],
      };

      const finalTasks: TaskItem[] = generatedTasks.map((t, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        title: t.title || `Task #${idx + 1}`,
        description: t.description || 'Action step',
        priority: (t.priority as any) || (idx === 0 ? 'high' : 'medium'),
        estimatedMinutes: t.estimatedMinutes || 25,
        category: (t.category as any) || (planType === 'learning' ? 'learning' : 'project'),
        type: 'screen-task',
        heed: { hands: 'Busy', eyes: 'Busy', ears: 'Free', duration: t.estimatedMinutes || 25 },
        inTodayQueue: idx < 2, // Put the first 2 tasks immediately in today's queue!
        todayOrder: idx + 1,
        status: 'todo',
        planId: planId,
        substeps: (t.substeps as any) || [
          { id: `s-${idx}-1`, text: 'Setup environment and review prerequisites', done: false },
          { id: `s-${idx}-2`, text: 'Execute core focus block', done: false },
        ],
      }));

      onImportPlan(newPlan, finalTasks);
      onClose();
    } catch (err) {
      console.error('Plan breakdown error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Plan or Project</h2>
              <p className="text-xs text-zinc-400">
                Paste your AI-generated plan, custom notes, or project syllabus
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

        {/* Form Body */}
        <form onSubmit={handleDeconstruct} className="p-6 space-y-5">
          {/* Quick Preset Templates */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Quick Start Templates
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TEMPLATES.map((tmpl) => (
                <button
                  type="button"
                  key={tmpl.title}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-left hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 group-hover:text-amber-400">
                    {tmpl.type === 'learning' ? (
                      <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                    ) : (
                      <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="line-clamp-1">{tmpl.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2">
                    {tmpl.subject}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Plan Meta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Plan / Project Title
              </label>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="e.g. Distributed Systems & Raft Consensus"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Core Subject / Skill
              </label>
              <input
                type="text"
                value={subjectOrSkill}
                onChange={(e) => setSubjectOrSkill(e.target.value)}
                placeholder="e.g. System Design, React, Spanish"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Type & Interval config */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Category</label>
              <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => setPlanType('learning')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                    planType === 'learning'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Learning Skill / Subject
                </button>
                <button
                  type="button"
                  onClick={() => setPlanType('project')}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${
                    planType === 'project'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Build Project / Execution
                </button>
              </div>
            </div>

            {planType === 'learning' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Theory Drop Interval
                </label>
                <select
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value={30}>Every 30 minutes (Fast Sprint)</option>
                  <option value={45}>Every 45 minutes (Standard)</option>
                  <option value={60}>Every 60 minutes (Deep Work)</option>
                  <option value={120}>Every 2 hours</option>
                </select>
              </div>
            )}
          </div>

          {/* Plan Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Plan Details, Syllabus, or AI Prompt Output
              </label>
              <span className="text-[11px] text-zinc-500">
                Paste raw tasks, outline, or AI plan
              </span>
            </div>
            <textarea
              rows={6}
              value={rawPlanText}
              onChange={(e) => setRawPlanText(e.target.value)}
              placeholder={`Paste any messy AI-generated plan or syllabus here:
e.g.
Day 1: Theory of neural network activations
Day 2: Implement loss functions and backpropagation
Day 3: Write Convolutional layers
...`}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !rawPlanText.trim()}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Deconstructing with Gemini...</span>
                </>
              ) : (
                <>
                  <span>Breakdown into Actionable Tasks</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
