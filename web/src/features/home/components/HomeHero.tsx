"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  adjacentSlideIndex,
  classifyCtaUrl,
  correctedSlideIndex,
  responsiveImageSources,
} from "../slider/logic";
import type { HomeSlide, HomeSlidesStatus } from "../slider/types";
import { toPersianDigits } from "../utils/persian";

const FALLBACK_HERO_IMAGE = "/images/hero_1.png";
const SWIPE_THRESHOLD = 48;

interface HomeHeroProps {
  slides: HomeSlide[];
  status: HomeSlidesStatus;
}

function FallbackHeroImage() {
  return (
    <Image
      fill
      src={FALLBACK_HERO_IMAGE}
      alt="فضای خانه با گیاهان آپارتمانی"
      sizes="(min-width: 1275px) 1275px, 100vw"
      quality={80}
      priority
      className="object-cover object-center"
    />
  );
}

function ResponsiveSlideImage({
  slide,
  onError,
}: {
  slide: HomeSlide;
  onError: () => void;
}) {
  const sources = responsiveImageSources(slide);

  const common = {
    alt: slide.image_alt,
    quality: 80 as const,
  };

  const { props: mobileProps } = getImageProps({
    ...common,
    src: sources.mobile,
    width: 900,
    height: 1200,
    sizes: "(max-width: 1023px) 100vw, 1px",
    priority: true,
  });

  const { props: desktopProps } = getImageProps({
    ...common,
    src: sources.desktop,
    width: 1275,
    height: 400,
    sizes: "(min-width: 1275px) 1275px, 100vw",
    priority: true,
  });

  return (
    <picture>
      <source
        media={sources.desktopMedia}
        srcSet={desktopProps.srcSet}
        sizes={desktopProps.sizes}
      />

      <img
        {...mobileProps}
        alt={slide.image_alt}
        onError={onError}
        className="absolute inset-0 size-full object-cover object-center"
      />
    </picture>
  );
}

function HeroOverlay() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.58)_100%)]" />
  );
}

function FallbackHero({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <section
      className="relative isolate mx-auto h-[250px] w-full overflow-hidden lg:h-[400px]"
      aria-labelledby="home-hero-title"
      aria-busy={isLoading || undefined}
    >
      <FallbackHeroImage />
      <HeroOverlay />

      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-8 pt-6 text-center lg:px-12 lg:pb-10">
        <div className="flex max-w-2xl flex-col items-center gap-6" dir="rtl">
          <h1
            id="home-hero-title"
            className="line-clamp-2 font-sans text-center text-2xl/8 font-bold tracking-normal text-white lg:text-5xl/[64px]"
          >
            به خونت جون بده
          </h1>

          <Link
            href="/shop"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-action-primary px-5 py-2 text-xs/5 font-bold text-background-primary transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 lg:min-h-11 lg:px-6"
          >
            مشاهده محصولات
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeHero({ slides, status }: HomeHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);

  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex((index) => correctedSlideIndex(index, slides.length));
  }, [slides.length]);

  const slide = slides[currentIndex];

  useEffect(() => {
    setHasImageError(false);
  }, [slide?.id]);

  if (status !== "ready" || !slide) {
    return <FallbackHero isLoading={status === "loading"} />;
  }

  const hasMultipleSlides = slides.length > 1;
  const cta = classifyCtaUrl(slide.cta_url);

  const move = (direction: "previous" | "next") => {
    setCurrentIndex((index) =>
      adjacentSlideIndex(index, direction, slides.length),
    );
  };

  return (
    <section
      className="relative isolate mx-auto h-[250px] w-full touch-pan-y overflow-hidden lg:h-[400px]"
      aria-roledescription="اسلایدر"
      aria-label="پیشنهادهای ویژه فلوریسا"
      onKeyDown={(event) => {
        if (!hasMultipleSlides) return;

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move("next");
        } else if (event.key === "ArrowRight") {
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

        if (Math.abs(distance) < SWIPE_THRESHOLD) return;

        move(distance < 0 ? "next" : "previous");
      }}
      tabIndex={hasMultipleSlides ? 0 : undefined}
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
          <ResponsiveSlideImage
            slide={slide}
            onError={() => setHasImageError(true)}
          />
        )}

        <HeroOverlay />

        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pb-8 pt-6 text-center lg:px-12 lg:pb-10">
          <div className="flex flex-col items-center gap-3" dir="rtl">
            <h1
              id="home-hero-title"
              className="line-clamp-2 text-2xl/8 font-bold text-white lg:text-4xl/12 lg:font-extrabold"
            >
              {slide.title}
            </h1>

            {cta && slide.cta_label ? (
              <Link
                href={cta.href}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-action-primary px-5 py-2 text-xs/5 font-bold text-background-primary transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 lg:min-h-11 lg:px-6"
              >
                {slide.cta_label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {hasMultipleSlides ? (
        <div
          role="group"
          className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center lg:bottom-3"
          aria-label="انتخاب اسلاید"
        >
          {slides.map((item, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`نمایش اسلاید ${toPersianDigits(index + 1)}`}
                aria-current={isActive ? "true" : undefined}
                className="grid size-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                    isActive ? "w-5 bg-action-primary" : "w-1.5 bg-white/55"
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
