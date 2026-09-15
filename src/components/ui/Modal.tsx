import React from 'react';
import { X } from 'lucide-react';
import { buttonStyles } from '../../design-tokens';

interface ModalProps {
  open?: boolean; // make optional since we sometimes wrap the whole component
  onClose: () => void;
  title: string;
  subtitle?: string;
  titleIcon?: React.ReactNode;
  titleIconColor?: string;
  titleIconBg?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open = true, onClose, title, subtitle, titleIcon, titleIconColor, titleIconBg, children, actions, maxWidth = 'max-w-2xl' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-zinc-900 w-full ${maxWidth} max-h-[90vh] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col`}
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-zinc-800 bg-zinc-900/95 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center gap-2">
            {titleIcon && (
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${titleIconBg || 'bg-amber-500/20'} ${titleIconColor || 'text-amber-400'}`}>
                {titleIcon}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-zinc-100">{title}</h2>
              {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto">
          {children}
        </div>

        {actions && (
          <div className="flex gap-3 justify-end p-4 border-t border-zinc-800 bg-zinc-900/50 rounded-b-2xl">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
