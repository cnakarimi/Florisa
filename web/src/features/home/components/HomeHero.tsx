"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

const HERO_IMAGE_TRANSITION =
  "transition-opacity duration-700 ease-out motion-reduce:transition-none";

interface HomeHeroProps {
  slides: HomeSlide[];
  status: HomeSlidesStatus;
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

function ResponsiveSlideImage({
  slide,
  onError,
  isVisible = true,
}: {
  slide: HomeSlide;
  onError: () => void;
  isVisible?: boolean;
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
    <picture
      className={`${isVisible ? "opacity-100" : "opacity-0"} ${HERO_IMAGE_TRANSITION}`}
    >
      <source
        media={sources.desktopMedia}
        srcSet={desktopProps.srcSet}
        sizes={desktopProps.sizes}
      />

      <img
        {...mobileProps}
        alt={slide.image_alt}
        onError={onError}
        className="absolute inset-0 size-full object-cover object-[center_45%]"
      />
    </picture>
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

function HeroContent({ slide }: { slide: HomeSlide }) {
  const presentation = getHomeHeroPresentation(slide);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-8 pt-6 text-center lg:px-12 lg:pb-10">
      <div
        dir="rtl"
        className="flex max-w-2xl flex-col items-center gap-3 lg:gap-4"
      >
        <h1
          id="home-hero-title"
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

function HeroPagination({
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
                  : "w-1.5 bg-text-inverse-muted"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function HomeHero({ slides, status }: HomeHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [hasImageError, setHasImageError] = useState(false);

  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex((index) => correctedSlideIndex(index, slides.length));
  }, [slides.length]);

  const slide = selectHomeHeroSlide(status, slides, currentIndex);

  useEffect(() => {
    setHasImageError(false);
  }, [slide?.id]);

  const changeSlide = (index: number) => {
    if (index === currentIndex) return;

    setPreviousIndex(currentIndex);
    setCurrentIndex(index);

    window.setTimeout(() => {
      setPreviousIndex(null);
    }, 700);
  };

  if (status === "loading") {
    return <HeroLoading />;
  }

  if (!slide) {
    return <FallbackHero />;
  }

  const hasMultipleSlides = slides.length > 1;

  const move = (direction: "previous" | "next") => {
    setPreviousIndex(currentIndex);

    setCurrentIndex((index) =>
      adjacentSlideIndex(index, direction, slides.length),
    );

    window.setTimeout(() => {
      setPreviousIndex(null);
    }, 700);
  };
  return (
    <section
      className={`relative isolate mx-auto w-full touch-pan-y overflow-hidden ${HERO_SIZE_CLASS}`}
      aria-roledescription="اسلایدر"
      aria-label="پیشنهادهای ویژه فلوریسا"
      data-home-slide-source="api"
      data-home-slide-id={slide.id}
      tabIndex={hasMultipleSlides ? 0 : undefined}
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
          currentIndex + 1,
        )} از ${toPersianDigits(slides.length)}`}
        className="absolute inset-0"
      >
        {hasImageError ? (
          <FallbackHeroImage />
        ) : (
          <>
            {previousIndex !== null && slides[previousIndex] ? (
              <ResponsiveSlideImage
                slide={slides[previousIndex]}
                onError={() => setHasImageError(true)}
                isVisible={false}
              />
            ) : null}

            <ResponsiveSlideImage
              slide={slide}
              onError={() => setHasImageError(true)}
              isVisible
            />
          </>
        )}

        <HeroOverlay />

        <HeroContent slide={slide} />
      </div>

      <HeroPagination
        slides={slides}
        currentIndex={currentIndex}
        onSelect={changeSlide}
      />
    </section>
  );
}
