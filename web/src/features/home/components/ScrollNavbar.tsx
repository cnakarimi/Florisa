"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";

interface ScrollNavbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onLogoClick: () => void;
}

const FADE_START = 32;
const FADE_DISTANCE = 128;

export function ScrollNavbar({
  searchQuery,
  onSearch,
  onLogoClick,
}: ScrollNavbarProps) {
  const [draftQuery, setDraftQuery] = useState(searchQuery);
  const [visibility, setVisibility] = useState(0);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const updateVisibility = () => {
      animationFrame.current = null;

      const progress = Math.min(
        Math.max((window.scrollY - FADE_START) / FADE_DISTANCE, 0),
        1,
      );

      setVisibility((current) =>
        Math.abs(current - progress) > 0.01 ? progress : current,
      );
    };

    const handleScroll = () => {
      if (animationFrame.current !== null) return;

      animationFrame.current = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draftQuery.trim());
  };

  const isInteractive = visibility > 0.08;

  return (
    <header
      dir="rtl"
      className="pointer-events-none fixed left-1/2 top-0 z-50 w-full max-w-screen-lg -translate-x-1/2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6"
      aria-hidden={!isInteractive}
    >
      <div
        className="mx-auto flex h-14 items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#111512]/85 px-3 backdrop-blur-xl sm:h-16 sm:px-4"
        style={{
          opacity: visibility,
          pointerEvents: isInteractive ? "auto" : "none",
          transform: `translateY(${(1 - visibility) * -14}px)`,
          transition:
            "opacity 120ms linear, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          type="button"
          onClick={onLogoClick}
          className="flex w-[82px] shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]/60 sm:w-[108px]"
          aria-label="بازگشت به ابتدای صفحه فلوریسا"
          tabIndex={isInteractive ? 0 : -1}
        >
          <img
            src="/images/brand/florisa-logo.svg"
            alt="فلوریسا"
            className="h-auto w-full object-contain"
          />
        </button>

        <form
          role="search"
          onSubmit={handleSubmit}
          className="relative min-w-0 flex-1"
        >
          <label htmlFor="scroll-navbar-search" className="sr-only">
            جست‌وجوی محصولات فلوریسا
          </label>

          <Search
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
          />

          <input
            id="scroll-navbar-search"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="جست‌وجوی گل و گیاه..."
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] pr-10 pl-3 text-xs text-[#f0eee9] outline-none transition placeholder:text-white/30 hover:border-white/[0.12] focus:border-[#c7a23c]/35 focus:bg-white/[0.05] sm:h-11"
            tabIndex={isInteractive ? 0 : -1}
          />
        </form>
      </div>
    </header>
  );
}
