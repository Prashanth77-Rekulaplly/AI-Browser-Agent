import React, { useState } from 'react';
import { History, Search, Trash2, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { TaskRecord } from '../types';

interface TasksHistoryViewProps {
  tasks: TaskRecord[];
  onSelectTask: (task: TaskRecord) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksHistoryView: React.FC<TasksHistoryViewProps> = ({
  tasks,
  onSelectTask,
  onDeleteTask,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'COMPLETED' | 'FAILED'>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.rawPrompt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-5 p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Task Execution History</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Search and review past browser agent executions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="bg-white dark:bg-[#111726] border border-slate-300 dark:border-[#1E293B] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 caret-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#111726] p-1 rounded-xl border border-slate-200 dark:border-[#1E293B] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'COMPLETED' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('FAILED')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'FAILED' ? 'bg-rose-600 text-white font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 glass-panel rounded-2xl border border-slate-200 dark:border-[#1E293B]">
          No task history found matching your filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-xl glass-card transition-all flex items-center justify-between gap-4 group border border-slate-200 dark:border-[#1E293B]/60"
            >
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : t.status === 'FAILED'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{t.id}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{t.rawPrompt}</h3>
                {t.finalResult?.summary && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">{t.finalResult.summary}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectTask(t)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#151D2F] dark:hover:bg-[#0D131F] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  onClick={() => onDeleteTask(t.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#151D2F] hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
