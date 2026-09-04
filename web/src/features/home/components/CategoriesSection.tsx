import Link from "next/link";

import type { CatalogCategory } from "@/features/catalog/types";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getCategoryImageUrl } from "@/features/catalog/utils/images";

interface CategoriesSectionProps {
  categories: CatalogCategory[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  onRetryCategories: () => void;
}

const MOBILE_CATEGORY_SIZE = 120;
const TABLET_CATEGORY_SIZE = 132;
const DESKTOP_CATEGORY_SIZE = 176;

export function CategoriesSection({
  categories,
  isCategoriesLoading,
  categoriesError,
  onRetryCategories,
}: CategoriesSectionProps) {
  const shouldShowOnMobile =
    isCategoriesLoading || Boolean(categoriesError) || categories.length >= 2;

  const hasManyCategories = categories.length > 2;

  return (
    <section
      className={`${
        shouldShowOnMobile ? "block" : "hidden lg:block"
      } mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-6 lg:px-8 lg:py-12 xl:py-14`}
      aria-labelledby="home-categories-title"
    >
      <div className="mb-6 flex items-center justify-between lg:mb-8">
        <h2
          id="home-categories-title"
          className="text-mobile-heading-lg lg:text-desktop-heading-h2"
        >
          دسته‌بندی
        </h2>
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
        <div
          className={
            hasManyCategories
              ? "-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0"
              : ""
          }
        >
          <div
            className={
              hasManyCategories
                ? "flex w-max snap-x snap-mandatory items-start gap-6 sm:gap-8 lg:w-full lg:flex-wrap lg:justify-center lg:gap-x-12 lg:gap-y-10"
                : "flex items-start justify-center gap-10 sm:gap-14 lg:gap-16"
            }
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={{
                  pathname: "/shop",
                  query: {
                    category: category.slug,
                  },
                }}
                className={`group flex flex-none flex-col items-center rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background-primary ${
                  hasManyCategories ? "snap-start" : ""
                }`}
                aria-label={`مشاهده محصولات دسته ${category.name}`}
              >
                <span className="relative size-[120px] overflow-hidden rounded-full border border-action-primary/40 bg-surface-muted transition-[border-color,transform] duration-300 ease-out group-active:scale-[0.98] motion-reduce:transition-none sm:size-[132px] lg:size-44 lg:group-hover:border-action-primary/80">
                  <span className="relative block size-full overflow-hidden rounded-full">
                    <CatalogImage
                      src={getCategoryImageUrl(category.image)}
                      alt={category.name}
                      sizes={`(min-width: 1024px) ${DESKTOP_CATEGORY_SIZE}px, (min-width: 640px) ${TABLET_CATEGORY_SIZE}px, ${MOBILE_CATEGORY_SIZE}px`}
                      quality={80}
                      className="object-cover transition-transform duration-500 ease-out motion-reduce:transform-none lg:group-hover:scale-[1.03]"
                    />
                  </span>
                </span>

                <span className="mt-3 max-w-[120px] text-sm font-bold leading-6 text-text-primary transition-colors duration-200 group-hover:text-action-primary sm:max-w-[132px] lg:mt-4 lg:max-w-44 lg:text-base">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
