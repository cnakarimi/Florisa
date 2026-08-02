"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  ArrowUpDown,
  Check,
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
  ProductQuery,
  ProductOrdering,
  ProductType,
} from "@/features/catalog/types";
import { clearIncompatibleFilters } from "@/features/catalog/types";

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
  const [draftCategory, setDraftCategory] = useState<string | null>(
    selectedCategory,
  );
  const [draftFilters, setDraftFilters] = useState<ProductQuery>(filters);
  const filterTitleId = useId();

  const selectedCategoryData = categories.find(
    (category) => category.slug === selectedCategory,
  );

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof ProductQuery] !== undefined,
  ).length;
  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedCategory || activeFilterCount,
  );

  const clearFilters = () => {
    setSearchQuery("");
    onSelectCategory(null);
    onFiltersChange({});
  };

  const openFilters = () => {
    setDraftCategory(selectedCategory);
    setDraftFilters(filters);
    setIsFilterOpen(true);
  };

  const applyCategoryFilter = () => {
    onSelectCategory(draftCategory);
    onFiltersChange(draftFilters);
    setIsFilterOpen(false);
  };

  const updateDraftFilter = <K extends keyof ProductQuery>(
    key: K,
    value: ProductQuery[K] | undefined,
  ) => {
    setDraftFilters((current) => {
      const next = { ...current };
      if (value === undefined || value === "") delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const selectProductType = (productType?: ProductType) => {
    setDraftFilters((current) =>
      clearIncompatibleFilters(current, productType),
    );
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isFilterOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOpen]);

  const appliedFilterCount = activeFilterCount + (selectedCategory ? 1 : 0);

  const selectedOrderingLabel =
    orderingOptions.find((option) => option.value === ordering)?.label ??
    "جدیدترین";

  return (
    <section
      className="relative pb-8 pt-5 sm:pb-10 sm:pt-7"
      aria-labelledby="shop-catalog-title"
    >
      {/* Search — Sticky header matching ScrollNavbar */}
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
        <header className="mb-6 px-1 flex items-center justify-between">
          <h1
            id="shop-catalog-title"
            className="text-2xl font-black tracking-tight text-[#efede8] sm:text-3xl"
          >
            انتخاب گل و گیاه
          </h1>
          {/* Info (Result Count) */}
          <div className="flex items-center px-2 sm:px-4">
            {!isLoading ? (
              <span
                className="text-[13px] font-medium text-white/50"
                aria-live="polite"
              >
                <strong className="mx-1 text-base font-black text-[#efede8]">
                  {products.length.toLocaleString("fa-IR")}
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
          {/* Filter */}
          <button
            type="button"
            onClick={openFilters}
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

        {/* Results Body */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <CatalogFeedback kind="loading" />
          ) : error && products.length === 0 ? (
            <CatalogFeedback kind="error" message={error} onRetry={onRetry} />
          ) : products.length === 0 ? (
            <div className="animate-in fade-in space-y-6 py-10 duration-500">
              <CatalogFeedback
                kind="empty"
                message="محصولی مطابق جست‌وجو یا دسته‌بندی انتخاب‌شده پیدا نشد."
              />

              {hasActiveFilters ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-12 items-center rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-6 text-sm font-bold text-[#d4af37] transition-all hover:bg-[#d4af37]/20 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] active:scale-95"
                  >
                    مشاهده همه محصولات
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:gap-6">
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
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        در حال دریافت...
                      </>
                    ) : (
                      "نمایش محصولات بیشتر"
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Dialog */}
      {isFilterOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={filterTitleId}
        >
          {/* Backdrop */}
          <button
            type="button"
            className="animate-in fade-in absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsFilterOpen(false)}
            aria-label="بستن فیلترها"
          />

          {/* Modal Container */}
          <div className="animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 relative z-10 w-full rounded-t-[32px] border border-white/[0.08] bg-[#171a17] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_80px_rgba(0,0,0,0.6)] duration-300 sm:max-w-md sm:rounded-[32px] sm:p-6 sm:pb-6">
            <div
              className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10 sm:hidden"
              aria-hidden="true"
            />

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#c7a23c]">
                  فیلتر محصولات
                </p>
                <h2
                  id={filterTitleId}
                  className="text-xl font-black text-[#efede8]"
                >
                  فیلتر و دسته‌بندی
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="grid size-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-90"
                aria-label="بستن"
              >
                <X className="size-5" />
              </button>
            </div>

            <div
              className="custom-scrollbar max-h-[50dvh] space-y-2.5 overflow-y-auto overscroll-contain px-1 pb-2"
              aria-label="دسته‌بندی محصولات"
            >
              <FilterGroup title="نوع محصول">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      [undefined, "همه"],
                      ["plant", "گیاه"],
                      ["cut_flower", "گل شاخه‌ای"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value ?? "all"}
                      type="button"
                      onClick={() => selectProductType(value)}
                      className={`min-h-11 rounded-xl border px-2 text-[11px] font-bold transition ${
                        draftFilters.product_type === value ||
                        (!value && !draftFilters.product_type)
                          ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e3c45d]"
                          : "border-white/[0.06] bg-white/[0.02] text-white/60"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="فیلترهای عمومی">
                <div className="grid grid-cols-2 gap-2">
                  <FilterInput
                    label="کمترین قیمت"
                    type="number"
                    value={draftFilters.min_price ?? ""}
                    onChange={(value) =>
                      updateDraftFilter(
                        "min_price",
                        value ? Number(value) : undefined,
                      )
                    }
                  />
                  <FilterInput
                    label="بیشترین قیمت"
                    type="number"
                    value={draftFilters.max_price ?? ""}
                    onChange={(value) =>
                      updateDraftFilter(
                        "max_price",
                        value ? Number(value) : undefined,
                      )
                    }
                  />
                </div>
                <FilterSelect
                  label="واحد فروش"
                  value={draftFilters.sale_unit ?? ""}
                  onChange={(value) =>
                    updateDraftFilter(
                      "sale_unit",
                      value === "item" ||
                        value === "pot" ||
                        value === "stem" ||
                        value === "bunch" ||
                        value === "bouquet"
                        ? value
                        : undefined,
                    )
                  }
                  options={[
                    ["", "همه واحدها"],
                    ["item", "عدد"],
                    ["pot", "گلدان"],
                    ["stem", "شاخه"],
                    ["bunch", "دسته"],
                    ["bouquet", "دسته‌گل"],
                  ]}
                />
                <FilterBoolean
                  label="فقط محصولات موجود"
                  value={draftFilters.in_stock}
                  onChange={(value) => updateDraftFilter("in_stock", value)}
                />
              </FilterGroup>

              {draftFilters.product_type === "plant" ? (
                <PlantFilterFields
                  filters={draftFilters}
                  update={updateDraftFilter}
                />
              ) : null}

              {draftFilters.product_type === "cut_flower" ? (
                <CutFlowerFilterFields
                  filters={draftFilters}
                  update={updateDraftFilter}
                />
              ) : null}

              <p className="pt-2 text-[11px] font-bold text-[#c7a23c]">
                دسته‌بندی
              </p>
              <button
                type="button"
                role="radio"
                aria-checked={draftCategory === null}
                onClick={() => setDraftCategory(null)}
                className={`group flex min-h-[56px] w-full items-center justify-between rounded-2xl border px-5 text-start text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 active:scale-[0.98] ${
                  draftCategory === null
                    ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e3c45d]"
                    : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                همه محصولات
                {draftCategory === null ? (
                  <span className="animate-in zoom-in grid size-6 place-items-center rounded-full bg-[#d4af37] text-[#171811] shadow-[0_0_10px_rgba(212,175,55,0.3)] duration-200">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                ) : null}
              </button>

              {categories.map((category) => {
                const isSelected = draftCategory === category.slug;

                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    key={category.slug}
                    onClick={() => setDraftCategory(category.slug)}
                    className={`group flex min-h-[56px] w-full items-center justify-between rounded-2xl border px-5 text-start text-sm font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 active:scale-[0.98] ${
                      isSelected
                        ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e3c45d]"
                        : "border-white/[0.06] bg-white/[0.02] text-white/70 hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {category.name}
                    {isSelected ? (
                      <span className="animate-in zoom-in grid size-6 place-items-center rounded-full bg-[#d4af37] text-[#171811] shadow-[0_0_10px_rgba(212,175,55,0.3)] duration-200">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
              <button
                type="button"
                onClick={applyCategoryFilter}
                className="h-14 rounded-2xl bg-[#d4af37] px-6 text-sm font-extrabold text-[#171811] transition-all hover:bg-[#e0bf50] hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] active:scale-[0.98]"
              >
                نمایش نتایج
              </button>

              <button
                type="button"
                onClick={() => {
                  setDraftCategory(null);
                  setDraftFilters({});
                }}
                className="h-14 rounded-2xl border border-white/[0.1] px-5 text-xs font-bold text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/90 active:scale-95"
              >
                پاک‌کردن
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

type UpdateFilter = <K extends keyof ProductQuery>(
  key: K,
  value: ProductQuery[K] | undefined,
) => void;

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-2.5 border-b border-white/[0.06] pb-4 pt-2">
      <legend className="mb-2 text-[11px] font-bold text-[#c7a23c]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
}) {
  return (
    <label className="block text-[10px] text-white/45">
      {label}
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none focus:border-[#d4af37]/40"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label className="block text-[10px] text-white/45">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#191b19] px-3 text-xs text-white outline-none focus:border-[#d4af37]/40"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "all"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBoolean({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}) {
  return (
    <FilterSelect
      label={label}
      value={value === undefined ? "" : String(value)}
      onChange={(next) => onChange(next === "" ? undefined : next === "true")}
      options={[
        ["", "همه"],
        ["true", "بله"],
        ["false", "خیر"],
      ]}
    />
  );
}

function PlantFilterFields({
  filters,
  update,
}: {
  filters: ProductQuery;
  update: UpdateFilter;
}) {
  return (
    <FilterGroup title="مشخصات گیاه">
      <FilterSelect
        label="اندازه گیاه"
        value={filters.plant_size ?? ""}
        onChange={(value) =>
          update(
            "plant_size",
            value === "small" || value === "medium" || value === "large"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["small", "کوچک"],
          ["medium", "متوسط"],
          ["large", "بزرگ"],
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <FilterInput
          label="کمترین ارتفاع"
          type="number"
          value={filters.min_height ?? ""}
          onChange={(value) =>
            update("min_height", value ? Number(value) : undefined)
          }
        />
        <FilterInput
          label="بیشترین ارتفاع"
          type="number"
          value={filters.max_height ?? ""}
          onChange={(value) =>
            update("max_height", value ? Number(value) : undefined)
          }
        />
      </div>
      <FilterSelect
        label="درجه کیفیت"
        value={filters.quality_grade ?? ""}
        onChange={(value) =>
          update(
            "quality_grade",
            value === "standard" || value === "premium" || value === "luxury"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["standard", "استاندارد"],
          ["premium", "ممتاز"],
          ["luxury", "لوکس"],
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <FilterBoolean
          label="سازگار با حیوانات"
          value={filters.pet_friendly}
          onChange={(value) => update("pet_friendly", value)}
        />
        <FilterBoolean
          label="گلدان همراه"
          value={filters.pot_included}
          onChange={(value) => update("pot_included", value)}
        />
        <FilterBoolean
          label="دارای زهکشی"
          value={filters.has_drainage}
          onChange={(value) => update("has_drainage", value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FilterInput
          label="جنس گلدان"
          value={filters.pot_material ?? ""}
          onChange={(value) => update("pot_material", value || undefined)}
        />
        <FilterInput
          label="رنگ گلدان"
          value={filters.pot_color ?? ""}
          onChange={(value) => update("pot_color", value || undefined)}
        />
      </div>
      <FilterSelect
        label="نور"
        value={filters.light_requirement ?? ""}
        onChange={(value) =>
          update(
            "light_requirement",
            value === "low" ||
              value === "indirect" ||
              value === "bright" ||
              value === "direct"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["low", "کم"],
          ["indirect", "غیرمستقیم"],
          ["bright", "زیاد"],
          ["direct", "مستقیم"],
        ]}
      />
      <FilterSelect
        label="آبیاری"
        value={filters.watering_requirement ?? ""}
        onChange={(value) =>
          update(
            "watering_requirement",
            value === "low" || value === "medium" || value === "high"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["low", "کم"],
          ["medium", "متوسط"],
          ["high", "زیاد"],
        ]}
      />
      <FilterSelect
        label="سختی نگهداری"
        value={filters.care_difficulty ?? ""}
        onChange={(value) =>
          update(
            "care_difficulty",
            value === "easy" || value === "medium" || value === "hard"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["easy", "آسان"],
          ["medium", "متوسط"],
          ["hard", "حساس"],
        ]}
      />
    </FilterGroup>
  );
}

function CutFlowerFilterFields({
  filters,
  update,
}: {
  filters: ProductQuery;
  update: UpdateFilter;
}) {
  return (
    <FilterGroup title="مشخصات گل شاخه‌ای">
      <div className="grid grid-cols-2 gap-2">
        <FilterInput
          label="نوع گل"
          value={filters.flower_type ?? ""}
          onChange={(value) => update("flower_type", value || undefined)}
        />
        <FilterInput
          label="رقم"
          value={filters.variety ?? ""}
          onChange={(value) => update("variety", value || undefined)}
        />
        <FilterInput
          label="رنگ"
          value={filters.color ?? ""}
          onChange={(value) => update("color", value || undefined)}
        />
        <FilterInput
          label="کمترین ماندگاری"
          type="number"
          value={filters.min_vase_life ?? ""}
          onChange={(value) =>
            update("min_vase_life", value ? Number(value) : undefined)
          }
        />
        <FilterInput
          label="کمترین طول ساقه"
          type="number"
          value={filters.min_stem_length ?? ""}
          onChange={(value) =>
            update("min_stem_length", value ? Number(value) : undefined)
          }
        />
        <FilterInput
          label="بیشترین طول ساقه"
          type="number"
          value={filters.max_stem_length ?? ""}
          onChange={(value) =>
            update("max_stem_length", value ? Number(value) : undefined)
          }
        />
      </div>
      <FilterSelect
        label="درجه گل"
        value={filters.flower_grade ?? ""}
        onChange={(value) =>
          update(
            "flower_grade",
            value === "standard" || value === "premium" || value === "luxury"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["standard", "استاندارد"],
          ["premium", "ممتاز"],
          ["luxury", "لوکس"],
        ]}
      />
      <FilterSelect
        label="میزان رایحه"
        value={filters.fragrance_level ?? ""}
        onChange={(value) =>
          update(
            "fragrance_level",
            value === "none" ||
              value === "light" ||
              value === "medium" ||
              value === "strong"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["none", "بدون رایحه"],
          ["light", "ملایم"],
          ["medium", "متوسط"],
          ["strong", "قوی"],
        ]}
      />
      <FilterSelect
        label="فصل عرضه"
        value={filters.seasonal_availability ?? ""}
        onChange={(value) =>
          update(
            "seasonal_availability",
            value === "year_round" ||
              value === "spring" ||
              value === "summer" ||
              value === "autumn" ||
              value === "winter"
              ? value
              : undefined,
          )
        }
        options={[
          ["", "همه"],
          ["year_round", "چهارفصل"],
          ["spring", "بهار"],
          ["summer", "تابستان"],
          ["autumn", "پاییز"],
          ["winter", "زمستان"],
        ]}
      />
    </FilterGroup>
  );
}
