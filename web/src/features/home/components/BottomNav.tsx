"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

import {
  CartIcon,
  HeartIcon,
  HomeIcon,
  StoreIcon,
  UserIcon,
  type IconProps,
} from "@/components/icons";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { useFavorites } from "@/features/favorites/hooks/FavoritesProvider";
import { toPersianDigits } from "../utils/persian";

type TabId = "home" | "shop" | "cart" | "favorites" | "profile";

type Tab = {
  id: TabId;
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

const TABS = [
  {
    id: "home",
    href: "/",
    label: "خانه",
    icon: HomeIcon,
  },
  {
    id: "shop",
    href: "/shop",
    label: "فروشگاه",
    icon: StoreIcon,
  },
  {
    id: "cart",
    href: "/cart",
    label: "سبد خرید",
    icon: CartIcon,
  },
  {
    id: "favorites",
    href: "/favorites",
    label: "علاقه‌مندی‌ها",
    icon: HeartIcon,
  },
  {
    id: "profile",
    href: "/profile",
    label: "پروفایل",
    icon: UserIcon,
  },
] as const satisfies readonly Tab[];

const TAB_SPRING = {
  type: "spring",
  stiffness: 460,
  damping: 28,
  mass: 0.7,
} as const;

const ICON_SPRING = {
  type: "spring",
  stiffness: 600,
  damping: 18,
  mass: 0.55,
} as const;

const BUBBLE_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.75,
} as const;

export function BottomNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const cart = useCart();
  const { favorites } = useFavorites();

  return (
    <nav
      aria-label="ناوبری اصلی"
      className={[
        "fixed inset-x-0 bottom-0 z-50",
        "mx-auto w-full max-w-screen-lg",
        "bg-background-secondary",
      ].join(" ")}
    >
      <LayoutGroup id="florisa-bottom-navigation">
        <div className="grid h-12 grid-cols-5 px-2" dir="ltr">
          {TABS.map((tab) => {
            const Icon = tab.icon;

            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            const badgeCount =
              tab.id === "cart"
                ? cart.totalQuantity
                : tab.id === "favorites"
                  ? favorites.length
                  : 0;

            const shouldShowBadge = cart.isHydrated && badgeCount > 0;

            const accessibleLabel = shouldShowBadge
              ? `${tab.label}، ${toPersianDigits(badgeCount)} مورد`
              : tab.label;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={accessibleLabel}
                className={[
                  "relative grid place-items-center",
                  "focus-visible:outline-none",
                  "focus-visible:ring-action-primary",
                ].join(" ")}
              >
                <motion.span
                  layout
                  initial={false}
                  animate={{
                    y: isActive ? -24 : 0,
                    scale: isActive ? 1 : 0.92,
                  }}
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.86,
                        }
                  }
                  transition={
                    shouldReduceMotion
                      ? {
                          duration: 0,
                        }
                      : TAB_SPRING
                  }
                  className="relative grid size-12 place-items-center"
                >
                  {isActive ? (
                    <motion.span
                      layoutId="bottom-nav-active-bubble"
                      aria-hidden="true"
                      initial={false}
                      transition={
                        shouldReduceMotion
                          ? {
                              duration: 0,
                            }
                          : BUBBLE_SPRING
                      }
                      className={[
                        "absolute inset-0",
                        "rounded-full",
                        "bg-background-secondary",
                      ].join(" ")}
                    />
                  ) : null}

                  <motion.span
                    initial={false}
                    animate={{
                      scale: isActive ? 1.18 : 1,
                      rotate: isActive ? -2 : 0,
                    }}
                    transition={
                      shouldReduceMotion
                        ? {
                            duration: 0,
                          }
                        : ICON_SPRING
                    }
                    className="relative z-10 grid place-items-center"
                  >
                    <Icon
                      size={22}
                      aria-hidden="true"
                      className={[
                        "shrink-0",
                        "transition-colors duration-200",
                        isActive ? "text-text-brand" : "text-text-secondary",
                      ].join(" ")}
                    />
                  </motion.span>

                  {shouldShowBadge ? (
                    <motion.span
                      aria-hidden="true"
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              scale: 0,
                              opacity: 0,
                            }
                      }
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={
                        shouldReduceMotion
                          ? {
                              duration: 0,
                            }
                          : {
                              type: "spring",
                              stiffness: 650,
                              damping: 20,
                            }
                      }
                      className={[
                        "absolute right-2 top-2 z-20",
                        "grid h-4 min-w-4 place-items-center",
                        "rounded-full px-1",
                        "bg-action-primary",
                        "text-[9px] font-black leading-none",
                        "text-background-primary",
                      ].join(" ")}
                    >
                      {toPersianDigits(badgeCount)}
                    </motion.span>
                  ) : null}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
