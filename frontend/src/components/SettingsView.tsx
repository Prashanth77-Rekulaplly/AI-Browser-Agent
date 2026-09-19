import React, { useState } from 'react';
import { Settings, Cpu, Monitor, Key, Globe, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [model, setModel] = useState('gemini-3.1-flash-lite');
  const [profileType, setProfileType] = useState('managed');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Agent System Settings</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Configure LLM engine, browser profile modes, and environment</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-6">
        {/* Model Engine */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>AI Model Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setModel('gemini-3.1-flash-lite')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                model === 'gemini-3.1-flash-lite'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-[#151D2F] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400'
              }`}
            >
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Gemini 3.1 Flash Lite (Recommended)</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Fastest response times, low latency, and optimal token efficiency for browser decision loops.
              </p>
            </div>

            <div
              onClick={() => setModel('gemini-3.5-flash')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                model === 'gemini-3.5-flash'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-[#151D2F] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400'
              }`}
            >
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Gemini 3.5 Flash</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Enhanced reasoning for deep research synthesis and complex multi-source comparisons.
              </p>
            </div>
          </div>
        </div>

        {/* Browser Profile Mode */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Monitor className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Browser Profile Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setProfileType('managed')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                profileType === 'managed'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-[#151D2F] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400'
              }`}
            >
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Dedicated Persistent Profile (Default)</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Stores authentication cookies & localStorage in ./browser-profile across restarts.
              </p>
            </div>

            <div
              onClick={() => setProfileType('existing')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                profileType === 'existing'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-white shadow-sm'
                  : 'bg-white dark:bg-[#151D2F] border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-400'
              }`}
            >
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-1">Existing User Session (CDP Debugging)</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Connects to an existing Chrome browser instance via remote debugging port.
              </p>
            </div>
          </div>
        </div>

        {/* API Credentials Info */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-[#1E293B]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>API Credentials Security</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            API keys are managed securely via <code className="text-indigo-600 dark:text-indigo-300 font-mono">.env</code> on your local computer. Credentials are never exposed in frontend bundles or transmitted in client logs.
          </p>
        </div>
      </div>
    </div>
  );
};
