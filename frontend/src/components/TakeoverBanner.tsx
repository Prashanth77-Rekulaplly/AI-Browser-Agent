import React from 'react';
import { UserCheck, Play, KeyRound } from 'lucide-react';

interface TakeoverBannerProps {
  isActive: boolean;
  onResume: () => void;
}

export const TakeoverBanner: React.FC<TakeoverBannerProps> = ({ isActive, onResume }) => {
  if (!isActive) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-xl flex items-center justify-between gap-4 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-amber-950 dark:text-white flex items-center gap-2">
            <span>Human Interaction Required</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Browser Active
            </span>
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
            Please log in, solve any CAPTCHA/2FA in the visible browser window, then click Resume to continue.
          </p>
        </div>
      </div>

      <button
        onClick={onResume}
        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/30 transition-all flex items-center gap-1.5 shrink-0"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Resume Agent</span>
      </button>
    </div>
  );
};
