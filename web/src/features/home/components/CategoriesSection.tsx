import type { CatalogCategory } from "@/features/catalog/types";
import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";

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
    <section className="my-8">
      <div className="mb-5 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <span>دسته‌بندی</span>
        </h3>
        {selectedCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-xs text-amber-400 hover:underline"
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug;

            return (
              <button
                type="button"
                key={category.id}
                onClick={() =>
                  onSelectCategory(isSelected ? null : category.slug)
                }
                className="group flex flex-col items-center transition-all focus:outline-none"
              >
                <div
                  className={`relative h-28 w-28 rounded-full p-1 transition-all duration-300 sm:h-32 sm:w-32 ${
                    isSelected
                      ? "scale-105 border-2 border-amber-400 shadow-[0_0_20px_rgba(229,193,88,0.4)]"
                      : "border border-amber-500/40 hover:scale-105 hover:border-amber-400/80"
                  }`}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#181920]">
                    <CatalogImage
                      src={category.image}
                      alt={category.name}
                      sizes="(max-width: 640px) 112px, 128px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  </div>
                </div>

                <span
                  className={`mt-3 text-sm font-semibold transition-colors sm:text-base ${
                    isSelected
                      ? "text-amber-300"
                      : "text-zinc-200 group-hover:text-amber-200"
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
