"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CartIcon, SearchIcon, UserIcon } from "@/components/icons";

import { toPersianDigits } from "@/utils/persian";

const NAV_ITEMS = [
  { href: "/shop", label: "فروشگاه", activePath: "/shop" },
  { href: "/#magazine", label: "مجله", activePath: "" },
] as const;

interface DesktopHeaderProps {
  cartCount: number;
}

export function DesktopHeader({ cartCount }: DesktopHeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsScrolled(window.scrollY > 16);
    };

    updateHeaderState();

    window.addEventListener("scroll", updateHeaderState, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, []);

  return (
    <>
      <header
        className={`hidden border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 lg:fixed lg:inset-x-0 lg:top-0 lg:z-[100] lg:block ${
          isScrolled
            ? "border-white/[0.08] bg-background-glass/85 shadow-[0_12px_36px_rgba(0,0,0,0.32)]"
            : "border-transparent bg-background-glass/60 shadow-none"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-8 px-8 py-2.5">
          <div className="flex items-center gap-2 text-zinc-300">
            <HeaderAction
              href="/cart"
              label="سبد خرید"
              count={cartCount}
              icon={<CartIcon className="size-6" aria-hidden="true" />}
            />

            <HeaderAction
              href="/profile"
              label="حساب کاربری"
              icon={<UserIcon className="size-6" aria-hidden="true" />}
            />

            <HeaderAction
              href="/profile"
              label="جستجو"
              icon={<SearchIcon className="size-6" aria-hidden="true" />}
            />
          </div>

          <Link
            href="/"
            aria-label="فلوریسا، صفحه خانه"
            className="mx-auto flex w-28 items-center justify-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
          >
            <Image
              src="/images/brand/florisa-logo.svg"
              alt="فلوریسا"
              width={113}
              height={44}
              className="h-auto w-full object-contain"
            />
          </Link>

          <nav
            aria-label="ناوبری اصلی دسکتاپ"
            className="flex items-center gap-7 text-right font-sans text-sm/5 font-medium tracking-normal text-text-secondary"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.activePath !== "" &&
                (pathname === item.activePath ||
                  pathname.startsWith(`${item.activePath}/`));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-sm py-2 transition-colors ${
                    isActive
                      ? "font-bold text-[#d4af37] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#d4af37]"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div aria-hidden="true" className="mb-16 hidden shrink-0 lg:block" />
    </>
  );
}

interface HeaderActionProps {
  href: string;
  label: string;
  count?: number;
  icon: ReactNode;
}

function HeaderAction({ href, label, count = 0, icon }: HeaderActionProps) {
  const accessibleLabel =
    count > 0 ? `${label}، ${toPersianDigits(count)} مورد` : label;

  return (
    <Link
      href={href}
      aria-label={accessibleLabel}
      className="relative grid size-10 place-items-center rounded-full transition hover:bg-white/[0.06] hover:text-[#d4af37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
    >
      {icon}

      {count > 0 ? (
        <span className="absolute -left-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#d4af37] text-[9px] font-black text-black">
          {toPersianDigits(count)}
        </span>
      ) : null}
    </Link>
  );
}
