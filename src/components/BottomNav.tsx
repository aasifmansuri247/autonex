import React from 'react';
import { LayoutDashboard, Image as ImageIcon, CheckCircle, Tag, Smartphone } from 'lucide-react';

interface Props {
  activePage: string;
  onChangePage: (page: string) => void;
  pendingCount: number;
  onOpenAndroidCenter: () => void;
}

export const BottomNav: React.FC<Props> = ({
  activePage,
  onChangePage,
  pendingCount,
  onOpenAndroidCenter
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: ImageIcon },
    { id: 'approval', label: 'Approvals', icon: CheckCircle, badge: pendingCount },
    { id: 'offer', label: 'Offer', icon: Tag },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d1a]/95 backdrop-blur-md border-t border-[#1c2740] px-2 py-1.5 flex items-center justify-around pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChangePage(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-cyan-400' : 'text-[#8d9ab3] hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-extrabold leading-none">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        );
      })}

      {/* Direct Android button in mobile bottom bar */}
      <button
        onClick={onOpenAndroidCenter}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-cyan-300"
      >
        <Smartphone className="w-5 h-5 text-cyan-400 animate-pulse" />
        <span className="text-[10px] font-medium mt-1">APK / App</span>
      </button>
    </div>
  );
};
