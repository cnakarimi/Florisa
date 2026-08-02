import { Search, SlidersHorizontal } from "lucide-react";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import type {
  CatalogCategory,
  CatalogProduct,
  ProductOrdering,
} from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";

interface ShopCatalogProps {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  favorites: CatalogProduct[];
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  ordering: ProductOrdering;
  onOrderingChange: (ordering: ProductOrdering) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export function ShopCatalog({
  products,
  categories,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  onSelectCategory,
  ordering,
  onOrderingChange,
  isLoading,
  error,
  onRetry,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}: ShopCatalogProps) {
  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-zinc-400">
        <span className="flex items-center gap-1 font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
          مرتب‌سازی:
        </span>
        {[
          ["newest", "جدیدترین"],
          ["price", "کمترین قیمت"],
          ["-price", "بیشترین قیمت"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => onOrderingChange(value as ProductOrdering)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] ${
              ordering === value
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 text-zinc-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <CatalogFeedback kind="loading" />
      ) : error && products.length === 0 ? (
        <CatalogFeedback kind="error" message={error} onRetry={onRetry} />
      ) : products.length === 0 ? (
        <CatalogFeedback
          kind="empty"
          message="محصولی مطابق جستجو یا دسته‌بندی انتخاب‌شده پیدا نشد."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.some(
                  (favorite) => favorite.id === product.id,
                )}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>

          {error ? (
            <CatalogFeedback
              kind="error"
              message={error}
              onRetry={onRetry}
              compact
            />
          ) : null}

          {hasNextPage ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="rounded-xl border border-white/10 bg-[#222430] px-6 py-2.5 text-xs font-semibold text-white hover:border-emerald-500/50 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoadingMore ? "در حال دریافت..." : "نمایش محصولات بیشتر"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
