"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { getPriceUnitLabel } from "@/features/catalog/utils/product";
import { formatToman, toPersianDigits } from "@/utils/persian";

interface ProductPurchasePanelProps {
  product: CatalogProductDetail;
  quantity: number;
  minimumQuantity: number;
  maximumQuantity: number;
  canBuy: boolean;
  salesUnit: string;
  totalPrice: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: (product: CatalogProduct, quantity: number) => void;
}

export function ProductPurchasePanel({
  product,
  quantity,
  minimumQuantity,
  maximumQuantity,
  canBuy,
  salesUnit,
  totalPrice,
  onQuantityChange,
  onAddToCart,
}: ProductPurchasePanelProps) {
  const decreaseQuantity = () => {
    onQuantityChange(Math.max(minimumQuantity, quantity - 1));
  };

  const increaseQuantity = () => {
    onQuantityChange(Math.min(maximumQuantity, quantity + 1));
  };

  return (
    <>
      <div className="mt-7 overflow-hidden rounded-[22px] border border-border-subtle bg-surface-muted shadow-large">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="text-[10px] text-text-secondary">قیمت هر واحد فروش</p>

            <p className="mt-1.5 text-lg font-black text-text-brand sm:text-xl">
              {formatToman(product.price)}
            </p>

            <p className="mt-1 text-[9px] text-text-secondary">
              {getPriceUnitLabel(product)}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
              canBuy
                ? "bg-emerald-400/[0.08] text-emerald-300"
                : "bg-rose-400/[0.08] text-rose-300"
            }`}
          >
            {canBuy ? "آماده سفارش" : "ناموجود"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-xs font-bold text-text-primary">
              تعداد {salesUnit}
            </p>

            <p className="mt-1 text-[9px] text-text-secondary sm:text-[10px]">
              حداقل سفارش {toPersianDigits(minimumQuantity)} {salesUnit}
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-border-subtle bg-background-primary p-1">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={!canBuy || quantity <= minimumQuantity}
              className="grid size-8 place-items-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-20"
              aria-label="کاهش تعداد"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>

            <span className="min-w-10 text-center text-sm font-black text-text-primary">
              {toPersianDigits(quantity)}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={!canBuy || quantity >= maximumQuantity}
              className="grid size-8 place-items-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-20"
              aria-label="افزایش تعداد"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        data-footer-overlay="product-actions"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-screen-lg border-t border-border-subtle bg-background-secondary/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-navbar backdrop-blur-xl sm:px-6 md:px-8"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="min-w-0 shrink-0">
            <p className="text-[9px] text-text-secondary sm:text-[10px]">
              جمع {toPersianDigits(quantity)} {salesUnit}
            </p>

            <p className="mt-1 whitespace-nowrap text-sm font-black text-text-brand sm:text-base">
              {formatToman(totalPrice)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product, quantity)}
            disabled={!canBuy}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-action-primary px-3 text-xs font-black text-text-inverse shadow-brand transition-colors hover:bg-brand-100 active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-secondary disabled:shadow-none sm:min-h-14 sm:text-sm"
          >
            {canBuy ? (
              <>
                <ShoppingBag className="size-[18px]" aria-hidden="true" />
                افزودن به سبد خرید
              </>
            ) : (
              "در حال حاضر ناموجود"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
