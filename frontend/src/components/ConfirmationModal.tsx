import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X, Globe, Terminal } from 'lucide-react';

interface ConfirmationModalProps {
  confirmation: {
    tool: string;
    args: any;
    reason: string;
    details: any;
  } | null;
  onApprove: () => void;
  onReject: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmation,
  onApprove,
  onReject,
}) => {
  if (!confirmation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-lg w-full bg-white dark:bg-[#111726] border border-rose-500/40 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5 transition-colors">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Confirmation Required</h2>
            <p className="text-xs text-rose-600 dark:text-rose-300">A sensitive or irreversible action was requested</p>
          </div>
        </div>

        {/* Reason / Notice */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-200 leading-relaxed">
          {confirmation.reason || 'The agent is about to execute an action requiring your explicit approval.'}
        </div>

        {/* Details Card */}
        <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-[#0D131F] p-4 rounded-xl border border-slate-200 dark:border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-[#1E293B]/60">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Tool:</span>
            </span>
            <span className="text-slate-900 dark:text-white font-semibold">{confirmation.tool}</span>
          </div>

          {confirmation.details?.currentUrl && (
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 py-1.5 border-b border-slate-200 dark:border-[#1E293B]/60">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>Website:</span>
              </span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                {confirmation.details.currentUrl}
              </span>
            </div>
          )}

          <div className="pt-2">
            <span className="text-slate-500 block mb-1">Payload / Arguments:</span>
            <pre className="p-2 rounded bg-slate-100 dark:bg-[#0A0E18] text-slate-800 dark:text-slate-300 text-[11px] overflow-x-auto border border-slate-200 dark:border-[#1E293B]">
              {JSON.stringify(confirmation.args, null, 2)}
            </pre>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onReject}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#151D2F] dark:hover:bg-[#0D131F] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Reject Action</span>
          </button>

          <button
            onClick={onApprove}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
