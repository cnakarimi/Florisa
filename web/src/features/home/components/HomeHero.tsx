"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { toPersianDigits } from "@/utils/persian";

import {
  adjacentSlideIndex,
  correctedSlideIndex,
  getHomeHeroPresentation,
  responsiveImageSources,
  selectHomeHeroSlide,
} from "../slider/logic";

import type { HomeSlide, HomeSlidesStatus } from "../slider/types";

const FALLBACK_HERO_IMAGE = "/images/hero_1.png";

const SWIPE_THRESHOLD = 48;

const HERO_SIZE_CLASS = "h-[250px] lg:h-[400px] xl:h-[460px] 2xl:h-[540px]";

const HERO_TRANSITION_DURATION_MS = 700;

const HERO_AUTOPLAY_INTERVAL_MS = 5_000;

const HERO_SLIDE_TRANSITION =
  "transform-gpu transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transform-none motion-reduce:transition-none";

const HERO_IMAGE_TRANSITION =
  "transform-gpu transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transform-none motion-reduce:transition-none";

const HERO_CONTENT_TRANSITION =
  "transform-gpu transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transform-none motion-reduce:transition-none motion-reduce:delay-0";

type TransitionDirection = "previous" | "next";
type TransitionPhase = "idle" | "preparing" | "running";
type SlideMotionRole = "active" | "entering" | "leaving";

interface HeroTransitionState {
  activeIndex: number;
  leavingIndex: number | null;
  direction: TransitionDirection;
  phase: TransitionPhase;
}

interface HomeHeroProps {
  slides: HomeSlide[];
  status: HomeSlidesStatus;
}

function getSlideMotionClass(
  role: SlideMotionRole,
  direction: TransitionDirection,
  phase: TransitionPhase,
) {
  if (role === "active") {
    return "translate-x-0 opacity-100";
  }

  if (role === "entering") {
    if (phase === "preparing") {
      return direction === "next"
        ? "translate-x-full opacity-0"
        : "-translate-x-full opacity-0";
    }

    return "translate-x-0 opacity-100";
  }

  if (phase === "preparing") {
    return "translate-x-0 opacity-100";
  }

  return direction === "next"
    ? "-translate-x-full opacity-0"
    : "translate-x-full opacity-0";
}

function getImageScaleClass(role: SlideMotionRole, phase: TransitionPhase) {
  if (role === "entering" && phase === "preparing") {
    return "scale-[1.04]";
  }

  if (role === "leaving" && phase === "running") {
    return "scale-[1.03]";
  }

  return "scale-100";
}

function getContentMotionClass(role: SlideMotionRole, phase: TransitionPhase) {
  if (role === "active") {
    return "translate-y-0 opacity-100";
  }

  if (role === "entering") {
    return phase === "preparing"
      ? "translate-y-4 opacity-0"
      : "translate-y-0 opacity-100 delay-150";
  }

  return phase === "preparing"
    ? "translate-y-0 opacity-100"
    : "-translate-y-3 opacity-0";
}

function useHeroTransition(slideCount: number) {
  const [transition, setTransition] = useState<HeroTransitionState>({
    activeIndex: 0,
    leavingIndex: null,
    direction: "next",
    phase: "idle",
  });

  useEffect(() => {
    setTransition((current) => {
      const activeIndex = correctedSlideIndex(current.activeIndex, slideCount);

      if (
        activeIndex === current.activeIndex &&
        current.leavingIndex === null &&
        current.phase === "idle"
      ) {
        return current;
      }

      return {
        ...current,
        activeIndex,
        leavingIndex: null,
        phase: "idle",
      };
    });
  }, [slideCount]);

  useEffect(() => {
    if (transition.phase === "preparing") {
      const animationFrame = window.requestAnimationFrame(() => {
        setTransition((current) =>
          current.phase === "preparing"
            ? { ...current, phase: "running" }
            : current,
        );
      });

      return () => window.cancelAnimationFrame(animationFrame);
    }

    if (transition.phase === "running") {
      const timeout = window.setTimeout(() => {
        setTransition((current) =>
          current.phase === "running"
            ? { ...current, leavingIndex: null, phase: "idle" }
            : current,
        );
      }, HERO_TRANSITION_DURATION_MS);

      return () => window.clearTimeout(timeout);
    }
  }, [transition.phase]);

  const select = useCallback(
    (requestedIndex: number) => {
      setTransition((current) => {
        const activeIndex = correctedSlideIndex(current.activeIndex, slideCount);
        const nextIndex = correctedSlideIndex(requestedIndex, slideCount);

        if (
          slideCount <= 1 ||
          current.phase !== "idle" ||
          nextIndex === activeIndex
        ) {
          return current;
        }

        return {
          activeIndex: nextIndex,
          leavingIndex: activeIndex,
          direction: nextIndex > activeIndex ? "next" : "previous",
          phase: "preparing",
        };
      });
    },
    [slideCount],
  );

  const move = useCallback(
    (direction: TransitionDirection) => {
      setTransition((current) => {
        if (slideCount <= 1 || current.phase !== "idle") {
          return current;
        }

        const activeIndex = correctedSlideIndex(current.activeIndex, slideCount);
        const nextIndex = adjacentSlideIndex(activeIndex, direction, slideCount);

        return {
          activeIndex: nextIndex,
          leavingIndex: activeIndex,
          direction,
          phase: "preparing",
        };
      });
    },
    [slideCount],
  );

  return { transition, select, move };
}

function HeroOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-overlay-hero"
    />
  );
}

function FallbackHeroImage() {
  return (
    <Image
      fill
      src={FALLBACK_HERO_IMAGE}
      alt="فضای خانه با گیاهان آپارتمانی"
      sizes="100vw"
      quality={80}
      priority
      className="object-cover object-[center_45%]"
    />
  );
}

const ResponsiveSlideImage = memo(function ResponsiveSlideImage({
  slide,
  onError,
  isDecorative = false,
}: {
  slide: HomeSlide;
  onError?: () => void;
  isDecorative?: boolean;
}) {
  const sources = responsiveImageSources(slide);

  const common = {
    alt: slide.image_alt,
    quality: 80 as const,
  };

  const { props: mobileProps } = getImageProps({
    ...common,
    src: sources.mobile,
    width: 1275,
    height: 850,
    sizes: "(max-width: 1023px) 100vw, 1px",
    priority: true,
  });

  const { props: desktopProps } = getImageProps({
    ...common,
    src: sources.desktop,
    width: 2172,
    height: 724,
    sizes: "(min-width: 1024px) 100vw, 1px",
    priority: true,
  });

  return (
    <picture className="block size-full">
      <source
        media={sources.desktopMedia}
        srcSet={desktopProps.srcSet}
        sizes={desktopProps.sizes}
      />

      <img
        {...mobileProps}
        alt={isDecorative ? "" : slide.image_alt}
        onError={onError}
        className="absolute inset-0 size-full object-cover object-[center_45%]"
      />
    </picture>
  );
});

function HeroSlideImage({
  slide,
  role,
  direction,
  phase,
  onError,
}: {
  slide: HomeSlide;
  role: SlideMotionRole;
  direction: TransitionDirection;
  phase: TransitionPhase;
  onError?: () => void;
}) {
  return (
    <div
      className={`absolute inset-0 ${HERO_SLIDE_TRANSITION} ${getSlideMotionClass(
        role,
        direction,
        phase,
      )}`}
      aria-hidden={role === "leaving" || undefined}
    >
      <div
        className={`absolute inset-0 ${HERO_IMAGE_TRANSITION} ${getImageScaleClass(
          role,
          phase,
        )}`}
      >
        <ResponsiveSlideImage
          slide={slide}
          onError={onError}
          isDecorative={role === "leaving"}
        />
      </div>
    </div>
  );
}

function HeroLoading() {
  return (
    <section
      className={`relative isolate mx-auto w-full overflow-hidden bg-background-primary ${HERO_SIZE_CLASS}`}
      aria-busy="true"
      aria-label="در حال بارگذاری پیشنهادهای ویژه"
    >
      <div className="absolute inset-0 animate-pulse bg-surface-muted" />
    </section>
  );
}
function FallbackHero() {
  return (
    <section
      className={`relative isolate mx-auto w-full overflow-hidden ${HERO_SIZE_CLASS}`}
      aria-labelledby="home-hero-title"
    >
      <FallbackHeroImage />

      <HeroOverlay />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-8 pt-6 text-center lg:px-12 lg:pb-10">
        <div
          dir="rtl"
          className="flex max-w-2xl flex-col items-center gap-3 lg:gap-4"
        >
          <h1
            id="home-hero-title"
            className="line-clamp-2 text-mobile-heading-xl text-text-inverse lg:text-desktop-display-xl"
          >
            به خونت جون بده
          </h1>

          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-full px-7 py-2.5 text-desktop-ui-label font-bold transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary"
            style={{
              backgroundColor: "var(--action-primary)",
              color: "var(--background-primary)",
            }}
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeroContent({
  slide,
  role,
  phase,
}: {
  slide: HomeSlide;
  role: SlideMotionRole;
  phase: TransitionPhase;
}) {
  const presentation = getHomeHeroPresentation(slide);
  const isCurrent = role !== "leaving";

  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center px-4 pb-8 pt-6 text-center lg:px-12 lg:pb-10 ${HERO_CONTENT_TRANSITION} ${getContentMotionClass(
        role,
        phase,
      )}`}
      aria-hidden={isCurrent ? undefined : true}
    >
      <div
        dir="rtl"
        className="flex max-w-2xl flex-col items-center gap-3 lg:gap-4"
      >
        <h1
          id={isCurrent ? "home-hero-title" : undefined}
          className="line-clamp-2 text-mobile-heading-xl lg:text-desktop-heading-h1"
          style={{
            color: presentation.titleTextColor,
          }}
        >
          {presentation.title}
        </h1>

        {presentation.ctaHref && presentation.ctaLabel ? (
          <Link
            href={presentation.ctaHref}
            tabIndex={isCurrent ? undefined : -1}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-7 py-2.5 text-desktop-ui-label font-bold transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary"
            style={{
              backgroundColor: presentation.buttonBackgroundColor,
              color: presentation.buttonTextColor,
            }}
          >
            {presentation.ctaLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

const HeroPagination = memo(function HeroPagination({
  slides,
  currentIndex,
  onSelect,
}: {
  slides: HomeSlide[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  if (slides.length <= 1) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="انتخاب اسلاید"
      className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1"
    >
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;

        return (
          <button
            key={slide.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`نمایش اسلاید ${toPersianDigits(index + 1)}`}
            aria-current={isActive ? "true" : undefined}
            className="grid size-4 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                isActive
                  ? "w-5 bg-action-primary"
                  : "w-1.5 bg-neutral-0/60"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
});

export function HomeHero({ slides, status }: HomeHeroProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const { transition, select, move } = useHeroTransition(slides.length);

  const pointerStartX = useRef<number | null>(null);

  const slide = selectHomeHeroSlide(status, slides, transition.activeIndex);
  const leavingSlide =
    transition.leavingIndex === null
      ? null
      : (slides[transition.leavingIndex] ?? null);

  useEffect(() => {
    setHasImageError(false);
  }, [slide?.id]);

  useEffect(() => {
    if (
      status !== "ready" ||
      slides.length <= 1 ||
      isHovered ||
      hasFocusWithin
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      move("next");
    }, HERO_AUTOPLAY_INTERVAL_MS);

    return () => window.clearTimeout(timeout);
  }, [
    hasFocusWithin,
    isHovered,
    move,
    slides.length,
    status,
    transition.activeIndex,
  ]);

  const handleImageError = useCallback(() => {
    setHasImageError(true);
  }, []);

  if (status === "loading") {
    return <HeroLoading />;
  }

  if (!slide) {
    return <FallbackHero />;
  }

  const hasMultipleSlides = slides.length > 1;
  const activeRole: SlideMotionRole = leavingSlide ? "entering" : "active";

  return (
    <section
      className={`relative isolate mx-auto w-full touch-pan-y overflow-hidden ${HERO_SIZE_CLASS}`}
      aria-roledescription="اسلایدر"
      aria-label="پیشنهادهای ویژه فلوریسا"
      data-home-slide-source="api"
      data-home-slide-id={slide.id}
      tabIndex={hasMultipleSlides ? 0 : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => {
        const nextFocusedElement = event.relatedTarget;

        if (
          !(nextFocusedElement instanceof Node) ||
          !event.currentTarget.contains(nextFocusedElement)
        ) {
          setHasFocusWithin(false);
        }
      }}
      onKeyDown={(event) => {
        if (!hasMultipleSlides) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move("next");
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          move("previous");
        }
      }}
      onPointerDown={(event) => {
        if (hasMultipleSlides && event.isPrimary) {
          pointerStartX.current = event.clientX;
        }
      }}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
      onPointerUp={(event) => {
        if (pointerStartX.current === null || !hasMultipleSlides) {
          return;
        }

        const distance = event.clientX - pointerStartX.current;

        pointerStartX.current = null;

        if (Math.abs(distance) < SWIPE_THRESHOLD) {
          return;
        }

        move(distance < 0 ? "next" : "previous");
      }}
    >
      <div
        role="group"
        aria-roledescription="اسلاید"
        aria-label={`${toPersianDigits(
          transition.activeIndex + 1,
        )} از ${toPersianDigits(slides.length)}`}
        className="absolute inset-0"
      >
        {hasImageError ? (
          <FallbackHeroImage />
        ) : (
          <>
            {leavingSlide ? (
              <HeroSlideImage
                key={leavingSlide.id}
                slide={leavingSlide}
                role="leaving"
                direction={transition.direction}
                phase={transition.phase}
              />
            ) : null}

            <HeroSlideImage
              key={slide.id}
              slide={slide}
              role={activeRole}
              direction={transition.direction}
              phase={transition.phase}
              onError={handleImageError}
            />
          </>
        )}

        <HeroOverlay />

        {leavingSlide ? (
          <HeroContent
            key={leavingSlide.id}
            slide={leavingSlide}
            role="leaving"
            phase={transition.phase}
          />
        ) : null}

        <HeroContent
          key={slide.id}
          slide={slide}
          role={activeRole}
          phase={transition.phase}
        />
      </div>

      <HeroPagination
        slides={slides}
        currentIndex={transition.activeIndex}
        onSelect={select}
      />
    </section>
  );
}
