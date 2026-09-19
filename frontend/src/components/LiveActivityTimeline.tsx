import React, { useState } from 'react';
import { 
  Activity, 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  MousePointer, 
  FileText, 
  Camera, 
  Check, 
  ShieldAlert, 
  AlertTriangle 
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface LiveActivityTimelineProps {
  timeline: TimelineEvent[];
  steps?: Array<any>;
}

export const LiveActivityTimeline: React.FC<LiveActivityTimelineProps> = ({ timeline, steps = [] }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'open_url':
        return <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />;
      case 'click':
      case 'type_text':
        return <MousePointer className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
      case 'read_page':
      case 'extract_data':
        return <FileText className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />;
      case 'screenshot':
        return <Camera className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />;
      case 'finish_task':
        return <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Real-time Activity Feed</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500">{steps.length} Actions</span>
      </div>

      {steps.length === 0 && timeline.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 font-mono">
          Awaiting agent actions...
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const isExpanded = expandedItems[`step-${idx}`];
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B]/50 space-y-2 text-xs transition-all hover:border-indigo-500/40"
              >
                <div
                  onClick={() => toggleExpand(`step-${idx}`)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    {getToolIcon(step.tool)}
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{step.tool}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      (Iter {step.iteration})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        step.result?.status === 'success' || step.result?.status === 'finished'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : step.result?.status === 'error'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {step.result?.status || 'executed'}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B]/60 space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Arguments:</span>
                      <pre className="p-2 rounded bg-slate-50 dark:bg-[#0A0E18] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] overflow-x-auto text-[10px]">
                        {JSON.stringify(step.args, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Observation / Result:</span>
                      <pre className="p-2 rounded bg-slate-50 dark:bg-[#0A0E18] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B] overflow-x-auto text-[10px]">
                        {JSON.stringify(step.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
