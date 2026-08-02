"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingBag, Store, User } from "lucide-react";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";

import { toPersianDigits } from "../utils/persian";

const TABS = [
  { id: "home", href: "/", label: "خانه", icon: Home },
  { id: "shop", href: "/shop", label: "فروشگاه", icon: Store },
  { id: "cart", href: "/cart", label: "سبد خرید", icon: ShoppingBag },
  { id: "favorites", href: "/favorites", label: "علاقه‌مندی‌ها", icon: Heart },
  { id: "profile", href: "/profile", label: "پروفایل", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const cart = useCart();
  const { favorites } = useFavorites();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-screen-lg border-t border-white/[0.06] bg-[#171817]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="grid h-16 grid-cols-5 px-2" dir="ltr">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const badgeCount =
            tab.id === "cart"
              ? cart.totalBundles
              : tab.id === "favorites"
                ? favorites.length
                : 0;

          return (
            <Link
              key={tab.id}
              href={tab.href}
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

                {badgeCount > 0 ? (
                  <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#c7a23c] px-1 text-[9px] font-black text-black">
                    {toPersianDigits(badgeCount)}
                  </span>
                ) : null}
              </span>

              {isActive ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#d1aa2d]" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
