"use client";

import { useEffect, useId, useState } from "react";
import { Check, X } from "lucide-react";

import {
  FilterBoolean,
  FilterGroup,
  FilterInput,
  FilterSelect,
  type UpdateFilter,
} from "@/features/catalog/components/shop/filters/FilterControls";
import {
  CutFlowerFilterFields,
  PlantFilterFields,
} from "@/features/catalog/components/shop/filters/ProductFilterFields";
import type {
  CatalogCategory,
  ProductQuery,
  ProductType,
} from "@/features/catalog/types";
import { clearIncompatibleFilters } from "@/features/catalog/utils/filters";

interface ShopFiltersDialogProps {
  isOpen: boolean;
  categories: CatalogCategory[];
  selectedCategory: string | null;
  filters: ProductQuery;
  onClose: () => void;
  onApply: (category: string | null, filters: ProductQuery) => void;
}

export function ShopFiltersDialog({
  isOpen,
  categories,
  selectedCategory,
  filters,
  onClose,
  onApply,
}: ShopFiltersDialogProps) {
  const [draftCategory, setDraftCategory] = useState<string | null>(
    selectedCategory,
  );
  const [draftFilters, setDraftFilters] = useState<ProductQuery>(filters);

  const filterTitleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftCategory(selectedCategory);
    setDraftFilters(filters);
  }, [isOpen, selectedCategory, filters]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const updateDraftFilter: UpdateFilter = (key, value) => {
    setDraftFilters((current) => {
      const next = { ...current };

      if (value === undefined || value === "") {
        delete next[key];
      } else {
        next[key] = value;
      }

      return next;
    });
  };

  const selectProductType = (productType?: ProductType) => {
    setDraftFilters((current) =>
      clearIncompatibleFilters(current, productType),
    );
  };

  const handleApply = () => {
    onApply(draftCategory, draftFilters);
  };

  const handleClear = () => {
    setDraftCategory(null);
    setDraftFilters({});
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={filterTitleId}
    >
      <button
        type="button"
        className="animate-in fade-in absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-label="بستن فیلترها"
      />

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
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-90"
            aria-label="بستن"
          >
            <X className="size-5" />
          </button>
        </div>

        <div
          className="custom-scrollbar max-h-[50dvh] space-y-2.5 overflow-y-auto overscroll-contain px-1 pb-2"
          aria-label="فیلترهای محصولات"
        >
          <FilterGroup title="نوع محصول">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  [undefined, "همه"],
                  ["plant", "گیاه"],
                  ["cut_flower", "گل شاخه‌ای"],
                ] as const
              ).map(([value, label]) => {
                const isSelected =
                  draftFilters.product_type === value ||
                  (!value && !draftFilters.product_type);

                return (
                  <button
                    key={value ?? "all"}
                    type="button"
                    onClick={() => selectProductType(value)}
                    className={`min-h-11 rounded-xl border px-2 text-[11px] font-bold transition ${
                      isSelected
                        ? "border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e3c45d]"
                        : "border-white/[0.06] bg-white/[0.02] text-white/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
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

          <p className="pt-2 text-[11px] font-bold text-[#c7a23c]">دسته‌بندی</p>

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
                <Check
                  className="size-3.5"
                  strokeWidth={3}
                  aria-hidden="true"
                />
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
                    <Check
                      className="size-3.5"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
          <button
            type="button"
            onClick={handleApply}
            className="h-14 rounded-2xl bg-[#d4af37] px-6 text-sm font-extrabold text-[#171811] transition-all hover:bg-[#e0bf50] hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] active:scale-[0.98]"
          >
            نمایش نتایج
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl border border-white/[0.1] px-5 text-xs font-bold text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/90 active:scale-95"
          >
            پاک‌کردن
          </button>
        </div>
      </div>
    </div>
  );
}
