import { Heart, Home, Leaf, Store, User } from "lucide-react";
import type { TabType } from "../types";
import { toPersianDigits } from "../utils/persian";

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favoritesCount: number;
}

const TABS = [
  { id: "home" as const, label: "خانه", icon: Home },
  { id: "shop" as const, label: "فروشگاه", icon: Store },
  { id: "care_ai" as const, label: "گیاه‌پزشک", icon: Leaf },
  { id: "favorites" as const, label: "علاقه‌مندی‌ها", icon: Heart },
  { id: "profile" as const, label: "پروفایل", icon: User },
];

export function BottomNav({
  activeTab,
  setActiveTab,
  favoritesCount,
}: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-screen-lg border-t border-white/[0.06] bg-[#171817]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="grid h-16 grid-cols-5 px-2" dir="ltr">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === "favorites" && favoritesCount > 0;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
              className={`relative grid place-items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c7a23c] ${
                isActive ? "text-[#d1aa2d]" : "text-[#c8c8c4]"
              }`}
            >
              <span className="relative">
                <Icon
                  className={`h-[22px] w-[22px] ${
                    isActive ? "stroke-[2.1]" : "stroke-[1.75]"
                  }`}
                />

                {showBadge ? (
                  <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#c7a23c] px-1 text-[9px] font-black text-black">
                    {toPersianDigits(favoritesCount)}
                  </span>
                ) : null}
              </span>

              {isActive ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#d1aa2d]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
