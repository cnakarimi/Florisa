"use client";

import { useEffect, useRef, useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { useCart } from "@/features/cart/hooks/CartProvider";
import { CheckoutExperience } from "@/features/orders/components/CheckoutExperience";

export function CheckoutGate() {
  const router = useRouter();

  const auth = useAuth();
  const cart = useCart();

  const {
    isInitializing,
    initializationError,
    isAuthenticated,
    isProfileComplete,
  } = auth;

  const { isHydrated, items, refreshCartItems } = cart;

  const refreshCartItemsRef = useRef(refreshCartItems);

  useEffect(() => {
    refreshCartItemsRef.current = refreshCartItems;
  }, [refreshCartItems]);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !isHydrated ||
      isInitializing ||
      initializationError ||
      isReady
    ) {
      return;
    }

    if (items.length === 0) {
      router.replace("/cart?checkout_error=empty");
      return;
    }

    let isCancelled = false;

    const prepareCheckout = async () => {
      try {
        const result = await refreshCartItemsRef.current(true);

        if (isCancelled) {
          return;
        }

        if (result.error) {
          setError("امکان بررسی سبد خرید وجود ندارد. دوباره تلاش کنید.");
          return;
        }

        if (!result.isValid) {
          router.replace("/cart?checkout_error=invalid");
          return;
        }

        if (!isAuthenticated) {
          router.replace("/auth?next=%2Fcheckout");
          return;
        }

        if (!isProfileComplete) {
          router.replace("/auth/register?next=%2Fcheckout");
          return;
        }

        setIsReady(true);
      } catch {
        if (!isCancelled) {
          setError("امکان بررسی سبد خرید وجود ندارد. دوباره تلاش کنید.");
        }
      }
    };

    prepareCheckout();

    return () => {
      isCancelled = true;
    };
  }, [
    initializationError,
    isAuthenticated,
    isHydrated,
    isInitializing,
    isReady,
    isProfileComplete,
    items.length,
    router,
  ]);

  if (error || initializationError) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#0d0e12] px-6 text-zinc-100"
      >
        <div className="w-full max-w-md rounded-2xl border border-rose-400/20 bg-[#171921] p-6 text-center">
          <p className="text-sm leading-6 text-rose-300">
            {error || initializationError}
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
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-emerald-400" />

          <p className="mt-4 text-sm text-zinc-400">
            در حال بررسی سبد خرید و وضعیت ورود...
          </p>
        </div>
      </main>
    );
  }

  return <CheckoutExperience />;
}
