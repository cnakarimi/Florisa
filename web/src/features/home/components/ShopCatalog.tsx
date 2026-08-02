import {
  ChevronDown,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

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

const orderingOptions: Array<{
  value: ProductOrdering;
  label: string;
}> = [
  {
    value: "newest",
    label: "جدیدترین",
  },
  {
    value: "price",
    label: "کمترین قیمت",
  },
  {
    value: "-price",
    label: "بیشترین قیمت",
  },
];

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
  const selectedCategoryData = categories.find(
    (category) => category.slug === selectedCategory,
  );

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory);

  const clearFilters = () => {
    setSearchQuery("");
    onSelectCategory(null);
  };

  return (
    <section
      className="pb-8 pt-5 sm:pb-10 sm:pt-7"
      aria-labelledby="shop-catalog-title"
    >
      {/* Heading */}
      <header className="mb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold text-[#c7a23c]">
              فروشگاه فلوریسا
            </p>

            <h1
              id="shop-catalog-title"
              className="text-xl font-black text-[#efede8] sm:text-2xl"
            >
              انتخاب گل و گیاه
            </h1>
          </div>

          {!isLoading && products.length > 0 ? (
            <span className="shrink-0 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium text-white/45">
              {products.length.toLocaleString("fa-IR")} محصول
            </span>
          ) : null}
        </div>

        <p className="mt-2 max-w-xl text-xs leading-6 text-white/40 sm:text-sm">
          میان گل‌ها و گیاهان فلوریسا جست‌وجو کن و مناسب‌ترین انتخاب را برای
          فضای خودت پیدا کن.
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#c7a23c]"
          aria-hidden="true"
        />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="جست‌وجوی گل، گیاه یا محصول..."
          aria-label="جست‌وجوی محصولات"
          className="h-12 w-full rounded-2xl border border-white/[0.08] bg-[#191b19] pr-11 pl-11 text-sm text-[#efede8] outline-none transition placeholder:text-white/30 hover:border-white/[0.12] focus:border-[#c7a23c]/50 focus:bg-[#1c1e1c] focus:ring-4 focus:ring-[#c7a23c]/[0.06]"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="پاک‌کردن جست‌وجو"
            className="absolute left-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Categories */}
      {categories.length > 0 ? (
        <div
          className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden"
          aria-label="دسته‌بندی محصولات"
        >
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            aria-pressed={selectedCategory === null}
            className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-bold transition ${
              selectedCategory === null
                ? "border-[#d4af37]/40 bg-[#d4af37] text-[#171811] shadow-[0_6px_18px_rgba(212,175,55,0.15)]"
                : "border-white/[0.08] bg-white/[0.035] text-white/50 hover:border-white/[0.15] hover:text-white/75"
            }`}
          >
            همه محصولات
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug;

            return (
              <button
                type="button"
                key={category.slug}
                onClick={() => onSelectCategory(category.slug)}
                aria-pressed={isSelected}
                className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-bold transition ${
                  isSelected
                    ? "border-[#d4af37]/40 bg-[#d4af37] text-[#171811] shadow-[0_6px_18px_rgba(212,175,55,0.15)]"
                    : "border-white/[0.08] bg-white/[0.035] text-white/50 hover:border-white/[0.15] hover:text-white/75"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Sorting and active filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.06] py-3">
        <div className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal
            className="h-4 w-4 shrink-0 text-[#c7a23c]"
            aria-hidden="true"
          />

          <span className="shrink-0 text-[11px] font-medium text-white/40">
            مرتب‌سازی
          </span>

          <div className="relative">
            <select
              value={ordering}
              onChange={(event) =>
                onOrderingChange(event.target.value as ProductOrdering)
              }
              aria-label="مرتب‌سازی محصولات"
              className="h-9 appearance-none rounded-xl border border-white/[0.08] bg-[#191b19] py-0 pr-3 pl-8 text-[11px] font-bold text-[#dedbd5] outline-none transition focus:border-[#c7a23c]/40"
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
          </div>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[10px] font-semibold text-white/40 transition hover:bg-white/[0.05] hover:text-[#d4af37]"
          >
            <X className="h-3.5 w-3.5" />
            حذف فیلترها
          </button>
        ) : null}
      </div>

      {/* Active-filter description */}
      {selectedCategoryData || searchQuery.trim() ? (
        <div className="mb-4 flex flex-wrap items-center gap-1 text-[11px] text-white/35">
          <span>نتایج</span>

          {searchQuery.trim() ? (
            <strong className="font-semibold text-[#d4af37]">
              «{searchQuery.trim()}»
            </strong>
          ) : null}

          {searchQuery.trim() && selectedCategoryData ? <span>در</span> : null}

          {selectedCategoryData ? (
            <strong className="font-semibold text-white/65">
              {selectedCategoryData.name}
            </strong>
          ) : null}
        </div>
      ) : null}

      {/* Results */}
      {isLoading ? (
        <CatalogFeedback kind="loading" />
      ) : error && products.length === 0 ? (
        <CatalogFeedback kind="error" message={error} onRetry={onRetry} />
      ) : products.length === 0 ? (
        <div className="space-y-4">
          <CatalogFeedback
            kind="empty"
            message="محصولی مطابق جست‌وجو یا دسته‌بندی انتخاب‌شده پیدا نشد."
          />

          {hasActiveFilters ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/[0.08] px-5 py-2.5 text-xs font-bold text-[#d4af37] transition hover:bg-[#d4af37]/[0.13]"
              >
                مشاهده همه محصولات
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            <div className="mt-5">
              <CatalogFeedback
                kind="error"
                message={error}
                onRetry={onRetry}
                compact
              />
            </div>
          ) : null}

          {hasNextPage ? (
            <div className="mt-7 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="inline-flex h-12 min-w-52 items-center justify-center gap-2 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/[0.08] px-7 text-xs font-bold text-[#d4af37] transition hover:border-[#d4af37]/40 hover:bg-[#d4af37]/[0.13] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    در حال دریافت...
                  </>
                ) : (
                  "نمایش محصولات بیشتر"
                )}
              </button>

              <span className="text-[10px] text-white/25">
                محصولات بیشتری برای نمایش وجود دارد
              </span>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
