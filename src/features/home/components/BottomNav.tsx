import React from 'react';
import { Home, Store, Leaf, Heart, User } from 'lucide-react';
import type { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'خانه', icon: Home },
    { id: 'shop' as TabType, label: 'فروشگاه', icon: Store },
    { id: 'care_ai' as TabType, label: 'گیاه‌پزشک', icon: Leaf, highlight: true },
    { id: 'favorites' as TabType, label: 'علاقه‌مندی', icon: Heart, badge: favoritesCount },
    { id: 'profile' as TabType, label: 'پروفایل', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 right-0 left-0 z-40 bg-[#121319]/95 backdrop-blur-lg border-t border-white/10 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto rounded-t-2xl shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Highlight Ring for Leaf / AI tab */}
              {tab.highlight ? (
                <div
                  className={`p-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
              )}

              <span className={`text-[10px] mt-1 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                {tab.label}
              </span>

              {isActive && !tab.highlight && (
                <span className="absolute bottom-0 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
