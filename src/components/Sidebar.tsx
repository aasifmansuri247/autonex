import React from 'react';
import { LayoutDashboard, Image as ImageIcon, CheckCircle, Tag, LogOut, Settings, User } from 'lucide-react';

interface Props {
  activePage: string;
  onChangePage: (page: string) => void;
  pendingCount: number;
  onLogout: () => void;
  onOpenApiSettings: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activePage,
  onChangePage,
  pendingCount,
  onLogout,
  onOpenApiSettings
}) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: ImageIcon },
    { id: 'approval', label: 'Approvals', icon: CheckCircle, badge: pendingCount },
    { id: 'offer', label: 'Offer', icon: Tag },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#080d1a] border-r border-[#24304a] p-5 z-20">
      {/* Brand Logo */}
      <div className="h-16 flex items-center gap-3 border-b border-[#24304a] mb-5 pb-2">
        <img
          src="/icon.svg"
          alt="AutoNex"
          className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(22,217,255,0.4)]"
        />
        <div>
          <h1 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1.5">
            AutoNex
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30">
              AI
            </span>
          </h1>
          <p className="text-[10px] text-[#9aa7c2]">Client Mobile Portal</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-[#111a30] text-white shadow-md shadow-blue-500/10 border border-[#24304a]'
                  : 'text-[#9eabc4] hover:bg-[#111a30]/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-[#9eabc4]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[#1c2740]">
          <button
            onClick={onOpenApiSettings}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#9eabc4] hover:bg-[#111a30]/60 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
            <span>Server Host Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer User Info & Prominent Logout */}
      <div className="pt-4 border-t border-[#1c2740]">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-white transition active:scale-95 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
