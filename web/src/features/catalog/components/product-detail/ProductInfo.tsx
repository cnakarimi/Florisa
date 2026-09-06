"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Heart, Leaf, Share2 } from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import {
  getProductColor,
  getProductIdentity,
} from "@/features/catalog/utils/product";

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

  const productIdentity = getProductIdentity(product);
  const productColor = getProductColor(product);

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
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-text-secondary sm:text-xs">
            {product.category.name}
          </p>

          <h1 className="mt-2 text-[26px] font-black leading-[1.45] tracking-tight text-text-primary sm:text-3xl md:text-[32px]">
            {product.name}
          </h1>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="grid size-10 place-items-center rounded-full border border-border-subtle bg-surface-muted text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="اشتراک‌گذاری محصول"
          >
            <Share2 className="size-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(product)}
            className={`grid size-10 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
              isFavorite
                ? "border-rose-300/25 bg-rose-500/15 text-rose-300"
                : "border-border-subtle bg-surface-muted text-text-secondary hover:border-rose-300/20 hover:text-rose-300"
            }`}
            aria-label={
              isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
            }
            aria-pressed={isFavorite}
          >
            <Heart
              className={`size-4 ${isFavorite ? "fill-current" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {shareStatus ? (
        <p
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-2.5 py-1 text-[10px] font-medium text-text-secondary"
          role="status"
          aria-live="polite"
        >
          <Check className="size-3" aria-hidden="true" />
          {shareStatus}
        </p>
      ) : null}

      {product.short_description ? (
        <p className="mt-4 text-[13px] leading-7 text-text-secondary sm:text-sm">
          {product.short_description}
        </p>
      ) : null}

      {productIdentity || productColor ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {productIdentity ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-[10px] font-semibold text-text-secondary sm:text-[11px]">
              <Leaf className="size-3.5" aria-hidden="true" />
              {productIdentity}
            </span>
          ) : null}

          {productColor ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-muted px-3 py-1.5 text-[10px] font-semibold text-text-secondary sm:text-[11px]">
              <span
                className="size-2 rounded-full bg-white/70"
                aria-hidden="true"
              />
              {productColor}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
