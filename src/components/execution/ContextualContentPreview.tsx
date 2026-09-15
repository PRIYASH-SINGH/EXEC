import React from 'react';
import { Volume2, BookOpen, Code } from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';
import { buttonStyles } from '../../design-tokens';

interface ContextualContentPreviewProps {
  content: any;
}

export function ContextualContentPreview({ content }: ContextualContentPreviewProps) {
  const { speak, stop } = useSpeech();

  if (!content) return null;

  return (
    <div className="mt-3 bg-zinc-950/50 rounded-lg p-3 border border-zinc-800">
      {content.audio_script && (
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1">
            <Volume2 className="w-3 h-3"/> Audio Script
          </h5>
          <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-amber-500/30 pl-2">
            {content.audio_script}
          </p>
          <div className="flex gap-2 pt-1">
            <button 
              onClick={() => speak(content.audio_script)}
              className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-2 py-1 rounded transition-colors"
            >
              Listen
            </button>
            <button 
              onClick={stop}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      )}
      
      {content.micro_flashcards && Array.isArray(content.micro_flashcards) && (
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1">
            <BookOpen className="w-3 h-3"/> Micro Flashcards
          </h5>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.micro_flashcards.map((fc: any, i: number) => (
              <div key={i} className="text-xs bg-zinc-900 p-2 rounded-md border border-zinc-800/50">
                <div className="font-bold text-zinc-200 mb-1">Q: {fc.q}</div>
                <div className="text-emerald-400/90">A: {fc.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {content.technical_breakdown && (
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1">
            <Code className="w-3 h-3"/> Technical Breakdown
          </h5>
          {content.technical_breakdown.code_architecture && (
            <p className="text-xs text-zinc-300 bg-zinc-900 p-2 rounded-md">
              {content.technical_breakdown.code_architecture}
            </p>
          )}
          {content.technical_breakdown.snippet && (
            <pre className="text-[11px] bg-zinc-950 p-3 rounded-md text-zinc-300 overflow-x-auto border border-zinc-800 font-mono">
              {content.technical_breakdown.snippet}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
