"use client";

import { LoaderCircle } from "lucide-react";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import type { CatalogProduct } from "@/features/catalog/types";

interface ShopResultsProps {
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

export function ShopResults({
  products,
  isLoading,
  error,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}: ShopResultsProps) {
  if (isLoading) {
    return (
      <div className="min-h-[400px]">
        <CatalogFeedback kind="loading" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-[400px]">
        <CatalogFeedback kind="error" message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[400px]">
        <div className="animate-in fade-in space-y-6 py-10 duration-500">
          <CatalogFeedback
            kind="empty"
            message="محصولی مطابق جست‌وجو یا دسته‌بندی انتخاب‌شده پیدا نشد."
          />

          {hasActiveFilters ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-12 items-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-6 text-sm font-bold text-[#d4af37] transition-all hover:bg-[#d4af37]/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] active:scale-95"
              >
                مشاهده همه محصولات
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px]">
      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageSizes="(max-width: 639px) calc(100vw - 44px), (max-width: 767px) calc(100vw - 60px), (max-width: 1023px) calc(100vw - 76px), 458px"
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        {error ? (
          <div className="mt-6">
            <CatalogFeedback
              kind="error"
              message={error}
              onRetry={onRetry}
              compact
            />
          </div>
        ) : null}

        {hasNextPage ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="group relative inline-flex h-12 min-w-[220px] items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/[0.08] px-8 text-sm font-bold text-[#d4af37] transition-all hover:border-[#d4af37]/50 hover:bg-[#d4af37]/[0.15] active:scale-[0.97] disabled:cursor-wait disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />
                  در حال دریافت...
                </>
              ) : (
                "نمایش محصولات بیشتر"
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
