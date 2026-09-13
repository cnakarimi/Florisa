"use client";

import { ShoppingBag } from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";

import { toPersianDigits } from "@/utils/persian";

interface ProductPurchasePanelProps {
  product: CatalogProductDetail;
  quantity: number;
  canBuy: boolean;
  totalPrice: number;
  onAddToCart: (product: CatalogProduct, quantity: number) => void;
}

export function ProductPurchasePanel({
  product,
  quantity,
  canBuy,
  totalPrice,
  onAddToCart,
}: ProductPurchasePanelProps) {
  return (
    <div
      data-footer-overlay="product-actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-background-secondary/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex h-20 w-full max-w-screen-lg items-center justify-between gap-4 px-4">
        <button
          type="button"
          onClick={() => onAddToCart(product, quantity)}
          disabled={!canBuy}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] bg-action-primary px-4 text-[15px] font-semibold leading-[22px] text-text-inverse transition-colors hover:bg-brand-100 active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-secondary"
        >
          {canBuy ? (
            <>
              <ShoppingBag className="size-5 shrink-0" aria-hidden="true" />
              <span>افزودن به سبد خرید</span>
            </>
          ) : (
            <span>در حال حاضر ناموجود</span>
          )}
        </button>

        <div className="shrink-0 text-right">
          <p className="whitespace-nowrap text-xl font-bold leading-7 text-text-primary">
            {toPersianDigits(totalPrice.toLocaleString("en-US"))}
          </p>

          <p className="mt-1 text-[13px] font-normal leading-5 text-text-secondary">
            تومان
          </p>
        </div>
      </div>
    </div>
  );
}
