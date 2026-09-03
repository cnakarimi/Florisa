"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";

const SCROLL_FADE_START = 32;
const SCROLL_FADE_DISTANCE = 128;
const INTERACTIVE_VISIBILITY_THRESHOLD = 0.08;

interface ScrollNavbarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onLogoClick: () => void;
}

function getScrollVisibility(scrollY: number) {
  return Math.min(
    Math.max((scrollY - SCROLL_FADE_START) / SCROLL_FADE_DISTANCE, 0),
    1,
  );
}

export function ScrollNavbar({
  searchQuery,
  onSearch,
  onLogoClick,
}: ScrollNavbarProps) {
  const [draftQuery, setDraftQuery] = useState(searchQuery);
  const [visibility, setVisibility] = useState(0);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const updateVisibility = () => {
      animationFrameRef.current = null;

      const nextVisibility = getScrollVisibility(window.scrollY);

      setVisibility((current) =>
        Math.abs(current - nextVisibility) > 0.01 ? nextVisibility : current,
      );
    };

    const handleScroll = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSearch(draftQuery.trim());
  };

  const isInteractive = visibility > INTERACTIVE_VISIBILITY_THRESHOLD;

  return (
    <header
      dir="rtl"
      aria-hidden={!isInteractive}
      className="pointer-events-none fixed left-1/2 top-0 z-50 w-full max-w-screen-lg -translate-x-1/2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6"
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
          aria-label="بازگشت به ابتدای صفحه فلوریسا"
          tabIndex={isInteractive ? 0 : -1}
          className="flex w-[82px] shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]/60 sm:w-[108px]"
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
            tabIndex={isInteractive ? 0 : -1}
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] pr-10 pl-3 text-xs text-[#f0eee9] outline-none transition placeholder:text-white/30 hover:border-white/[0.12] focus:border-[#c7a23c]/35 focus:bg-white/[0.05] sm:h-11"
          />
        </form>
      </div>
    </header>
  );
}
