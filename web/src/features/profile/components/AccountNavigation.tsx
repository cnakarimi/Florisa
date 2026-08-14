"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, MapPin, ShoppingBag, UserRound } from "lucide-react";

const items = [
  { href: "/profile", label: "حساب کاربری", icon: UserRound },
  { href: "/profile/edit", label: "ویرایش اطلاعات حساب", icon: UserRound },
  { href: "/profile/addresses", label: "آدرس‌های من", icon: MapPin },
  { href: "/orders", label: "سفارش‌های من", icon: ShoppingBag },
] as const;

export function AccountNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="بخش‌های حساب کاربری" className="rounded-3xl border border-white/10 bg-[#15171e] p-2 shadow-xl shadow-black/10">
      <p className="px-3 pb-2 pt-3 text-[11px] font-bold text-zinc-500">مدیریت حساب</p>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`mb-1 flex min-h-12 items-center justify-between rounded-2xl px-3 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-amber-400 ${active ? "bg-amber-400 text-[#17130a]" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
          >
            <span className="flex items-center gap-3"><Icon className="size-5" aria-hidden="true" />{item.label}</span>
            <ChevronLeft className="size-4 opacity-60" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
