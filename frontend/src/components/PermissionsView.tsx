import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Check, Save } from 'lucide-react';
import { PermissionSettings } from '../types';

interface PermissionsViewProps {
  permissions: PermissionSettings;
  onSavePermissions: (perms: PermissionSettings) => void;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({
  permissions,
  onSavePermissions,
}) => {
  const [perms, setPerms] = useState<PermissionSettings>(permissions);
  const [saved, setSaved] = useState(false);

  const permissionItems = [
    { key: 'browserAccess', label: 'Browser Automation & Navigation', desc: 'Allows opening web pages, clicking, and typing queries.' },
    { key: 'webResearch', label: 'Web Research & Crawling', desc: 'Allows reading public search engines and articles.' },
    { key: 'readPage', label: 'DOM & Text Extraction', desc: 'Allows analyzing visible text, tables, and page headings.' },
    { key: 'takeScreenshots', label: 'Screenshot Capture', desc: 'Captures visual verification snapshots.' },
    { key: 'submitForms', label: 'Form Submissions & Inputs', desc: 'Submitting web forms containing personal/user data.' },
    { key: 'sendEmail', label: 'Send Emails & Messages', desc: 'Triggering send actions in webmail or messaging portals.' },
    { key: 'makePurchases', label: 'E-commerce Purchases', desc: 'Adding to cart, checkout, or placing orders.' },
    { key: 'makePayments', label: 'Financial Payments & Transfers', desc: 'Authorizing payment gateways or money transfers.' },
    { key: 'deleteData', label: 'Data & Account Deletion', desc: 'Deleting accounts, files, or persistent resources.' },
    { key: 'socialMediaPosting', label: 'Public Social Media Posts', desc: 'Publishing posts or tweets on social platforms.' },
    { key: 'localFileAccess', label: 'Local Filesystem Access', desc: 'Accessing files outside project workspace.' },
  ];

  const handleSave = () => {
    onSavePermissions(perms);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Security Policies & Permission Gates</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">Configure which browser actions execute automatically vs require human confirmation</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved!' : 'Save Permissions'}</span>
        </button>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-3">
        {permissionItems.map((item) => {
          const currentVal = perms[item.key] || 'ALLOWED';
          return (
            <div
              key={item.key}
              className="p-4 rounded-xl bg-white dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B]/60 flex items-center justify-between gap-4"
            >
              <div className="space-y-0.5 min-w-0 pr-4">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{item.label}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0D131F] p-1 rounded-xl border border-slate-200 dark:border-[#1E293B] shrink-0 text-xs">
                <button
                  onClick={() => setPerms({ ...perms, [item.key]: 'ALLOWED' })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentVal === 'ALLOWED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Allowed
                </button>
                <button
                  onClick={() => setPerms({ ...perms, [item.key]: 'ASK' })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentVal === 'ASK'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Ask
                </button>
                <button
                  onClick={() => setPerms({ ...perms, [item.key]: 'BLOCKED' })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    currentVal === 'BLOCKED'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Blocked
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
