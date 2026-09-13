"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Heart, HeartIcon, Share2, Star } from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { toPersianDigits } from "@/utils/persian";
import { ShareIcon } from "@/components/icons/ShareButton";
import { HeartOutlineIcon } from "@/components/icons/HeartOutlineIcon";
import { StarIcon } from "@/components/icons/StarIcon";

interface ProductInfoProps {
  product: CatalogProductDetail;
  isFavorite: boolean;
  onToggleFavorite: (product: CatalogProduct) => void;
}

export function ProductInfo({
  product,
  isFavorite,
  onToggleFavorite,
}: ProductInfoProps) {
  const [shareStatus, setShareStatus] = useState("");

  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const plantDetails =
    product.product_type === "plant" ? product.details : null;

  const productSubtitle =
    plantDetails?.pot_included && plantDetails.pot_material
      ? `گلدان - ${plantDetails.pot_material}`
      : product.category.name;

  /*
   * Rating is currently mock UI because the product API
   * does not expose review aggregation yet.
   */
  const rating = 4.2;

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  const showShareStatus = (message: string) => {
    setShareStatus(message);

    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current);
    }

    shareTimerRef.current = setTimeout(() => {
      setShareStatus("");
    }, 2400);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.short_description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showShareStatus("اشتراک‌گذاری شد");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      showShareStatus("لینک محصول کپی شد");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showShareStatus("اشتراک‌گذاری انجام نشد");
    }
  };

  return (
    <section className="flex flex-col gap-3" aria-labelledby="product-name">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <h1
          id="product-name"
          className="min-w-0 text-right text-xl font-bold leading-7 text-text-primary"
        >
          {product.name}
        </h1>

        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={handleShare}
            className="grid size-8 place-items-center text-text-primary transition-colors hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="اشتراک‌گذاری محصول"
          >
            <ShareIcon aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(product)}
            className={`grid size-8 place-items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
              isFavorite ? "text-red-500" : "text-red-500 hover:text-red-400"
            }`}
            aria-label={
              isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
            }
            aria-pressed={isFavorite}
          >
            <HeartOutlineIcon
              className={`${isFavorite ? "bg-error-100" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 text-right text-sm font-normal leading-5 text-text-secondary">
          {productSubtitle}
        </p>

        <div className="flex shrink-0 items-center gap-1 pl-1.5">
          <span className="text-xs font-medium leading-5 text-text-primary">
            {toPersianDigits(rating)}
          </span>
          <StarIcon
            className="size-3.5 fill-current text-text-brand mb-1"
            aria-hidden="true"
          />
        </div>
      </div>

      {shareStatus ? (
        <p className="sr-only" role="status" aria-live="polite">
          <Check aria-hidden="true" />
          {shareStatus}
        </p>
      ) : null}
    </section>
  );
}
