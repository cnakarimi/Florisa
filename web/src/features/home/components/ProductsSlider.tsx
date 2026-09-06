"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { CatalogProduct } from "@/features/catalog/types";

interface ProductsSliderProps {
  latestProducts: CatalogProduct[];
  isProductsLoading: boolean;
  productsError: string | null;
  onRetryProducts: () => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
  onNavigationStateChange?: (state: ProductsSliderNavigationState) => void;
}

export interface ProductsSliderHandle {
  showPrevious: () => void;
  showNext: () => void;
}

export interface ProductsSliderNavigationState {
  canShowPrevious: boolean;
  canShowNext: boolean;
}

const PRODUCT_SLIDE_SELECTOR = "[data-product-slide]";

export const ProductsSlider = forwardRef<
  ProductsSliderHandle,
  ProductsSliderProps
>(function ProductsSlider(
  {
    latestProducts,
    isProductsLoading,
    productsError,
    onRetryProducts,
    onAddToCart,
    onSelectProduct,
    onNavigationStateChange,
  },
  ref,
) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  const getSlides = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return [];
    }

    return Array.from(
      slider.querySelectorAll<HTMLElement>(PRODUCT_SLIDE_SELECTOR),
    );
  }, []);

  const updateSliderState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const slides = getSlides();

    if (slides.length === 0) {
      activeIndexRef.current = 0;

      onNavigationStateChange?.({
        canShowPrevious: false,
        canShowNext: false,
      });

      return;
    }

    const sliderRect = slider.getBoundingClientRect();

    const firstSlideRect = slides[0].getBoundingClientRect();
    const lastSlideRect = slides[slides.length - 1].getBoundingClientRect();

    const canShowPrevious = firstSlideRect.right > sliderRect.right + 2;

    const canShowNext = lastSlideRect.left < sliderRect.left - 2;

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

    onNavigationStateChange?.({
      canShowPrevious,
      canShowNext,
    });
  }, [getSlides, onNavigationStateChange]);

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

  const scrollToProduct = useCallback(
    (indexChange: -1 | 1) => {
      const slides = getSlides();

      if (slides.length === 0) {
        return;
      }

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
    },
    [getSlides],
  );

  useImperativeHandle(
    ref,
    () => ({
      showPrevious: () => scrollToProduct(-1),
      showNext: () => scrollToProduct(1),
    }),
    [scrollToProduct],
  );

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
    <div
      id="home-products-slider"
      ref={sliderRef}
      dir="rtl"
      role="region"
      tabIndex={0}
      onScroll={updateSliderState}
      aria-label="اسلایدر محصولات"
      className="
        -mx-4
        flex
        snap-x
        snap-mandatory
        gap-3
        overflow-x-auto
        px-4
        pb-3
        scroll-smooth
        overscroll-x-contain

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-action-primary/70

        sm:-mx-6
        sm:gap-4
        sm:px-6

        md:-mx-8
        md:px-8

        lg:mx-0
        lg:gap-5
        lg:px-0

        xl:gap-6

        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {latestProducts.map((product) => (
        <div
          key={product.id}
          data-product-slide
          className="
            w-[62vw]
            min-w-[210px]
            max-w-[235px]
            shrink-0
            snap-start

            sm:w-[42vw]
            sm:max-w-[270px]

            md:w-[31vw]
            md:max-w-[290px]

            lg:w-[calc((100%_-_3.75rem)_/_4)]
            lg:min-w-0
            lg:max-w-none

            xl:w-[calc((100%_-_6rem)_/_5)]
          "
        >
          <ProductCard
            product={product}
            imageSizes="
              (min-width: 1280px) calc((100vw - 224px) / 5),
              (min-width: 1024px) calc((100vw - 156px) / 4),
              (min-width: 768px) 290px,
              (min-width: 640px) 270px,
              235px
            "
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
          />
        </div>
      ))}
    </div>
  );
});

ProductsSlider.displayName = "ProductsSlider";
