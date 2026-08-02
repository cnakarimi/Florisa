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
      if (animationFrame.current !== null) {
        return;
      }

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
        className="mx-auto flex h-[62px] items-center gap-2.5 rounded-[20px] border border-white/[0.09] bg-[#111512]/90 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:h-[68px] sm:gap-4 sm:rounded-[22px] sm:p-2.5"
        style={{
          opacity: visibility,
          pointerEvents: isInteractive ? "auto" : "none",
          transform: `translateY(${(1 - visibility) * -18}px) scale(${0.985 + visibility * 0.015})`,
          transition:
            "opacity 120ms linear, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          type="button"
          onClick={onLogoClick}
          className="group flex h-full w-[92px] shrink-0 items-center justify-center rounded-[14px] px-1.5 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]/70 sm:w-[126px] sm:px-2"
          aria-label="بازگشت به ابتدای صفحه فلوریسا"
          tabIndex={isInteractive ? 0 : -1}
        >
          <img
            src="/images/brand/florisa-logo.svg"
            alt="فلوریسا"
            className="h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
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
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a296] sm:right-4 sm:h-[18px] sm:w-[18px]"
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
            className="h-11 w-full rounded-[14px] border border-white/[0.08] bg-black/20 pr-10 pl-[70px] text-[11px] text-[#f0eee9] outline-none transition placeholder:text-white/35 hover:border-white/[0.13] focus:border-[#bfa34b]/45 focus:bg-black/30 focus:ring-4 focus:ring-[#bfa34b]/[0.06] sm:h-12 sm:rounded-[16px] sm:pr-12 sm:pl-24 sm:text-xs"
            tabIndex={isInteractive ? 0 : -1}
          />

          <button
            type="submit"
            className="absolute left-1.5 top-1/2 inline-flex h-8 -translate-y-1/2 items-center justify-center rounded-[10px] bg-[#c7a23c] px-3 text-[10px] font-extrabold text-[#18170f] shadow-[0_6px_18px_rgba(199,162,60,0.16)] transition hover:bg-[#d7b64b] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0d77e] sm:left-2 sm:h-9 sm:px-4 sm:text-[11px]"
            tabIndex={isInteractive ? 0 : -1}
          >
            جست‌وجو
          </button>
        </form>
      </div>
    </header>
  );
}
