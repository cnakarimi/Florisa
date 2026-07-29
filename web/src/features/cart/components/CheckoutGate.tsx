"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { formatToman } from "@/features/home/utils/persian";

export function CheckoutGate() {
  const router = useRouter();
  const auth = useAuth();
  const cart = useCart();
  const hasStartedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !cart.isHydrated ||
      auth.isInitializing ||
      auth.initializationError ||
      hasStartedRef.current
    ) {
      return;
    }

    if (cart.items.length === 0) {
      hasStartedRef.current = true;
      router.replace("/cart?checkout_error=empty");
      return;
    }

    hasStartedRef.current = true;
    cart
      .refreshCartItems(true)
      .then((result) => {
        if (!result.isValid) {
          router.replace("/cart?checkout_error=invalid");
          return;
        }

        if (!auth.isAuthenticated) {
          router.replace("/auth?next=%2Fcheckout");
          return;
        }

        setIsReady(true);
      })
      .catch(() => {
        setError("امکان بررسی سبد خرید وجود ندارد. دوباره تلاش کنید.");
      });
  }, [auth, cart, router]);

  if (error || auth.initializationError) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0d0e12] px-6 text-zinc-100"
      >
        <div className="w-full max-w-md rounded-2xl border border-rose-400/20 bg-[#171921] p-6 text-center">
          <p className="text-sm leading-6 text-rose-300">
            {error || "وضعیت ورود شما بررسی نشد."}
          </p>
          <button
            type="button"
            onClick={() => router.replace("/cart")}
            className="mt-5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-black"
          >
            بازگشت به سبد خرید
          </button>
        </div>
      </main>
    );
  }

  if (
    !cart.isHydrated ||
    auth.isInitializing ||
    cart.isRefreshing ||
    !isReady
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0d0e12] px-6 text-zinc-100"
      >
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-auth-spin text-emerald-400" />
          <p className="mt-4 text-sm text-zinc-400">
            در حال بررسی سبد خرید و وضعیت ورود...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0d0e12] px-4 py-6 text-zinc-100"
    >
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#191b23] text-zinc-200"
          aria-label="بازگشت به سبد خرید"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <section className="mt-20 rounded-3xl border border-white/10 bg-[#171921] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-xl font-black text-white">
            تسویه حساب
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            ورود شما تأیید شد و سبد خرید معتبر است. فرایند پرداخت و ثبت سفارش
            در مرحله بعدی پیاده‌سازی خواهد شد.
          </p>
          <div className="mt-6 flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm">
            <span className="text-zinc-400">مبلغ سبد</span>
            <span className="font-black text-amber-400">
              {formatToman(cart.subtotal)}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
