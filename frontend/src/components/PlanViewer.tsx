import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, Wrench } from 'lucide-react';
import { PlanStep } from '../types';

interface PlanViewerProps {
  plan: PlanStep[];
  currentStepIndex?: number;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ plan, currentStepIndex = 0 }) => {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Execution Plan</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          {plan.filter((s) => s.status === 'completed').length} / {plan.length} Steps
        </span>
      </div>

      <div className="space-y-2.5">
        {plan.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isRunning = step.status === 'running' || (!isCompleted && idx === currentStepIndex);
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.id || idx}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                isRunning
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200'
                  : isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-slate-800 dark:text-slate-300'
                  : isFailed
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-300'
                  : 'bg-slate-50 dark:bg-[#151D2F]/70 border-slate-200 dark:border-[#1E293B]/60 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : isRunning ? (
                    <div className="w-4 h-4 border-2 border-indigo-500/40 border-t-indigo-500 rounded-full animate-spin shrink-0" />
                  ) : isFailed ? (
                    <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className={`text-xs font-medium ${isRunning ? 'text-indigo-900 dark:text-white font-semibold' : 'text-slate-800 dark:text-slate-200'}`}>
                    {step.description}
                  </p>
                  {step.result && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-mono">
                      {typeof step.result === 'object' ? step.result.message || step.result.status : String(step.result)}
                    </p>
                  )}
                </div>
              </div>

              {step.requiredTool && (
                <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0D131F] border border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Wrench className="w-2.5 h-2.5" />
                  {step.requiredTool}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
