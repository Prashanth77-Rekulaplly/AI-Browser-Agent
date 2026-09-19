import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { SourceCitation } from '../types';

interface SourcePanelProps {
  sources: SourceCitation[];
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Verified Sources & Citations</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500">{sources.length} Sources</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {sources.map((src, idx) => (
          <a
            key={idx}
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-white dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B]/60 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-[#151D2F] transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="space-y-1 min-w-0 pr-2">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate block">
                {src.title || src.url}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="truncate max-w-[200px]">{new URL(src.url).hostname}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {src.type || 'Source'}
                </span>
              </div>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
