"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { CartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { toPersianDigits } from "@/utils/persian";

const NAV_ITEMS = [
  {
    href: "/shop",
    label: "فروشگاه",
    activePath: "/shop",
  },
  {
    href: "/blog",
    label: "وبلاگ",
    activePath: "/blog",
  },
] as const;

interface DesktopHeaderProps {
  cartCount: number;
}

export function DesktopHeader({ cartCount }: DesktopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSearchOpen]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      searchInputRef.current?.focus();
      return;
    }

    router.push(`/shop?search=${encodeURIComponent(normalizedQuery)}`);

    setIsSearchOpen(false);
  };

  return (
    <>
      <header
        className={`hidden  transition-[background-color,box-shadow,backdrop-filter] duration-300 lg:fixed lg:inset-x-0 lg:top-0 lg:z-[100] lg:block ${
          isScrolled
            ? " bg-background-secondary/90 shadow-navbar backdrop-blur-xl backdrop-saturate-150"
            : " bg-background-secondary"
        }`}
      >
        <div className="mx-auto grid h-[68px] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-12">
          {/* Actions */}
          <div className="flex items-center justify-start gap-2 text-text-secondary">
            <HeaderAction
              href="/cart"
              label="سبد خرید"
              count={cartCount}
              icon={<CartIcon className="size-[22px]" aria-hidden="true" />}
            />

            <HeaderAction
              href="/profile"
              label="حساب کاربری"
              icon={<UserIcon className="size-[22px]" aria-hidden="true" />}
            />

            {/* Search */}
            <div ref={searchContainerRef} className="relative size-10 shrink-0">
              <form
                id="desktop-header-search-form"
                role="search"
                onSubmit={handleSearchSubmit}
                className={`absolute right-0 top-0 h-10 overflow-hidden rounded-lg border transition-[width,border-color,background-color,box-shadow,opacity] duration-300 ${
                  isSearchOpen
                    ? "w-72 border-action-primary bg-background-primary shadow-small opacity-100"
                    : "pointer-events-none w-10 border-transparent bg-transparent shadow-none opacity-0"
                }`}
              >
                <label htmlFor="desktop-header-search" className="sr-only">
                  جستجوی محصولات
                </label>

                <input
                  ref={searchInputRef}
                  id="desktop-header-search"
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setIsSearchOpen(false);
                    }
                  }}
                  placeholder="جستجوی گل و گیاه..."
                  tabIndex={isSearchOpen ? 0 : -1}
                  className={`size-full bg-transparent pr-11 pl-3 text-desktop-ui-label text-text-primary outline-none placeholder:text-text-secondary transition-opacity duration-200 ${
                    isSearchOpen ? "opacity-100" : "opacity-0"
                  }`}
                />
              </form>

              <button
                type={isSearchOpen ? "submit" : "button"}
                form={isSearchOpen ? "desktop-header-search-form" : undefined}
                onClick={isSearchOpen ? undefined : () => setIsSearchOpen(true)}
                aria-label={isSearchOpen ? "جستجو" : "باز کردن جستجو"}
                aria-expanded={isSearchOpen}
                className="absolute right-0 top-0 z-20 grid size-10 place-items-center rounded-lg text-text-primary transition-colors hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary/70"
              >
                <SearchIcon className="size-[22px]" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Logo */}
          <Link
            href="/"
            aria-label="فلوریسا، صفحه خانه"
            className="flex w-[113px] items-center justify-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/70"
          >
            <Image
              src="/images/brand/florisa-logo.svg"
              alt="فلوریسا"
              width={113}
              height={44}
              priority
              className="h-auto w-full object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav
            aria-label="ناوبری اصلی دسکتاپ"
            className="flex items-center justify-end gap-8"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.activePath ||
                pathname.startsWith(`${item.activePath}/`);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-sm py-2 text-desktop-ui-label transition-colors ${
                    isActive
                      ? "font-bold text-text-brand after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-action-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div aria-hidden="true" className="hidden h-[68px] lg:block" />
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
      className="relative grid size-10 place-items-center rounded-full text-text-primary transition-colors hover:bg-white/[0.06] hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/70"
    >
      {icon}

      {count > 0 ? (
        <span className="absolute -left-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#f1b6b8] text-[9px] font-black text-[#251516]">
          {toPersianDigits(count)}
        </span>
      ) : null}
    </Link>
  );
}
