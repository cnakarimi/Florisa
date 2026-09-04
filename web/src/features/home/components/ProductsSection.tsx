import type { CatalogProduct } from "@/features/catalog/types";

import { ProductsSlider } from "./ProductsSlider";

interface ProductsSectionProps {
  latestProducts: CatalogProduct[];
  isProductsLoading: boolean;
  productsError: string | null;

  onRetryProducts: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
  onShopClick: () => void;
}

export function ProductsSection({
  latestProducts,
  isProductsLoading,
  productsError,
  onRetryProducts,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onShopClick,
}: ProductsSectionProps) {
  return (
    <section
      className="mx-auto max-w-[1600px] pb-2 pt-6 sm:pt-8 lg:px-8 lg:pb-20 lg:pt-0"
      aria-labelledby="home-products-title"
    >
      <div className="mb-4 flex items-center justify-between sm:mb-6 lg:mb-7">
        <h2
          id="home-products-title"
          className="text-desktop-heading-h2 text-[#dedbd5] lg:text-white"
        >
          جدیدترین محصولات
        </h2>

        <button
          type="button"
          onClick={onShopClick}
          className="text-sm font-medium text-action-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/70"
        >
          مشاهده همه
        </button>
      </div>

      <ProductsSlider
        latestProducts={latestProducts}
        isProductsLoading={isProductsLoading}
        productsError={productsError}
        onRetryProducts={onRetryProducts}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        onSelectProduct={onSelectProduct}
      />
    </section>
  );
}
