import React from 'react';
import { CheckCircle2, ShieldCheck, AlertTriangle, Sparkles, FileText, Award } from 'lucide-react';
import { TaskRecord } from '../types';

interface FinalResultViewProps {
  task: TaskRecord;
}

export const FinalResultView: React.FC<FinalResultViewProps> = ({ task }) => {
  const result = task.finalResult;
  if (!result) return null;

  const verification = result.verification;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-6 shadow-xl relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Task Completed & Verified</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {Math.round((verification?.confidenceScore || 0.9) * 100)}% Confidence
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">Autonomous workflow concluded successfully</p>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-slate-500">
          <div>{task.steps.length} Actions Executed</div>
          <div>{task.screenshots.length} Screenshots Captured</div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Synthesis & Outcome Summary</span>
        </h4>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B] text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
          {result.summary || 'Task completed without text summary.'}
        </div>
      </div>

      {/* Key Evidence & Findings */}
      {verification?.keyHighlights && verification.keyHighlights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Key Findings & Evidence</span>
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {verification.keyHighlights.map((hl, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B]/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{hl}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Caveats & Warnings */}
      {verification?.warnings && verification.warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-900 dark:text-amber-300 block">Important Considerations:</span>
            {verification.warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
