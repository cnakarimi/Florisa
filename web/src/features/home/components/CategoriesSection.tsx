import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type { CatalogCategory } from "@/features/catalog/types";
import { getCategoryImageUrl } from "@/features/catalog/utils/images";

interface CategoriesSectionProps {
  categories: CatalogCategory[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function CategoriesSection({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading,
  error,
  onRetry,
}: CategoriesSectionProps) {
  return (
    <section className="px-5 py-6" aria-labelledby="categories-title">
      <div className="mb-5 flex items-center justify-between">
        <h2
          id="categories-title"
          className="text-lg font-extrabold text-[#dedbd5]"
        >
          دسته بندی
        </h2>

        {selectedCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-[11px] font-medium text-[#c5a33d]"
          >
            نمایش همه
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <CatalogFeedback
          kind="loading"
          message="در حال دریافت دسته‌بندی‌ها..."
          compact
        />
      ) : error ? (
        <CatalogFeedback
          kind="error"
          message={error}
          onRetry={onRetry}
          compact
        />
      ) : categories.length === 0 ? (
        <CatalogFeedback
          kind="empty"
          message="در حال حاضر دسته‌بندی فعالی وجود ندارد."
          compact
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-7">
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
                className="group flex min-w-0 flex-col items-center focus-visible:outline-none"
              >
                <span
                  className={`relative aspect-square w-full max-w-[138px] overflow-hidden rounded-full border bg-[#151715] transition duration-300 ${
                    isSelected
                      ? "scale-[1.03] border-[#e1bd4d] shadow-[0_0_0_3px_rgba(199,162,60,0.13)]"
                      : "border-[#9a7d2d] group-active:scale-[0.98]"
                  }`}
                >
                  <CatalogImage
                    src={getCategoryImageUrl(category.image)}
                    alt={category.name}
                    sizes="(max-width: 367px) calc(50vw - 46px), 138px"
                    quality={70}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </span>

                <span
                  className={`mt-3 text-sm font-bold transition-colors ${
                    isSelected ? "text-[#e1bd4d]" : "text-[#ddd9d2]"
                  }`}
                >
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
