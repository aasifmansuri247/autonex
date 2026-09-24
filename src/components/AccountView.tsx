import React from 'react';
import { User, Server, LogOut, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { getApiBaseUrl, isDemoModeEnabled, setDemoModeEnabled } from '../services/api';
import { UserSession, DashboardData } from '../types';

interface Props {
  session: UserSession;
  dashboardData: DashboardData | null;
  onLogout: () => void;
  onOpenApiSettings: () => void;
  onToast: (msg: string) => void;
  onRefresh: () => void;
}

export const AccountView: React.FC<Props> = ({
  session,
  dashboardData,
  onLogout,
  onOpenApiSettings,
  onToast,
  onRefresh
}) => {
  const businessName = dashboardData?.business?.name || `Client #${session.clientId}`;
  const isDemo = isDemoModeEnabled();
  const currentHost = getApiBaseUrl();

  const handleToggleDemo = () => {
    const next = !isDemo;
    setDemoModeEnabled(next);
    onToast(next ? 'Preview Mode enabled' : 'Connected to live n8n server');
    onRefresh();
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-6">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-cyan-500/20 shrink-0">
            {businessName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-white truncate">{businessName}</h3>
            <p className="text-xs text-[#9aa7c2] truncate">
              {session.email || 'Client Account'} • ID #{session.clientId}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                <ShieldCheck className="w-3 h-3" />
                Active Session
              </span>
              {isDemo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Sparkles className="w-3 h-3" />
                  Preview Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection & App Settings */}
      <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-xs font-bold text-[#8d9ab3] uppercase tracking-wider">
          Connection & Server
        </h4>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#080d1a] border border-[#1f2b44]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">n8n Automation Server</div>
              <div className="text-[11px] text-[#8d9ab3] truncate">{currentHost}</div>
            </div>
          </div>
          <button
            onClick={onOpenApiSettings}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 transition shrink-0 ml-2"
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#080d1a] border border-[#1f2b44]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Preview / Demo Mode</div>
              <div className="text-[11px] text-[#8d9ab3]">Use sample data when outside local Wi-Fi</div>
            </div>
          </div>
          <button
            onClick={handleToggleDemo}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              isDemo ? 'bg-cyan-500' : 'bg-[#1e2a42]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isDemo ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Prominent Easy Logout Section */}
      <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-[#8d9ab3] uppercase tracking-wider">
          Account Actions
        </h4>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl font-bold text-sm text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 active:scale-[0.98] transition shadow-lg shadow-red-500/5"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span>Log Out of AutoNex</span>
        </button>

        <p className="text-center text-[11px] text-[#718096] pt-1">
          Clears local login token and returns to login screen.
        </p>
      </div>
    </div>
  );
};
