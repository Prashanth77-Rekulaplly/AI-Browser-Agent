import React from 'react';
import { 
  Compass, 
  Play, 
  Pause, 
  Square, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { TaskStatus } from '../types';

interface HeaderProps {
  status: TaskStatus;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onTakeControl: () => void;
  onStop: () => void;
  hasActiveTask: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isPaused,
  onPause,
  onResume,
  onTakeControl,
  onStop,
  hasActiveTask,
  theme,
  onToggleTheme,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            Running
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3 h-3 animate-spin-slow" />
            Planning
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
            <Compass className="w-3 h-3" />
            Analyzing
          </span>
        );
      case 'WAITING_CLARIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/40 animate-pulse-subtle">
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            Clarification Needed
          </span>
        );
      case 'WAITING_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30 animate-bounce">
            <ShieldCheck className="w-3 h-3" />
            Confirmation Needed
          </span>
        );
      case 'HUMAN_TAKEOVER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/40">
            <UserCheck className="w-3 h-3" />
            Manual Control Active
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/30">
            Verifying Outcome...
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Completed
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30">
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
            Ready
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-[#1E293B] bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-20 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Browser Control Agent</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PROD
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous Web Agent & Research Engine</p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-[#1E293B] mx-1"></div>

        {getStatusBadge()}
      </div>

      <div className="flex items-center gap-3">
        {/* Profile Mode Indicator */}
        <div
          className="hidden md:flex flex-col items-end px-3 py-1 rounded-lg bg-slate-50 dark:bg-[#151D2F] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-700 dark:text-slate-300"
          title="Login once manually; future sessions reuse the saved browser profile."
        >
          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Browser profile: Persistent</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Login once manually; future sessions reuse profile</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#151D2F] dark:hover:bg-[#0D131F] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center shadow-sm cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Action Controls when running */}
        {hasActiveTask && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#151D2F] p-1 rounded-lg border border-slate-200 dark:border-[#1E293B]">
            {isPaused ? (
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Resume Agent"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
            ) : (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
                title="Pause Agent"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            )}

            <button
              onClick={onTakeControl}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-amber-600/90 hover:bg-amber-600 text-white transition-colors"
              title="Manually Take Control of Browser"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Take Control
            </button>

            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-rose-600/90 hover:bg-rose-600 text-white transition-colors"
              title="Stop Task"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
