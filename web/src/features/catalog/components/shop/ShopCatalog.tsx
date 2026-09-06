"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { ShopFiltersDialog } from "@/features/catalog/components/shop/ShopFiltersDialog";
import type {
  CatalogCategory,
  CatalogProduct,
  ProductOrdering,
  ProductQuery,
} from "@/features/catalog/types";
import { ShopResults } from "@/features/catalog/components/shop/ShopResults";

interface ShopCatalogProps {
  products: CatalogProduct[];
  totalProducts: number;
  categories: CatalogCategory[];
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  ordering: ProductOrdering;
  onOrderingChange: (ordering: ProductOrdering) => void;
  filters: ProductQuery;
  onFiltersChange: (filters: ProductQuery) => void;
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
  totalProducts,
  categories,
  onAddToCart,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  onSelectCategory,
  ordering,
  onOrderingChange,
  filters,
  onFiltersChange,
  isLoading,
  error,
  onRetry,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}: ShopCatalogProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const selectedCategoryData = categories.find(
    (category) => category.slug === selectedCategory,
  );

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof ProductQuery] !== undefined,
  ).length;

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory || activeFilterCount,
  );

  const appliedFilterCount = activeFilterCount + (selectedCategory ? 1 : 0);

  const selectedOrderingLabel =
    orderingOptions.find((option) => option.value === ordering)?.label ??
    "جدیدترین";

  const clearFilters = () => {
    setSearchQuery("");
    onSelectCategory(null);
    onFiltersChange({});
  };

  const applyFilters = (category: string | null, nextFilters: ProductQuery) => {
    onSelectCategory(category);
    onFiltersChange(nextFilters);
    setIsFilterOpen(false);
  };

  return (
    <section
      className="relative pb-8 pt-5 sm:pb-10 sm:pt-7"
      aria-labelledby="shop-catalog-title"
    >
      {/* Search */}
      <div className="sticky top-0 z-40 -mx-4 mb-6 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] transition-all duration-300 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
            aria-hidden="true"
          />

          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جست‌وجوی گل و گیاه..."
            aria-label="جست‌وجوی محصولات فلوریسا"
            className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] pl-10 pr-10 text-xs text-[#f0eee9] outline-none transition placeholder:text-white/30 hover:border-white/[0.12] focus:border-[#c7a23c]/35 focus:bg-white/[0.05] sm:h-11"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="پاک‌کردن جست‌وجو"
              className="absolute left-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white active:scale-90"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <header className="mb-6 flex items-center justify-between px-1">
          <h1
            id="shop-catalog-title"
            className="text-2xl font-black tracking-tight text-[#efede8] sm:text-3xl"
          >
            انتخاب گل و گیاه
          </h1>

          <div className="flex items-center px-2 sm:px-4">
            {!isLoading ? (
              <span
                className="text-[13px] font-medium text-white/50"
                aria-live="polite"
              >
                <strong className="mx-1 text-base font-black text-[#efede8]">
                  {totalProducts.toLocaleString("fa-IR")}
                </strong>
                نتیجه
              </span>
            ) : (
              <span className="h-6 w-16 animate-pulse rounded-md bg-white/[0.06]" />
            )}
          </div>
        </header>

        {/* Filter and sorting controls */}
        <div className="mb-6 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2.5 sm:flex sm:items-center">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            disabled={categories.length === 0}
            aria-haspopup="dialog"
            aria-expanded={isFilterOpen}
            className={`group inline-flex h-12 min-w-0 items-center gap-2.5 rounded-[14px] border px-2.5 text-xs font-bold outline-none transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px] sm:px-3 ${
              appliedFilterCount > 0
                ? "border-[#d4af37]/35 bg-[#d4af37]/[0.09] text-[#e3c45d]"
                : "border-white/[0.07] bg-white/[0.025] text-white/65 hover:border-white/[0.13] hover:bg-white/[0.045] hover:text-white/85"
            }`}
          >
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-[10px] transition-colors ${
                appliedFilterCount > 0
                  ? "bg-[#d4af37]/15 text-[#d4af37]"
                  : "bg-white/[0.05] text-white/45 group-hover:text-white/70"
              }`}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
            </span>

            <span className="truncate">فیلترها</span>

            {appliedFilterCount > 0 ? (
              <span className="ms-auto grid size-5 shrink-0 place-items-center rounded-full bg-[#d4af37] text-[10px] font-black text-[#171811]">
                {appliedFilterCount.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </button>

          {/* Sort */}
          <div className="group relative h-12 min-w-0 rounded-[14px] border border-white/[0.07] bg-white/[0.025] outline-none transition-all hover:border-white/[0.13] hover:bg-white/[0.045] focus-within:border-[#d4af37]/40 focus-within:bg-[#d4af37]/[0.05] focus-within:ring-2 focus-within:ring-[#d4af37]/10 sm:w-[205px]">
            <div
              className="pointer-events-none flex h-full items-center gap-2.5 px-2.5 sm:px-3"
              aria-hidden="true"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-white/[0.05] text-[#c7a23c]">
                <ArrowUpDown className="size-4" />
              </span>

              <span className="min-w-0 flex-1 text-start">
                <span className="block text-[9px] font-medium leading-none text-white/30">
                  مرتب‌سازی
                </span>

                <span className="mt-1 block truncate text-[11px] font-bold leading-none text-[#e7e4de] sm:text-xs">
                  {selectedOrderingLabel}
                </span>
              </span>

              <ChevronDown className="size-3.5 shrink-0 text-white/30 transition-transform duration-200 group-focus-within:rotate-180" />
            </div>

            <select
              value={ordering}
              onChange={(event) =>
                onOrderingChange(event.target.value as ProductOrdering)
              }
              aria-label="مرتب‌سازی محصولات"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-[14px] opacity-0 outline-none"
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Context */}
        {selectedCategoryData || searchQuery.trim() ? (
          <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex flex-wrap items-center gap-2 px-1 text-xs text-white/40 duration-300">
            <span>نتایج</span>

            {searchQuery.trim() ? (
              <strong className="font-bold text-[#d4af37]">
                «{searchQuery.trim()}»
              </strong>
            ) : null}

            {searchQuery.trim() && selectedCategoryData ? (
              <span>در</span>
            ) : null}

            {selectedCategoryData ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/[0.05] px-2.5 py-1 text-[#e3c45d]">
                <strong className="font-semibold">
                  {selectedCategoryData.name}
                </strong>
              </div>
            ) : null}

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="ms-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-red-400/70 transition-all hover:bg-red-400/10 hover:text-red-400 active:scale-95"
              >
                <X className="size-3.5" />
                حذف همه
              </button>
            ) : null}
          </div>
        ) : null}

        <ShopResults
          products={products}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          onAddToCart={onAddToCart}
          onSelectProduct={onSelectProduct}
        />
      </div>

      <ShopFiltersDialog
        isOpen={isFilterOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        filters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyFilters}
      />
    </section>
  );
}
