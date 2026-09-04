"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { CatalogProduct } from "@/features/catalog/types";

interface ProductsSliderProps {
  latestProducts: CatalogProduct[];
  isProductsLoading: boolean;
  productsError: string | null;

  onRetryProducts: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

export function ProductsSlider({
  latestProducts,
  isProductsLoading,
  productsError,
  onRetryProducts,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}: ProductsSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  const [canSlideLeft, setCanSlideLeft] = useState(false);
  const [canSlideRight, setCanSlideRight] = useState(false);

  const updateSliderState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const slides = Array.from(
      slider.querySelectorAll<HTMLElement>("[data-product-slide]"),
    );

    if (slides.length === 0) {
      setCanSlideLeft(false);
      setCanSlideRight(false);
      activeIndexRef.current = 0;
      return;
    }

    const sliderRect = slider.getBoundingClientRect();
    const firstSlideRect = slides[0].getBoundingClientRect();
    const lastSlideRect = slides[slides.length - 1].getBoundingClientRect();

    setCanSlideLeft(lastSlideRect.left < sliderRect.left - 2);
    setCanSlideRight(firstSlideRect.right > sliderRect.right + 2);

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const distanceFromStart = Math.abs(slideRect.right - sliderRect.right);

      if (distanceFromStart < closestDistance) {
        closestDistance = distanceFromStart;
        closestIndex = index;
      }
    });

    activeIndexRef.current = closestIndex;
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(updateSliderState);
    const resizeObserver = new ResizeObserver(updateSliderState);

    resizeObserver.observe(slider);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [latestProducts.length, updateSliderState]);

  const scrollToProduct = (direction: "left" | "right") => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const slides = Array.from(
      slider.querySelectorAll<HTMLElement>("[data-product-slide]"),
    );

    if (slides.length === 0) {
      return;
    }

    const indexChange = direction === "left" ? 1 : -1;

    const targetIndex = Math.min(
      Math.max(activeIndexRef.current + indexChange, 0),
      slides.length - 1,
    );

    activeIndexRef.current = targetIndex;

    slides[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  if (isProductsLoading) {
    return <CatalogFeedback kind="loading" />;
  }

  if (productsError && latestProducts.length === 0) {
    return (
      <CatalogFeedback
        kind="error"
        message={productsError}
        onRetry={onRetryProducts}
      />
    );
  }

  if (latestProducts.length === 0) {
    return (
      <CatalogFeedback
        kind="empty"
        message="در حال حاضر محصولی برای نمایش وجود ندارد."
      />
    );
  }

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        dir="rtl"
        role="region"
        tabIndex={0}
        onScroll={updateSliderState}
        aria-label="اسلایدر جدیدترین محصولات"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scroll-smooth overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/70 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:mx-0 lg:gap-5 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {latestProducts.map((product) => (
          <div
            key={product.id}
            data-product-slide
            className="w-[72vw] min-w-[240px] max-w-[290px] shrink-0 snap-start sm:w-[44vw] sm:max-w-[310px] md:w-[30vw] md:max-w-[300px] lg:w-[calc((100%_-_2.5rem)_/_3)] lg:min-w-0 lg:max-w-none xl:w-[calc((100%_-_3.75rem)_/_4)]"
          >
            <ProductCard
              product={product}
              imageSizes="(min-width: 1280px) 289px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 768px) 300px, (min-width: 640px) 310px, 290px"
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between lg:flex">
        <SliderButton
          label="نمایش محصولات قبلی"
          disabled={!canSlideRight}
          onClick={() => scrollToProduct("right")}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>

        <SliderButton
          label="نمایش محصولات بعدی"
          disabled={!canSlideLeft}
          onClick={() => scrollToProduct("left")}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>
    </div>
  );
}

function SliderButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/15 bg-[#111411]/95 text-white shadow-xl backdrop-blur-md transition hover:border-action-primary/60 hover:bg-action-primary hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:pointer-events-none disabled:opacity-0"
    >
      {children}
    </button>
  );
}
