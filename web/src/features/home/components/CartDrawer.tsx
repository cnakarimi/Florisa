"use client";

import { useEffect } from "react";
import { ArrowLeft, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { formatToman, toPersianDigits } from "../utils/persian";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const cart = useCart();

  useEffect(() => {
    if (isOpen && cart.isHydrated && cart.items.length > 0) {
      cart.refreshCartItems().catch(() => undefined);
    }
  }, [cart, isOpen]);

  if (!isOpen) {
    return null;
  }

  const openCartPage = () => {
    onClose();
    router.push("/cart");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="بستن پیش‌نمایش سبد خرید"
      />

      <aside
        dir="rtl"
        className="relative flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-[#14151e] p-5 text-right text-zinc-100 shadow-2xl animate-in slide-in-from-left duration-300"
      >
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
            <h2 id="cart-drawer-title" className="text-base font-bold text-white">
              سبد خرید شما
            </h2>
            <span className="text-xs text-zinc-400">
              ({toPersianDigits(cart.totalItems)} کالا)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {!cart.isHydrated ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            در حال آماده‌سازی سبد خرید...
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center text-zinc-500">
            <ShoppingBag className="mb-3 h-12 w-12 text-emerald-400 opacity-30" />
            <p className="text-sm font-medium text-zinc-300">
              سبد خرید شما خالی است
            </p>
            <p className="mt-1 text-xs leading-6 text-zinc-600">
              محصولات دلخواهتان را از فروشگاه به سبد اضافه کنید.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-3">
              {cart.items.slice(0, 3).map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#1c1e2a] p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40">
                    <CatalogImage
                      src={item.product.cover_image}
                      alt={item.product.name}
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold text-white">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-[10px] text-zinc-400">
                      {toPersianDigits(item.quantity)} دسته،{" "}
                      {toPersianDigits(
                        item.quantity * item.product.stems_per_bundle,
                      )}{" "}
                      شاخه
                    </p>
                    <p className="mt-1 text-xs font-extrabold text-amber-400">
                      {formatToman(
                        item.product.price_per_bundle * item.quantity,
                      )}
                    </p>
                    {!item.product.is_available ||
                    !item.product.is_in_stock ? (
                      <p className="mt-1 text-[10px] text-rose-400">
                        نیازمند بررسی در صفحه سبد خرید
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {cart.items.length > 3 ? (
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                و {toPersianDigits(cart.items.length - 3)} کالای دیگر
              </p>
            ) : null}
          </div>
        )}

        <footer className="space-y-3 border-t border-white/10 pt-4">
          {cart.items.length > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">جمع سبد</span>
              <span className="font-black text-amber-400">
                {formatToman(cart.subtotal)}
              </span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={openCartPage}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-extrabold text-black transition hover:bg-amber-300"
          >
            <span>مشاهده و مدیریت سبد خرید</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </footer>
      </aside>
    </div>
  );
}
