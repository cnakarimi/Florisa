"use client";

import { Search } from "lucide-react";

import { useEffect, useState, type FormEvent } from "react";

import Image from "next/image";

interface MobileTopNavbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onLogoClick: () => void;
}

export function MobileTopNavbar({
  searchQuery,
  onSearch,
  onLogoClick,
}: MobileTopNavbarProps) {
  const [draftQuery, setDraftQuery] = useState(searchQuery);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draftQuery.trim());
  };

  return (
    <header
      dir="rtl"
      className="
        fixed
        left-0
        top-0
        z-50
        w-full
      "
    >
      <div
        className="
          relative
          mx-auto
          flex
          h-14
          w-full
          max-w-screen-lg
          items-center
          gap-3
          overflow-hidden
          px-3
          sm:h-16
          sm:px-4
        "
      >
        <div
          className="
            absolute
            inset-0
            -z-20
            bg-[#11130F]
          "
        />

        <div
          className={`
            absolute
            inset-0
            -z-10
            transition-[opacity,backdrop-filter,box-shadow]
            duration-300
            ease-out
            ${
              isScrolled
                ? `
                  opacity-100
                  border
                  border-white/[0.08]
                  bg-[#161616]/75
                  shadow-navbar
                  backdrop-blur-2xl
                `
                : `
                  opacity-0
                  border-transparent
                  shadow-none
                  backdrop-blur-none
                `
            }
          `}
        />

        <button
          type="button"
          onClick={onLogoClick}
          aria-label="بازگشت به ابتدای صفحه فلوریسا"
          className="
            flex
            w-[82px]
            shrink-0
            items-center
            rounded-lg
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#c7a23c]/60
            sm:w-[108px]
          "
        >
          <Image
            src="/images/brand/florisa-logo.svg"
            alt="فلوریسا"
            width={108}
            height={42}
            className="h-auto w-full object-contain"
          />
        </button>

        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative min-w-0 flex-1"
        >
          <label htmlFor="mobile-navbar-search" className="sr-only">
            جست‌وجوی محصولات فلوریسا
          </label>

          <Search
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-3.5
              top-1/2
              size-4
              -translate-y-1/2
              text-white/35
            "
          />

          <input
            id="mobile-navbar-search"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="جست‌وجوی گل و گیاه..."
            className="
              h-10
              w-full
              rounded-xl
              border
              border-white/[0.07]
              bg-[#202220]
              pr-10
              pl-3
              text-xs
              text-[#f0eee9]
              outline-none
              transition
              placeholder:text-white/30
              hover:border-white/[0.12]
              focus:border-[#c7a23c]/35
              sm:h-11
            "
          />
        </form>
      </div>
    </header>
  );
}
