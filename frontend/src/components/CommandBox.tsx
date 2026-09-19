import React, { useState } from 'react';
import { ArrowRight, Sparkles, Monitor, Globe2, Layers } from 'lucide-react';

interface CommandBoxProps {
  onSubmit: (task: string, options: { headless: boolean }) => void;
  isLoading: boolean;
}

export const CommandBox: React.FC<CommandBoxProps> = ({ onSubmit, isLoading }) => {
  const [task, setTask] = useState('');
  const [visibleBrowser, setVisibleBrowser] = useState(true);

  const suggestedTasks = [
    {
      title: 'ML Laptops Research',
      prompt: 'Research the best laptops for machine learning under ₹1 lakh, compare at least 5 sources, collect specifications, and rank the top 3 options.',
    },
    {
      title: 'Wikipedia AI Synthesis',
      prompt: 'Search Wikipedia for Artificial Intelligence, extract key milestones, and generate a concise executive briefing with citations.',
    },
    {
      title: 'Node.js Documentation',
      prompt: 'Navigate to the official Node.js documentation, check the latest release notes, and summarize the key API features.',
    },
    {
      title: 'Python Courses Search',
      prompt: 'Open Google and search for Python courses, verify search results, and capture a screenshot.',
    },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task.trim() || isLoading) return;
    onSubmit(task.trim(), { headless: !visibleBrowser });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Autonomous Command Center */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-[#1E293B] shadow-2xl transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Command Center</span>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={visibleBrowser}
              onChange={(e) => setVisibleBrowser(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-[#151D2F] border-slate-300 dark:border-[#1E293B] text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Visible Browser Window</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="What would you like me to do? (e.g. Research ML laptops under ₹1L, open Wikipedia, inspect docs...)"
              rows={3}
              className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-indigo-500/50 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-inner caret-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#151D2F] border border-slate-200 dark:border-[#1E293B]">Ctrl</span>
              <span>+</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#151D2F] border border-slate-200 dark:border-[#1E293B]">Enter</span>
              <span className="text-slate-400 dark:text-slate-500">to execute</span>
            </div>

            <button
              type="submit"
              disabled={!task.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Agent Working...</span>
                </>
              ) : (
                <>
                  <span>Run Agent</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Prompts / Quick Action Cards */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Quick Actions & Suggested Prompts</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedTasks.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setTask(st.prompt)}
              className="text-left p-3.5 rounded-xl glass-card transition-all group flex flex-col justify-between cursor-pointer border border-slate-200 dark:border-[#1E293B]/60"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {st.title}
                </span>
                <Globe2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {st.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
