"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      sizes="100vw"
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
    width: 1920,
    height: 720,
    sizes: "(min-width: 1600px) 1600px, 100vw",
    priority: true,
  });

  return (
    <picture>
      <source
        media={sources.desktopMedia}
        srcSet={desktopProps.srcSet}
        sizes={desktopProps.sizes}
      />
      {/* The picture source performs art direction without downloading both creatives. */}
      <img
        {...mobileProps}
        alt={slide.image_alt}
        onError={onError}
        className="absolute inset-0 size-full object-cover object-center"
      />
    </picture>
  );
}

function FallbackHero({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <section
      className="relative isolate mx-auto h-[480px] w-full overflow-hidden"
      aria-labelledby="home-hero-title"
      aria-busy={isLoading || undefined}
    >
      <FallbackHeroImage />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101110] via-black/5 to-black/30 lg:bg-black/25" />
      <div className="absolute inset-0 hidden bg-gradient-to-t from-black/75 via-black/10 to-black/40 lg:block" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-8 px-6 pt-5 text-center lg:px-12 lg:pt-0">
        <h1
          id="home-hero-title"
          className="text-[36px] font-bold leading-tight tracking-tight text-white"
        >
          به خونت جون بده
        </h1>
        <Link
          href="/shop"
          className="mt-5 min-h-11 rounded-full border border-white/25 bg-black/20 px-6 py-3 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-[#c7a23c]/70 hover:bg-[#c7a23c]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] sm:text-sm lg:mb-5 lg:mt-0 lg:border-white/15 lg:bg-black/25 lg:text-xs"
        >
          دنیای گیاهان خانگی
        </Link>
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
      className="relative isolate mx-auto h-[480px] w-full touch-pan-y overflow-hidden"
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
        if (hasMultipleSlides && event.isPrimary) pointerStartX.current = event.clientX;
      }}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
      onPointerUp={(event) => {
        if (pointerStartX.current === null || !hasMultipleSlides) return;
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
        aria-label={`${toPersianDigits(currentIndex + 1)} از ${toPersianDigits(slides.length)}`}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35 lg:bg-gradient-to-l lg:from-black/65 lg:via-black/20 lg:to-black/30" />

        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pb-14 pt-8 text-center sm:px-10 lg:justify-start lg:px-16 lg:text-right xl:px-24">
          <div className="max-w-2xl">
            {slide.eyebrow ? (
              <p className="mb-3 text-sm font-bold text-[#e1bd4d] sm:text-base">
                {slide.eyebrow}
              </p>
            ) : null}
            <h1
              id="home-hero-title"
              className="line-clamp-3 text-3xl font-black leading-[1.35] tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {slide.title}
            </h1>
            {slide.description ? (
              <p className="mx-auto mt-4 line-clamp-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base lg:mx-0 lg:text-lg">
                {slide.description}
              </p>
            ) : null}
            {cta && slide.cta_label ? (
              <Link
                href={cta.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d4af37] px-6 py-3 text-sm font-extrabold text-black transition-colors hover:bg-[#e1bd4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/70"
              >
                {slide.cta_label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            onClick={() => move("previous")}
            aria-label="اسلاید قبلی"
            className="absolute right-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition hover:border-[#d4af37] hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] lg:grid"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move("next")}
            aria-label="اسلاید بعدی"
            className="absolute left-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition hover:border-[#d4af37] hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] lg:grid"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div
            className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/25 px-2 backdrop-blur-sm"
            aria-label="انتخاب اسلاید"
          >
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`نمایش اسلاید ${toPersianDigits(index + 1)}`}
                aria-current={index === currentIndex ? "true" : undefined}
                className="grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 rounded-full transition-[width,background-color] motion-reduce:transition-none ${
                    index === currentIndex
                      ? "w-6 bg-[#d4af37]"
                      : "w-1.5 bg-white/55"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
