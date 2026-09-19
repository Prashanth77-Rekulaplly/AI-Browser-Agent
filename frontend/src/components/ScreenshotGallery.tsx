import React, { useState } from 'react';
import { Camera, Maximize2, X, ExternalLink } from 'lucide-react';
import { ScreenshotMeta } from '../types';

interface ScreenshotGalleryProps {
  screenshots: ScreenshotMeta[];
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ screenshots }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<ScreenshotMeta | null>(null);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const getImageUrl = (filePath: string) => {
    const normalized = filePath.replace(/\\/g, '/');
    const filename = normalized.split('/').pop() || 'screenshot.png';
    return `/screenshots/${filename}`;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Visual Verification Screenshots</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-500">{screenshots.length} Captured</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {screenshots.map((s, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedScreenshot(s)}
            className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0D131F] cursor-pointer transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-900">
              <img
                src={getImageUrl(s.path)}
                alt={s.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="p-2 bg-slate-50/90 dark:bg-[#111726]/90 text-[10px] text-slate-700 dark:text-slate-400 flex items-center justify-between">
              <span className="font-mono truncate">{s.filename}</span>
              <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Zoom Preview */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-5xl w-full bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white font-mono">{selectedScreenshot.filename}</span>
                {selectedScreenshot.url && (
                  <a
                    href={selectedScreenshot.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{selectedScreenshot.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedScreenshot(null)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-[#151D2F] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-xl bg-black/60 border border-slate-200 dark:border-[#1E293B]/40 flex items-center justify-center">
              <img
                src={getImageUrl(selectedScreenshot.path)}
                alt={selectedScreenshot.filename}
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
