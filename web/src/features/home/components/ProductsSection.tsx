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
  latestProducts: CatalogProduct[];
  isProductsLoading: boolean;
  productsError: string | null;
  onRetryProducts: () => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

const INITIAL_NAVIGATION_STATE: ProductsSliderNavigationState = {
  canShowPrevious: false,
  canShowNext: false,
};

export function ProductsSection({
  latestProducts,
  isProductsLoading,
  productsError,
  onRetryProducts,
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
    !isProductsLoading && !productsError && latestProducts.length > 1;

  return (
    <section
      className="mx-auto w-full max-w-[1600px] pb-8 pt-7 sm:pt-9 lg:px-8 lg:pb-16 lg:pt-8"
      aria-labelledby="home-products-title"
    >
      <div className="mb-5 flex items-center justify-between sm:mb-6 lg:mb-8">
        <h2
          id="home-products-title"
          className="text-mobile-heading-lg text-text-primary lg:text-desktop-heading-h2"
        >
          <span className="lg:hidden">جدیدترین محصولات</span>
          <span className="hidden lg:inline">محصولات منتخب</span>
        </h2>

        {shouldShowNavigation ? (
          <div
            dir="ltr"
            className="hidden items-center gap-3 lg:flex"
            aria-label="کنترل اسلایدر محصولات"
          >
            <SliderControlButton
              label="نمایش محصولات بعدی"
              disabled={!navigation.canShowNext}
              onClick={() => sliderRef.current?.showNext()}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </SliderControlButton>
            <SliderControlButton
              label="نمایش محصولات قبلی"
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
        latestProducts={latestProducts}
        isProductsLoading={isProductsLoading}
        productsError={productsError}
        onRetryProducts={onRetryProducts}
        onAddToCart={onAddToCart}
        onSelectProduct={onSelectProduct}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </section>
  );
}

function SliderControlButton({
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
      aria-controls="home-products-slider"
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
