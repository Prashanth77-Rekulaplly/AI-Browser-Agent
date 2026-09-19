import React from 'react';
import { 
  PlusCircle, 
  History, 
  GitBranch, 
  Brain, 
  ShieldCheck, 
  Settings,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'new-task' | 'history' | 'workflows' | 'memory' | 'permissions' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  recentTasksCount?: number;
  workflowsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  recentTasksCount = 0,
  workflowsCount = 0,
}) => {
  const navItems = [
    {
      id: 'new-task' as ActiveTab,
      label: 'Agent Workspace',
      icon: PlusCircle,
      badge: 'Active',
    },
    {
      id: 'history' as ActiveTab,
      label: 'Task History',
      icon: History,
      count: recentTasksCount,
    },
    {
      id: 'workflows' as ActiveTab,
      label: 'Saved Workflows',
      icon: GitBranch,
      count: workflowsCount,
    },
    {
      id: 'memory' as ActiveTab,
      label: 'Memory & Context',
      icon: Brain,
    },
    {
      id: 'permissions' as ActiveTab,
      label: 'Policy & Security',
      icon: ShieldCheck,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0D131F] flex flex-col justify-between shrink-0 select-none transition-colors">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#151D2F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-[#1E293B]/60">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B]/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300 font-medium">
            <span>Model Engine</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">Gemini 3.1 Flash Lite</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Local-first browser automation with persistent session authentication.
          </p>
        </div>
      </div>
    </aside>
  );
};
