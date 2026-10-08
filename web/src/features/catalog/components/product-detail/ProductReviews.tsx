import { StarIcon } from "@/components/icons";
import { useId } from "react";

import type { CatalogProductReview } from "@/features/catalog/types";

import { toPersianDigits } from "@/utils/persian";

interface ProductReviewsProps {
  reviews: CatalogProductReview[];
  reviewCount: number;
  ratingAverage: number | null;
  isLoading?: boolean;
  error?: string | null;
  mobilePlant?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  moreError?: string | null;
  onLoadMore?: () => void;
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
  mobilePlant = false,
  hasMore = false,
  isLoadingMore = false,
  moreError = null,
  onLoadMore,
}: ProductReviewsProps) {
  const titleId = useId();
  return (
    <section
      className={mobilePlant ? "px-4 py-8" : "px-4 py-4 sm:px-6 md:px-8"}
      aria-labelledby={titleId}
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id={titleId}
          className={mobilePlant ? "text-mobile-heading-h3 font-bold" : "text-base font-bold leading-6 text-text-primary"}
        >
          نظرات کاربران
        </h2>

        {!mobilePlant && ratingAverage !== null && reviewCount > 0 ? (
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

      {mobilePlant && ratingAverage !== null && reviewCount > 0 && <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-background-secondary p-4">
        <bdi className="numeric-ltr text-[28px] font-bold leading-9">{toPersianDigits(ratingAverage.toFixed(1))}</bdi>
        <div><p dir="ltr" className="text-sm tracking-[2px] text-text-brand" aria-label={`امتیاز ${toPersianDigits(ratingAverage)} از ۵`}>{Array.from({ length: 5 }, (_, index) => <span key={index} className={index < Math.round(ratingAverage) ? "" : "opacity-25"}>★</span>)}</p><p className="mt-1 text-mobile-ui-caption text-text-secondary">از {toPersianDigits(reviewCount)} نظر</p></div>
      </div>}

      {isLoading ? (
        <div className={mobilePlant ? "mt-6 flex flex-col gap-6" : "mt-3 flex flex-col gap-3"}>
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
        <div className={mobilePlant ? "mt-6 flex flex-col gap-6" : "mt-3 flex flex-col gap-3"}>
          {reviews.map((review) => (
            <article
              key={review.id}
              className={mobilePlant ? "border-b border-white/10 pb-6" : "rounded-xl bg-background-secondary p-3"}
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

              {mobilePlant && <p dir="ltr" className="mt-3 text-xs tracking-[2px] text-text-brand" aria-label={`امتیاز ${toPersianDigits(review.rating)} از ۵`}>{Array.from({ length: 5 }, (_, index) => <span key={index} className={index < review.rating ? "" : "opacity-25"}>★</span>)}</p>}
              <p className="mt-3 whitespace-pre-line break-words text-xs font-normal leading-6 text-text-secondary">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      ) : null}
      {mobilePlant && hasMore && !isLoading && !error && onLoadMore && <div className="mt-6">
        <button type="button" onClick={onLoadMore} disabled={isLoadingMore} aria-busy={isLoadingMore} className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-background-secondary text-mobile-ui-button font-semibold disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-action-primary">{isLoadingMore ? "در حال دریافت نظرات…" : "مشاهده نظرات بیشتر"}</button>
        {moreError && <p role="status" className="mt-2 text-mobile-body-small text-text-secondary">دریافت نظرات بیشتر انجام نشد. دوباره تلاش کنید.</p>}
      </div>}
    </section>
  );
}
