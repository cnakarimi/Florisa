"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";

import type { CatalogProduct } from "@/features/catalog/types";

import {
  ProductsSlider,
  type ProductsSliderHandle,
  type ProductsSliderNavigationState,
} from "./ProductsSlider";

interface ProductsSectionProps {
  id: string;
  title: string;
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

const INITIAL_NAVIGATION_STATE: ProductsSliderNavigationState = {
  canShowPrevious: false,
  canShowNext: false,
};

export function ProductsSection({
  id,
  title,
  products,
  isLoading,
  error,
  onRetry,
  onAddToCart,
  onSelectProduct,
}: ProductsSectionProps) {
  const sliderRef = useRef<ProductsSliderHandle>(null);

  const [navigation, setNavigation] = useState<ProductsSliderNavigationState>(
    INITIAL_NAVIGATION_STATE,
  );

  const handleNavigationStateChange = useCallback(
    (nextState: ProductsSliderNavigationState) => {
      setNavigation((currentState) => {
        if (
          currentState.canShowPrevious === nextState.canShowPrevious &&
          currentState.canShowNext === nextState.canShowNext
        ) {
          return currentState;
        }

        return nextState;
      });
    },
    [],
  );

  const shouldShowNavigation =
    !isLoading && !error && products.length > 1;

  const titleId = `${id}-title`;
  const sliderId = `${id}-slider`;

  return (
    <section
      className="mx-auto w-full max-w-[1600px] pb-8 pt-7 sm:pt-9 lg:px-8 lg:pb-16 lg:pt-8"
      aria-labelledby={titleId}
    >
      <div className="mb-5 flex items-center justify-between sm:mb-6 lg:mb-8">
        <h2
          id={titleId}
          className="text-mobile-heading-lg text-text-primary lg:text-desktop-heading-h2"
        >
          {title}
        </h2>

        {shouldShowNavigation ? (
          <div
            dir="ltr"
            className="hidden items-center gap-3 lg:flex"
            aria-label="کنترل اسلایدر محصولات"
          >
            <SliderControlButton
              label="نمایش محصولات بعدی"
              controls={sliderId}
              disabled={!navigation.canShowNext}
              onClick={() => sliderRef.current?.showNext()}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </SliderControlButton>
            <SliderControlButton
              label="نمایش محصولات قبلی"
              controls={sliderId}
              disabled={!navigation.canShowPrevious}
              onClick={() => sliderRef.current?.showPrevious()}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </SliderControlButton>
          </div>
        ) : null}
      </div>

      <ProductsSlider
        ref={sliderRef}
        id={sliderId}
        products={products}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onAddToCart={onAddToCart}
        onSelectProduct={onSelectProduct}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </section>
  );
}

function SliderControlButton({
  label,
  controls,
  disabled,
  onClick,
  children,
}: {
  label: string;
  controls: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className="
        grid
        size-11
        place-items-center
        rounded-full
        border
        border-text-secondary/50
        bg-transparent
        text-text-secondary

        transition-[border-color,color,background-color,opacity]
        duration-200

        hover:border-action-primary
        hover:bg-action-primary
        hover:text-background-primary

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-action-primary
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background-primary

        disabled:pointer-events-none
        disabled:opacity-30
      "
    >
      {children}
    </button>
  );
}
