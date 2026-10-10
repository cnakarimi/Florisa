"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ProductDesignIcon } from "./PlantMobileSections";

import {
  HeartOutlineIcon,
  ShareIcon,
  StarIcon,
} from "@/components/icons";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";

import { toPersianDigits } from "@/utils/persian";

interface ProductInfoProps {
  product: CatalogProductDetail;
  isFavorite: boolean;
  onToggleFavorite: (product: CatalogProduct) => void;
  mobilePlant?: boolean;
  potName?: string;
}

export function ProductInfo({
  product,
  isFavorite,
  onToggleFavorite,
  mobilePlant = false,
  potName,
}: ProductInfoProps) {
  const nameId = useId();
  const [shareStatus, setShareStatus] = useState("");

  const shareTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const plantDetails =
    product.product_type === "plant"
      ? product.details
      : null;

  const productSubtitle = potName ?? (
    plantDetails?.pot_included && plantDetails.pot_material
      ? `${mobilePlant ? "گلدان " : "گلدان - "}${plantDetails.pot_material}`
      : product.category.name);

  const rating = product.rating_average;

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

      await navigator.clipboard.writeText(
        window.location.href,
      );

      showShareStatus("لینک محصول کپی شد");
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      showShareStatus("اشتراک‌گذاری انجام نشد");
    }
  };

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby={nameId}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <h1
          id={nameId}
          className="min-w-0 text-right text-xl font-bold leading-7 text-text-primary"
        >
          {product.name}
        </h1>

        <div className={`flex shrink-0 items-center ${mobilePlant ? "gap-[22px]" : "gap-4"}`}>
          <button
            type="button"
            onClick={handleShare}
            className="grid size-8 place-items-center text-text-primary transition-colors hover:text-text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="اشتراک‌گذاری محصول"
          >
            {mobilePlant ? <ProductDesignIcon name="share" /> : <ShareIcon aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(product)}
            className={`grid size-8 place-items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
              isFavorite
                ? "text-red-500"
                : "text-red-500 hover:text-red-400"
            }`}
            aria-label={
              isFavorite
                ? "حذف از علاقه‌مندی‌ها"
                : "افزودن به علاقه‌مندی‌ها"
            }
            aria-pressed={isFavorite}
          >
            {mobilePlant ? <span className={isFavorite ? "rounded-full bg-red-500/20" : ""}><ProductDesignIcon name="favorite" /></span> : <HeartOutlineIcon
              className={
                isFavorite ? "bg-error-100" : undefined
              }
              aria-hidden="true"
            />}
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-4">
        <p className={`min-w-0 text-right font-normal leading-5 text-text-secondary ${mobilePlant ? "text-xs" : "text-sm"}`}>
          {productSubtitle}
        </p>

        {rating !== null ? (
          <div className="flex shrink-0 items-center gap-1 pl-1.5">
            <span className="text-xs font-medium leading-5 text-text-primary">
              <bdi>{toPersianDigits(rating.toFixed(1))}</bdi>
            </span>

            {mobilePlant ? <ProductDesignIcon name="star" /> : <StarIcon
              className="mb-1 size-3.5 fill-current text-text-brand"
              aria-hidden="true"
            />}
          </div>
        ) : null}
      </div>

      {shareStatus ? (
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
        >
          {shareStatus}
        </p>
      ) : null}
    </section>
  );
}
