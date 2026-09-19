import React, { useState } from 'react';
import { Brain, Plus, Trash2, Save, Check } from 'lucide-react';
import { MemorySettings } from '../types';

interface MemoryViewProps {
  memory: MemorySettings;
  onSaveMemory: (memory: MemorySettings) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ memory, onSaveMemory }) => {
  const [prefs, setPrefs] = useState(memory.preferences);
  const [rules, setRules] = useState(memory.customRules || []);
  const [newRule, setNewRule] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    setRules((prev) => [...prev, newRule.trim()]);
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveMemory({
      preferences: prefs,
      customRules: rules,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Agent Memory & Custom Rules</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Configure global preferences and guidelines remembered across tasks</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          {savedMessage ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedMessage ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Preferences Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Global Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-slate-300">Preferred Currency</label>
            <input
              type="text"
              value={prefs.preferredCurrency}
              onChange={(e) => setPrefs({ ...prefs, preferredCurrency: e.target.value })}
              className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 caret-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-slate-300">Preferred Language</label>
            <input
              type="text"
              value={prefs.preferredLanguage}
              onChange={(e) => setPrefs({ ...prefs, preferredLanguage: e.target.value })}
              className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 caret-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-slate-300">Research Depth</label>
            <select
              value={prefs.researchDepth}
              onChange={(e) => setPrefs({ ...prefs, researchDepth: e.target.value })}
              className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="concise">Concise (Fast, top 2 sources)</option>
              <option value="detailed">Detailed (Deep, 5+ sources with comparison)</option>
              <option value="exhaustive">Exhaustive (Full verification & citations)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-slate-300">Default Search Engine</label>
            <select
              value={prefs.defaultSearchEngine}
              onChange={(e) => setPrefs({ ...prefs, defaultSearchEngine: e.target.value })}
              className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Google">Google</option>
              <option value="Bing">Bing</option>
              <option value="DuckDuckGo">DuckDuckGo</option>
              <option value="Wikipedia">Wikipedia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Rules */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Persistent Agent Guidelines
        </h3>

        <div className="space-y-2.5">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B] flex items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200"
            >
              <span>{rule}</span>
              <button
                onClick={() => handleRemoveRule(idx)}
                className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Add new rule (e.g. Always check GitHub repo stars before recommending)..."
            className="flex-1 bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 caret-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
          />
          <button
            onClick={handleAddRule}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#151D2F] dark:hover:bg-[#0D131F] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
