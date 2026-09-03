import type { CatalogCategory } from "@/features/catalog/types";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getCategoryImageUrl } from "@/features/catalog/utils/images";

interface CategoriesSectionProps {
  categories: CatalogCategory[];
  selectedCategory: string | null;
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  onSelectCategory: (category: string | null) => void;
  onRetryCategories: () => void;
}

export function CategoriesSection({
  categories,
  selectedCategory,
  isCategoriesLoading,
  categoriesError,
  onSelectCategory,
  onRetryCategories,
}: CategoriesSectionProps) {
  const shouldShowOnMobile =
    isCategoriesLoading || Boolean(categoriesError) || categories.length >= 2;

  return (
    <section
      className={`${
        shouldShowOnMobile ? "block" : "hidden lg:block"
      } max-w-[1600px] px-5 py-6 lg:mx-auto lg:px-8 lg:py-20`}
      aria-labelledby="home-categories-title"
    >
      <div className="mb-5 flex items-center justify-between lg:mb-8 lg:justify-start lg:gap-2">
        <h2 id="home-categories-title" className="text-desktop-heading-h2">
          دسته‌بندی
        </h2>

        {selectedCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-[11px] font-medium text-[#c5a33d] lg:hidden"
          >
            نمایش همه
          </button>
        ) : null}
      </div>

      {isCategoriesLoading ? (
        <CatalogFeedback
          kind="loading"
          message="در حال دریافت دسته‌بندی‌ها..."
          compact
        />
      ) : categoriesError ? (
        <CatalogFeedback
          kind="error"
          message={categoriesError}
          onRetry={onRetryCategories}
          compact
        />
      ) : categories.length === 0 ? (
        <CatalogFeedback
          kind="empty"
          message="در حال حاضر دسته‌بندی فعالی وجود ندارد."
          compact
        />
      ) : (
        <div className="flex items-center justify-center gap-x-20">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug;

            return (
              <button
                type="button"
                key={category.id}
                onClick={() =>
                  onSelectCategory(isSelected ? null : category.slug)
                }
                aria-pressed={isSelected}
                className="group flex min-w-0 flex-col items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
              >
                <span
                  className={`relative aspect-square w-full max-w-[138px] overflow-hidden rounded-full border bg-[#151715] transition duration-300 motion-reduce:transform-none lg:size-44 lg:max-w-none lg:p-1 ${
                    isSelected
                      ? "scale-[1.03] border-[#e1bd4d] shadow-[0_0_0_3px_rgba(199,162,60,0.13)] lg:scale-[1.04] lg:border-2 lg:border-[#d4af37] lg:shadow-[0_0_32px_rgba(212,175,55,0.28)]"
                      : "border-[#9a7d2d] group-active:scale-[0.98] lg:border-[#d4af37]/50 lg:group-hover:scale-[1.04] lg:group-hover:border-[#d4af37]"
                  }`}
                >
                  <span className="relative block size-full overflow-hidden rounded-full">
                    <CatalogImage
                      src={getCategoryImageUrl(category.image)}
                      alt={category.name}
                      sizes="(min-width: 1024px) 176px, (max-width: 367px) calc(50vw - 46px), 138px"
                      quality={75}
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  </span>
                </span>

                <span className="mt-3 text-sm font-bold lg:mt-4 lg:text-base">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
