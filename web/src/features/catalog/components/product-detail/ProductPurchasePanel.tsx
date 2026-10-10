"use client";
import { useRef, useState } from "react";

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
  variantId?: number;
  disabledLabel?: string;
  onAddToCart: (product: CatalogProduct, quantity: number, variantId?: number) => void | Promise<void>;
}

export function ProductPurchasePanel({
  product,
  quantity,
  canBuy,
  totalPrice,
  variantId,
  disabledLabel,
  onAddToCart,
}: ProductPurchasePanelProps) {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const add = async () => {
    if (!canBuy || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try { await onAddToCart(product, quantity, variantId); }
    catch { setError("این ترکیب در دسترس نیست؛ گلدان دیگری انتخاب کنید یا دوباره تلاش کنید."); }
    finally { locked.current = false; setBusy(false); }
  };
  return (
    <div
      data-footer-overlay="product-actions"
      className="
fixed inset-x-0 bottom-0 z-40

bg-background-secondary
shadow-purchase
rounded-t-[10px]
"
    >
      <div
        className="
          mx-auto
          flex
          h-[72px]
          w-full
          max-w-screen-lg
          items-center
          justify-between
          gap-4
          px-4
        "
      >
        {/* Price */}
        <div className="min-w-0 shrink-0">
          <p className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-xl font-bold leading-7 text-text-primary">
              {toPersianDigits(totalPrice.toLocaleString("en-US"))}
            </span>

            <span className="text-[11px] font-normal leading-5 text-text-secondary">
              تومان
            </span>
          </p>
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={add}
          disabled={!canBuy || busy}
          aria-busy={busy}
          className="
            flex
            h-11
            w-40
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            bg-action-primary
            px-4
            text-sm
            font-semibold
            leading-5
            text-background-primary
            transition-[background-color,transform,opacity]
            duration-200

            hover:opacity-90
            active:scale-[0.985]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-action-primary
            focus-visible:ring-offset-2
            focus-visible:ring-offset-background-secondary

            disabled:cursor-not-allowed
            disabled:bg-surface-muted
            disabled:text-text-disabled
            disabled:opacity-100
          "
        >
          {busy ? "در حال افزودن…" : canBuy ? "افزودن به سبد خرید" : disabledLabel ?? "در حال حاضر ناموجود"}
        </button>
      </div>
      {error && <p role="alert" className="px-4 pb-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
