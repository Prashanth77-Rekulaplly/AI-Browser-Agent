import React, { useState } from 'react';
import { GitBranch, Play, Plus, Trash2, Edit3, Layers } from 'lucide-react';
import { WorkflowItem } from '../types';

interface WorkflowsViewProps {
  workflows: WorkflowItem[];
  onRunWorkflow: (prompt: string) => void;
  onSaveWorkflow: (wf: Partial<WorkflowItem>) => void;
  onDeleteWorkflow: (id: string) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  workflows,
  onRunWorkflow,
  onSaveWorkflow,
  onDeleteWorkflow,
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const handleSelect = (wf: WorkflowItem) => {
    setSelectedWorkflow(wf);
    const defaults: Record<string, string> = {};
    wf.parameters.forEach((p) => {
      defaults[p.key] = p.default;
    });
    setParamValues(defaults);
  };

  const handleExecute = () => {
    if (!selectedWorkflow) return;
    let populatedPrompt = selectedWorkflow.promptTemplate;
    Object.entries(paramValues).forEach(([k, v]) => {
      populatedPrompt = populatedPrompt.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    onRunWorkflow(populatedPrompt);
  };

  return (
    <div className="space-y-6 p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Saved Workflows</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Execute parameterized multi-step research and browser routines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="md:col-span-1 space-y-3">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => handleSelect(wf)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedWorkflow?.id === wf.id
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-900 dark:text-white shadow-lg shadow-indigo-500/10'
                  : 'glass-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E293B]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-semibold">{wf.name}</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#151D2F] border border-slate-200 dark:border-[#1E293B] text-slate-500 dark:text-slate-400">
                  {wf.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{wf.description}</p>
            </div>
          ))}
        </div>

        {/* Workflow Runner & Configuration */}
        <div className="md:col-span-2">
          {selectedWorkflow ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedWorkflow.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{selectedWorkflow.description}</p>
                </div>

                <button
                  onClick={() => onDeleteWorkflow(selectedWorkflow.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2F] hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete Workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Template */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Prompt Template</label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D131F] border border-slate-200 dark:border-[#1E293B] text-xs font-mono text-indigo-600 dark:text-indigo-300">
                  {selectedWorkflow.promptTemplate}
                </div>
              </div>

              {/* Parameters */}
              {selectedWorkflow.parameters.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Parameters</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedWorkflow.parameters.map((param) => (
                      <div key={param.key} className="space-y-1">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400">{param.label}</label>
                        <input
                          type="text"
                          value={paramValues[param.key] || ''}
                          onChange={(e) =>
                            setParamValues((prev) => ({ ...prev, [param.key]: e.target.value }))
                          }
                          className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 caret-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1E293B] flex justify-end">
                <button
                  onClick={handleExecute}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Workflow</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-200 dark:border-[#1E293B]">
              Select a workflow from the list to configure and run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
