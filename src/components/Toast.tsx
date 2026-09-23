import React from 'react';

interface Props {
  message: string | null;
}

export const Toast: React.FC<Props> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 max-w-sm bg-[#101a2e] border border-[#30405f] text-white text-xs px-4 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-ping"></div>
      <span className="leading-snug">{message}</span>
    </div>
  );
};
