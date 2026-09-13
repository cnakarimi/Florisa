import { StarIcon } from "@/components/icons";

import type { CatalogProductReview } from "@/features/catalog/types";

import { toPersianDigits } from "@/utils/persian";

interface ProductReviewsProps {
  reviews: CatalogProductReview[];
  reviewCount: number;
  ratingAverage: number | null;
  isLoading?: boolean;
  error?: string | null;
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const difference = now - date.getTime();

  const minutes = Math.max(1, Math.floor(difference / 60_000));

  if (minutes < 60) {
    return `${toPersianDigits(minutes)} دقیقه پیش`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${toPersianDigits(hours)} ساعت پیش`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${toPersianDigits(days)} روز پیش`;
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getReviewerInitial(name: string): string {
  const trimmed = name.trim();

  return trimmed ? trimmed.charAt(0) : "ک";
}

export function ProductReviews({
  reviews,
  reviewCount,
  ratingAverage,
  isLoading = false,
  error = null,
}: ProductReviewsProps) {
  return (
    <section
      className="px-4 py-4 sm:px-6 md:px-8"
      aria-labelledby="product-reviews-title"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="product-reviews-title"
          className="text-base font-bold leading-6 text-text-primary"
        >
          نظرات کاربران
        </h2>

        {ratingAverage !== null && reviewCount > 0 ? (
          <div className="flex shrink-0 items-center gap-1">
            <StarIcon size={12} className="text-[#F6AB27]" />

            <span className="text-xs font-medium text-text-primary">
              {toPersianDigits(ratingAverage.toFixed(1))}
            </span>

            <span className="text-[11px] text-text-secondary">
              ({toPersianDigits(reviewCount)} نظر)
            </span>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-3 flex flex-col gap-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-[108px] animate-pulse rounded-xl bg-background-secondary"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="mt-3 text-xs leading-6 text-text-secondary">
          دریافت نظرات با مشکل روبه‌رو شد.
        </p>
      ) : null}

      {!isLoading && !error && reviews.length === 0 ? (
        <p className="mt-3 text-xs leading-6 text-text-secondary">
          هنوز نظری برای این محصول ثبت نشده است.
        </p>
      ) : null}

      {!isLoading && !error && reviews.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl bg-background-secondary p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-text-primary"
                    aria-hidden="true"
                  >
                    {getReviewerInitial(review.reviewer_name)}
                  </div>

                  <p className="truncate text-xs font-medium leading-5 text-text-primary">
                    {review.reviewer_name}
                  </p>
                </div>

                <time
                  dateTime={review.created_at}
                  className="shrink-0 text-[10px] leading-4 text-text-secondary"
                >
                  {formatRelativeDate(review.created_at)}
                </time>
              </div>

              <p className="mt-3 text-xs font-normal leading-6 text-text-secondary">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
