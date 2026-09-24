import React from 'react';
import { LogOut, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  businessName?: string;
}

export const LogoutConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  businessName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0d1426] border border-[#24304a] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1c2740]">
          <div className="flex items-center gap-2.5 text-red-400 font-bold text-base">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Sign Out</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8d9ab3] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#cbd5e1] leading-relaxed">
          Are you sure you want to log out of <strong>{businessName || 'AutoNex'}</strong>? You will need to sign in again to review posts and manage offers.
        </p>

        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-[#111a30] text-[#cbd5e1] border border-[#24304a] hover:text-white transition active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
