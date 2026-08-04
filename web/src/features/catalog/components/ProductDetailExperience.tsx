"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/features/cart/hooks/CartProvider";
import { CartDrawer } from "@/features/home/components/CartDrawer";
import { getProductDetail } from "@/features/catalog/api/catalog";
import type { CatalogProductDetail } from "@/features/catalog/types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

import { CatalogFeedback } from "./CatalogFeedback";
import { ProductDetailLoading } from "./ProductDetailLoading";
import { ProductDetailView } from "./ProductDetailView";

interface ProductDetailExperienceProps {
  slug: string;
}

export function ProductDetailExperience({
  slug,
}: ProductDetailExperienceProps) {
  const router = useRouter();
  const cart = useCart();
  const [product, setProduct] = useState<CatalogProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve().then(() => {
      if (!isCurrent) {
        return;
      }
      setIsLoading(true);
      setError(null);
      setIsNotFound(false);
      setProduct(null);
      setIsFavorite(false);
    });

    getProductDetail(slug, retryKey > 0)
      .then((result) => {
        if (isCurrent) {
          setProduct(result);
        }
      })
      .catch((requestError: unknown) => {
        if (!isCurrent) {
          return;
        }

        if (requestError instanceof ApiError && requestError.status === 404) {
          setIsNotFound(true);
          return;
        }
        setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [retryKey, slug]);

  useEffect(() => {
    if (!product) {
      return;
    }
    const previousTitle = document.title;
    document.title = `${product.name} | فلوریسا`;
    return () => {
      document.title = previousTitle;
    };
  }, [product]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  if (isNotFound || error || !product) {
    return (
      <main
        dir="rtl"
        className="min-h-dvh bg-black text-white selection:bg-[#c7a23c]/30"
      >
        <div className="mx-auto min-h-dvh w-full max-w-screen-lg bg-[#111211] px-4 py-5 shadow-2xl shadow-black sm:px-6 md:px-8 md:py-7">
          <div className="mx-auto w-full max-w-xl">
            <button
              type="button"
              onClick={goBack}
              className="mb-8 grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-[#191b19] text-[#ddd9d1] transition hover:border-[#c7a23c]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
              aria-label="بازگشت"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="rounded-[24px] border border-white/[0.06] bg-[#171917] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-6">
              <CatalogFeedback
                kind={isNotFound ? "empty" : "error"}
                message={
                  isNotFound
                    ? "محصول موردنظر پیدا نشد یا دیگر فعال نیست."
                    : error || "دریافت جزئیات محصول با مشکل روبه‌رو شد."
                }
                onRetry={
                  isNotFound
                    ? undefined
                    : () => setRetryKey((current) => current + 1)
                }
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <ProductDetailView
        key={product.id}
        product={product}
        cartCount={cart.isHydrated ? cart.totalQuantity : 0}
        isFavorite={isFavorite}
        onBack={goBack}
        onNavigateToCart={() => router.push("/cart")}
        onToggleFavorite={() => setIsFavorite((current) => !current)}
        onAddToCart={(selectedProduct, quantity) => {
          cart.addItem(selectedProduct, quantity);
          setIsCartOpen(true);
        }}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
