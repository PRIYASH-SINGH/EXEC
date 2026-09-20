import React, { useState } from 'react';
import { Sparkles, X, ArrowRight, BookOpen, Briefcase, FileText, UploadCloud, Library } from 'lucide-react';
import { Modal } from './ui/Modal';

type PlanType = 'learning' | 'project';

interface PlanIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    userEmail: string;
    planTitle: string;
    rawPlanText: string;
    type: PlanType;
    subjectOrSkill: string;
    intervalMinutes: number;
    sourceMode: 'raw' | 'pdf' | 'notebooklm';
  }) => Promise<void>;
}

const TEMPLATES = [
  {
    title: 'Learn React Core',
    subject: 'React & Hooks',
    type: 'learning' as PlanType,
    text: '1. Understand State and Props\n2. Hooks: useState, useEffect\n3. Context API basics\n4. Routing with React Router',
  },
  {
    title: 'Build Python CLI',
    subject: 'Python Scripting',
    type: 'project' as PlanType,
    text: '1. Argparse basics\n2. File handling and CSV parsing\n3. API requests with requests lib\n4. Publish to PyPI',
  },
  {
    title: 'DSA: Trees & Graphs',
    subject: 'Algorithms',
    type: 'learning' as PlanType,
    text: '1. Tree traversals (Inorder, Preorder)\n2. BFS & DFS on Graphs\n3. Dijkstra shortest path\n4. Dynamic Programming on Trees',
  }
];

export const PlanIntakeModal: React.FC<PlanIntakeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceMode, setSourceMode] = useState<'raw' | 'pdf' | 'notebooklm'>('raw');
  
  const [userEmail, setUserEmail] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [rawPlanText, setRawPlanText] = useState('');
  const [planType, setPlanType] = useState<PlanType>('learning');
  const [subjectOrSkill, setSubjectOrSkill] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(45);

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setPlanTitle(tmpl.title);
    setSubjectOrSkill(tmpl.subject);
    setPlanType(tmpl.type);
    setRawPlanText(tmpl.text);
    setSourceMode('raw');
  };

  const handleDeconstruct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userEmail.trim()) {
      alert("Please enter your email");
      return;
    }
    if (!rawPlanText.trim()) return;
    
    setIsProcessing(true);
    try {
      await onSubmit({
        userEmail,
        planTitle,
        rawPlanText,
        type: planType,
        subjectOrSkill,
        intervalMinutes,
        sourceMode
      });
      onClose();
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Import Plan or Project" subtitle="Provide source material to generate a custom learning plan">
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
                      <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
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

          <div className="h-px w-full bg-zinc-800" />

          {/* User Meta */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              User Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. hello@example.com"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="h-px w-full bg-zinc-800" />

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
                  Learning
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
                  Project
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

          {/* Source Material UI (NotebookLM Scaffolding) */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Source Material
              </label>
              <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Powered by NotebookLM
              </span>
            </div>
            
            <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
              <button
                  type="button"
                  onClick={() => setSourceMode('raw')}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                    sourceMode === 'raw'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
              >
                  <FileText className="w-3.5 h-3.5" />
                  Raw Notes
              </button>
              <div
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold cursor-not-allowed opacity-40 text-zinc-500 select-none"
                  title="PDF upload — coming soon"
              >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload PDF
                  <span className="ml-1 text-[9px] font-semibold uppercase tracking-wide bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full border border-zinc-700">
                    Soon
                  </span>
              </div>
              <button
                  type="button"
                  onClick={() => setSourceMode('notebooklm')}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                    sourceMode === 'notebooklm'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
              >
                  <Library className="w-3.5 h-3.5" />
                  Notebook
              </button>
            </div>

            {sourceMode === 'raw' && (
                <textarea
                rows={5}
                value={rawPlanText}
                onChange={(e) => setRawPlanText(e.target.value)}
                placeholder={`Paste raw notes, syllabus, or learning goals here...`}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none font-mono"
                />
            )}

            {sourceMode === 'notebooklm' && (
                <div className="flex flex-col items-center justify-center p-8 border border-zinc-700 rounded-xl bg-zinc-950 text-center">
                   <Library className="w-8 h-8 text-amber-500/50 mb-2" />
                   <p className="text-sm font-medium text-zinc-300">Connect a NotebookLM Source</p>
                   <p className="text-xs text-zinc-500 mt-1 max-w-sm">Import your curated notes and sources directly from Google NotebookLM to generate highly contextual tasks.</p>
                   <button type="button" className="mt-4 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-medium text-xs px-4 py-2 rounded-lg transition-colors">Connect Notebook</button>
                </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (sourceMode === 'raw' && !rawPlanText.trim())}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Generating Tasks...</span>
                </>
              ) : (
                <>
                  <span>Generate Plan Tasks</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
};
