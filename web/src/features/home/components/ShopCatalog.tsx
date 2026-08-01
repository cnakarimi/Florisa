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
      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#181a24] p-4 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجوی نام، نوع یا رنگ گل..."
            className="w-full rounded-xl border border-white/10 bg-[#101117] py-2.5 pl-4 pr-9 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        </div>

        <div className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-1 sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === null
                ? "bg-amber-500 text-black shadow-md"
                : "border border-white/10 bg-[#101117] text-zinc-400 hover:text-white"
            }`}
          >
            همه
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === category.slug
                  ? "bg-amber-500 text-black shadow-md"
                  : "border border-white/10 bg-[#101117] text-zinc-400 hover:text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

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
