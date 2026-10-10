"use client";

import { useId } from "react";
import Link from "next/link";
import { ProductCard } from "@/features/catalog/components/ProductCard";

import type { CatalogProduct } from "@/features/catalog/types";

interface RelatedProductsProps {
  products: CatalogProduct[];
  isLoading: boolean;
  onAddToCart: (product: CatalogProduct) => void | Promise<void>;
  onSelectProduct: (product: CatalogProduct) => void;
  mobilePlant?: boolean;
}

export function RelatedProducts({
  products,
  isLoading,
  onAddToCart,
  onSelectProduct,
  mobilePlant = false,
}: RelatedProductsProps) {
  const titleId = useId();
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className={mobilePlant ? "py-8" : "py-4"} aria-labelledby={titleId}>
      <div className="flex items-center justify-between">
      <h2
        id={titleId}
        className={mobilePlant ? "px-5 text-mobile-body-large font-normal" : "px-4 text-base font-bold leading-6 text-text-primary sm:px-6 md:px-8"}
      >
        {mobilePlant ? "گیاهان پیشنهادی" : "محصولات مشابه"}
      </h2>
      {mobilePlant && <Link href="/shop?product_type=plant" className="px-5 text-mobile-body-small text-text-secondary">مشاهده همه</Link>}
      </div>

      {isLoading ? (
        <div
          className="
            mt-3
            flex
            gap-3
            overflow-hidden
            px-4

            sm:gap-4
            sm:px-6

            md:px-8
          "
          aria-hidden="true"
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className={mobilePlant ? "w-[220px] shrink-0 snap-start [&_article]:border [&_article]:border-white/10 [&_article>button]:aspect-auto [&_article>button]:h-[200px] [&_h3]:text-[15px]" : `
                w-[72vw]
                min-w-[240px]
                max-w-[290px]
                shrink-0

                sm:w-[44vw]
                sm:max-w-[310px]

                md:w-[30vw]
                md:max-w-[300px]
              `}
            >
              <div className="overflow-hidden rounded-xl bg-background-secondary">
                <div className="aspect-square animate-pulse bg-background-tertiary" />

                <div className="space-y-3 p-3 sm:p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-background-tertiary" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-background-tertiary" />
                  <div className="h-9 animate-pulse rounded bg-background-tertiary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          dir="rtl"
          className={mobilePlant ? "mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : `
            mt-3
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            overscroll-x-contain
            px-4
            pb-2

            sm:gap-4
            sm:px-6

            md:px-8

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          `}
          aria-label="محصولات مشابه"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={mobilePlant ? "w-[220px] shrink-0 snap-start [&_article]:border [&_article]:border-white/10 [&_article>button]:aspect-auto [&_article>button]:h-[200px] [&_h3]:text-[15px]" : `
                w-[72vw]
                min-w-[240px]
                max-w-[290px]
                shrink-0
                snap-start

                sm:w-[44vw]
                sm:max-w-[310px]

                md:w-[30vw]
                md:max-w-[300px]
              `}
            >
              <ProductCard
                product={product}
                imageSizes="(min-width: 768px) 300px, (min-width: 640px) 310px, 290px"
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
