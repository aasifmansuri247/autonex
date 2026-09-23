import React, { useState } from 'react';
import { Smartphone, Download, X, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  onOpenAndroidCenter: () => void;
  onToast: (msg: string) => void;
}

export const PWAInstallBanner: React.FC<Props> = ({ onOpenAndroidCenter, onToast }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-900/40 via-[#0d172e] to-purple-900/40 border-b border-blue-500/20 px-4 py-2.5 flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5 text-white min-w-0">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">
            <strong className="text-cyan-300">Android APK & App:</strong> Install AutoNex directly for full screen & offline access
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInstallable ? (
            <button
              onClick={async () => {
                const res = await install();
                if (res) onToast('AutoNex App installed! 🎉');
              }}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3 h-3" /> Install
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-semibold text-xs flex items-center gap-1 transition"
            >
              <Info className="w-3 h-3" /> How to Install
            </button>
          ) : (
            <button
              onClick={onOpenAndroidCenter}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-semibold text-xs flex items-center gap-1 transition"
            >
              <Download className="w-3 h-3" /> APK Center
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="text-[#9aa7c2] hover:text-white p-1 rounded-md transition"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0c1324] border border-[#24304a] p-5 shadow-2xl text-xs space-y-3">
            <h4 className="text-sm font-bold text-white">Install on iPhone / iPad</h4>
            <p className="text-[#cbd5e1] leading-relaxed">
              1. Tap the <strong>Share button</strong> in Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-[#121b31] border border-[#24304a] text-white font-semibold hover:border-cyan-400/50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
