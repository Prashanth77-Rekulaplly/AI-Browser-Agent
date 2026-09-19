import React, { useState } from 'react';
import { HelpCircle, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { ClarificationQuestion } from '../types';

interface ClarificationPanelProps {
  clarification: {
    questions: ClarificationQuestion[];
    rationale?: string;
  } | null;
  onSubmit: (answers: Record<string, string>) => void;
}

export const ClarificationPanel: React.FC<ClarificationPanelProps> = ({
  clarification,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!clarification || !clarification.questions || clarification.questions.length === 0) {
    return null;
  }

  const handleOptionClick = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 shadow-2xl relative overflow-hidden space-y-5 animate-in fade-in transition-colors">
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Clarification Needed</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 uppercase">
              Adaptive Understanding
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {clarification.rationale || 'Please provide a few essential details so the agent can execute accurately.'}
          </p>
        </div>
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {clarification.questions.map((q, idx) => {
          const currentAnswer = answers[q.id] || '';
          return (
            <div
              key={q.id || idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-[#151D2F]/70 border border-slate-200 dark:border-[#1E293B]/70 space-y-2.5"
            >
              <div className="space-y-0.5">
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  {idx + 1}. {q.question}
                </label>
                {q.whyNeeded && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Reason: {q.whyNeeded}
                  </p>
                )}
              </div>

              {/* Quick-Pick Suggested Options */}
              {q.suggestedOptions && q.suggestedOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {q.suggestedOptions.map((opt, optIdx) => {
                    const isSelected = currentAnswer === opt;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionClick(q.id, opt)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-white dark:bg-[#0D131F] hover:bg-slate-100 dark:hover:bg-[#151D2F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom Write-In Input */}
              <div>
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder="Or type custom details..."
                  className="w-full bg-white dark:bg-[#0D131F] border border-slate-300 dark:border-[#1E293B] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 caret-indigo-500"
                />
              </div>
            </div>
          );
        })}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Clarification & Continue</span>
          </button>
        </div>
      </form>
    </div>
  );
};
