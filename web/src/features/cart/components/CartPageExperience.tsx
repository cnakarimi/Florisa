"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Flower2,
  LoaderCircle,
  MoreVertical,
  PackageX,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { useCart } from "@/features/cart/hooks/CartProvider";
import type { CartItem } from "@/features/cart/types";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { BottomNav } from "@/features/home/components/BottomNav";
import {
  formatToman,
  toPersianDigits,
} from "@/features/home/utils/persian";
import { CartPageLoading } from "./CartPageLoading";

interface CartPageExperienceProps {
  initialMessage?: string;
}

export function CartPageExperience({
  initialMessage = "",
}: CartPageExperienceProps) {
  const router = useRouter();
  const auth = useAuth();
  const cart = useCart();
  const hasRefreshedRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState(initialMessage);

  useEffect(() => {
    if (
      !cart.isHydrated ||
      cart.items.length === 0 ||
      hasRefreshedRef.current
    ) {
      return;
    }

    hasRefreshedRef.current = true;
    cart.refreshCartItems(true).catch(() => undefined);
  }, [cart]);

  if (!cart.isHydrated) {
    return (
      <>
        <CartPageLoading />
        <BottomNav />
      </>
    );
  }

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  const confirmRemove = (item: CartItem) => {
    if (window.confirm(`«${item.product.name}» از سبد خرید حذف شود؟`)) {
      cart.removeItem(item.product.id);
      setCheckoutError("");
    }
  };

  const decreaseItem = (item: CartItem) => {
    if (item.quantity <= item.product.minimum_order_bundles) {
      confirmRemove(item);
      return;
    }
    cart.decreaseItem(item.product.id);
    setCheckoutError("");
  };

  const clearCart = () => {
    setIsMenuOpen(false);
    if (window.confirm("همه کالاهای سبد خرید حذف شوند؟")) {
      cart.clearCart();
      setCheckoutError("");
    }
  };

  const continueToCheckout = async () => {
    setCheckoutError("");

    if (cart.items.length === 0) {
      setCheckoutError("سبد خرید شما خالی است.");
      return;
    }

    const result = await cart.refreshCartItems(true);
    if (!result.isValid) {
      setCheckoutError(
        result.error ||
          "برخی کالاهای سبد خرید ناموجود یا دارای تعداد نامعتبر هستند. لطفاً سبد را بررسی کنید.",
      );
      return;
    }

    if (auth.initializationError) {
      setCheckoutError(
        "وضعیت ورود شما بررسی نشد. لطفاً دوباره تلاش کنید.",
      );
      return;
    }

    router.push(
      auth.isAuthenticated ? "/checkout" : "/auth?next=%2Fcheckout",
    );
  };

  return (
    <>
      <main
        dir="rtl"
        className="min-h-screen bg-[#0d0e12] pb-36 text-right text-zinc-100 animate-in fade-in duration-300"
      >
      <header className="relative z-20 mx-auto mb-6 flex w-full max-w-md items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={goBack}
          className="p-2 text-zinc-300 transition-colors hover:text-white active:scale-95"
          aria-label="بازگشت"
        >
          <ArrowRight className="h-6 w-6" />
        </button>

        <h1 className="text-lg font-black tracking-tight text-white">
          سبد خرید
        </h1>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            disabled={cart.items.length === 0}
            className="p-2 text-zinc-300 transition-colors hover:text-white disabled:opacity-30"
            aria-label="گزینه‌های سبد خرید"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {isMenuOpen ? (
            <div className="absolute left-0 top-11 z-30 w-36 rounded-xl border border-white/10 bg-[#1b1d28] p-1 shadow-xl">
              <button
                type="button"
                onClick={clearCart}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-white/5"
              >
                <Trash2 className="h-4 w-4" />
                پاک کردن سبد
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-md space-y-6 px-4">
        {cart.isRefreshing ? (
          <div
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300"
            role="status"
          >
            <LoaderCircle className="h-4 w-4 animate-auth-spin" />
            در حال به‌روزرسانی قیمت و موجودی کالاها...
          </div>
        ) : null}

        {cart.refreshError ? (
          <div
            className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs leading-6 text-rose-300"
            role="alert"
          >
            اطلاعات فعلی کالاها دریافت نشد. برای ادامه خرید دوباره تلاش کنید.
          </div>
        ) : null}

        {cart.items.length === 0 ? (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-[#14151e] p-8 py-20 text-center text-zinc-400">
            <ShoppingBag className="mx-auto h-16 w-16 text-amber-400/50" />
            <h2 className="text-lg font-bold text-white">
              سبد خرید شما خالی است
            </h2>
            <p className="mx-auto max-w-xs text-xs leading-relaxed text-zinc-400">
              می‌توانید تازه‌ترین گل‌های فلوریسا را ببینید و بدون نیاز به
              ورود، به سبد خریدتان اضافه کنید.
            </p>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="mt-4 rounded-xl bg-amber-400 px-6 py-3 text-xs font-extrabold text-black shadow-lg shadow-amber-500/10 transition hover:bg-amber-300"
            >
              مشاهده فروشگاه
            </button>
          </section>
        ) : (
          <>
            <section className="space-y-4" aria-label="کالاهای سبد خرید">
              {cart.items.map((item) => {
                const isUnavailable =
                  !item.product.is_available ||
                  !item.product.is_in_stock ||
                  item.product.stock_bundles <
                    item.product.minimum_order_bundles;
                const isAtMinimum =
                  item.quantity <= item.product.minimum_order_bundles;
                const isAtMaximum =
                  item.quantity >= item.product.stock_bundles;
                const itemStems =
                  item.quantity * item.product.stems_per_bundle;
                const itemSubtotal =
                  item.quantity * item.product.price_per_bundle;

                return (
                  <article
                    key={item.product.id}
                    className={`relative rounded-2xl border bg-[#141620] p-3.5 shadow-xl ${
                      isUnavailable
                        ? "border-rose-400/30"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/products/${encodeURIComponent(item.product.slug)}`,
                          )
                        }
                        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/5 bg-[#0d0e12]"
                        aria-label={`مشاهده ${item.product.name}`}
                      >
                        <CatalogImage
                          src={getProductImageUrl(item.product.cover_image)}
                          alt={item.product.name}
                          sizes="96px"
                        />
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 text-right">
                            <h2 className="truncate text-sm font-extrabold leading-tight text-white">
                              {item.product.name}
                            </h2>
                            <p className="mt-1 truncate text-[11px] text-zinc-400">
                              {item.product.flower_type}
                              {item.product.color
                                ? `، ${item.product.color}`
                                : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => confirmRemove(item)}
                            className="shrink-0 p-1 text-rose-400 transition hover:text-rose-300"
                            aria-label={`حذف ${item.product.name}`}
                          >
                            <Trash2 className="h-4 w-4 stroke-[1.8]" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[10px] text-zinc-500">
                              جمع این کالا
                            </p>
                            <p className="text-sm font-black text-amber-400">
                              {formatToman(itemSubtotal)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1b1d28] px-2.5 py-1 text-xs">
                            <button
                              type="button"
                              onClick={() => decreaseItem(item)}
                              disabled={isUnavailable}
                              className="flex h-6 w-6 items-center justify-center rounded-md font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={
                                isAtMinimum
                                  ? `حذف ${item.product.name}`
                                  : "کاهش یک دسته"
                              }
                            >
                              {isAtMinimum ? (
                                <Trash2 className="h-3.5 w-3.5" />
                              ) : (
                                "−"
                              )}
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-white">
                              {toPersianDigits(item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                cart.increaseItem(item.product.id)
                              }
                              disabled={isUnavailable || isAtMaximum}
                              className="flex h-6 w-6 items-center justify-center rounded-md font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="افزایش یک دسته"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center">
                      <CartItemFact
                        label="تعداد دسته"
                        value={toPersianDigits(item.quantity)}
                      />
                      <CartItemFact
                        label="شاخه در هر دسته"
                        value={toPersianDigits(
                          item.product.stems_per_bundle,
                        )}
                      />
                      <CartItemFact
                        label="مجموع شاخه"
                        value={toPersianDigits(itemStems)}
                      />
                    </div>

                    {isUnavailable ? (
                      <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                        <PackageX className="h-4 w-4 shrink-0" />
                        این کالا دیگر در دسترس نیست و باید از سبد حذف شود.
                      </p>
                    ) : (
                      <p className="mt-2 text-[10px] text-zinc-500">
                        قیمت هر دسته:{" "}
                        {formatToman(item.product.price_per_bundle)} · حداقل{" "}
                        {toPersianDigits(
                          item.product.minimum_order_bundles,
                        )}{" "}
                        دسته · موجودی{" "}
                        {toPersianDigits(item.product.stock_bundles)} دسته
                      </p>
                    )}
                  </article>
                );
              })}
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#141620] p-4 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">خلاصه سبد خرید</h2>
              </div>
              <div className="space-y-3 text-xs">
                <SummaryRow
                  label="تعداد کالا"
                  value={`${toPersianDigits(cart.totalItems)} مورد`}
                />
                <SummaryRow
                  label="مجموع دسته‌ها"
                  value={`${toPersianDigits(cart.totalBundles)} دسته`}
                />
                <SummaryRow
                  label="مجموع شاخه‌ها"
                  value={`${toPersianDigits(cart.totalStems)} شاخه`}
                />
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm font-bold">
                  <span className="text-zinc-300">مبلغ کل محصولات</span>
                  <span className="text-base font-black text-amber-400">
                    {formatToman(cart.subtotal)}
                  </span>
                </div>
              </div>
            </section>
          </>
        )}

        {checkoutError ? (
          <p
            className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-xs leading-6 text-rose-300"
            role="alert"
          >
            {checkoutError}
          </p>
        ) : null}
      </div>

      {cart.items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md border-t border-white/10 bg-[#121319]/95 px-4 py-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={continueToCheckout}
              disabled={cart.isRefreshing || auth.isInitializing}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-xs font-black text-black shadow-xl shadow-amber-500/10 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
            >
              {cart.isRefreshing ? (
                <LoaderCircle className="h-4 w-4 animate-auth-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              ادامه برای تسویه حساب
            </button>

            <div className="text-right">
              <span className="block text-[11px] font-medium text-zinc-400">
                جمع نهایی
              </span>
              <span className="mt-0.5 block text-base font-black tracking-tight text-amber-400">
                {formatToman(cart.subtotal)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="mt-2 flex w-full items-center justify-center gap-1 py-1 text-[11px] text-zinc-400 hover:text-white"
          >
            ادامه خرید
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      </main>
      <BottomNav />
    </>
  );
}

function CartItemFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2 py-2">
      <p className="text-[9px] text-zinc-500">{label}</p>
      <p className="mt-1 text-[11px] font-bold text-zinc-200">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-zinc-300">
      <span className="text-zinc-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
