"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
  CatalogProductReview,
} from "@/features/catalog/types";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { toPersianDigits } from "@/utils/persian";

import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { ProductImageZoomDialog } from "./ProductImageZoomDialog";
import { ProductInfo } from "./ProductInfo";
import { ProductOptions } from "./ProductOptions";
import { ProductPurchasePanel } from "./ProductPurchasePanel";
import { ProductReviews } from "./ProductReviews";
import {
  CutFlowerSpecifications,
  PlantDetails,
  ProductCareTips,
} from "./ProductSpecifications";

interface ProductDetailViewProps {
  product: CatalogProductDetail;

  reviews: CatalogProductReview[];
  areReviewsLoading: boolean;
  reviewsError: string | null;

  cartCount: number;
  isFavorite: boolean;

  onBack: () => void;
  onNavigateToCart: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct, quantity: number) => void;
}

export function ProductDetailView({
  product,
  reviews,
  areReviewsLoading,
  reviewsError,
  cartCount,
  isFavorite,
  onBack,
  onNavigateToCart,
  onToggleFavorite,
  onAddToCart,
}: ProductDetailViewProps) {
  const gallery = useMemo<GalleryImage[]>(() => {
    const seen = new Set<string>();
    const images: GalleryImage[] = [];

    const coverImageUrl = getProductImageUrl(product.cover_image);

    if (coverImageUrl) {
      seen.add(coverImageUrl);

      images.push({
        key: "cover",
        src: coverImageUrl,
        alt: product.name,
      });
    }

    for (const image of product.images) {
      const imageUrl = getProductImageUrl(image.image);

      if (!imageUrl || seen.has(imageUrl)) {
        continue;
      }

      seen.add(imageUrl);

      images.push({
        key: String(image.id),
        src: imageUrl,
        alt: image.alt_text || product.name,
      });
    }

    if (images.length === 0) {
      images.push({
        key: "fallback",
        src: null,
        alt: product.name,
      });
    }

    return images;
  }, [product]);

  const minimumQuantity = Math.max(1, product.minimum_order_quantity);

  const canBuy =
    product.is_in_stock && product.stock_quantity >= minimumQuantity;

  /*
   * Quantity selection is not part of the current
   * mobile Product Detail design.
   *
   * Until that interaction is designed, Add to Cart
   * uses the product's minimum order quantity.
   */
  const quantity = minimumQuantity;

  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const activeImage = gallery[selectedImage] ?? gallery[0];

  const totalPrice = product.price * quantity;

  /*
   * Keep the actual detail object so TypeScript
   * can correctly narrow the product type.
   */
  const plantDetails =
    product.product_type === "plant" ? product.details : null;

  const cutFlowerDetails =
    product.product_type === "cut_flower" ? product.details : null;

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-background-primary text-right text-text-primary selection:bg-action-primary/30 selection:text-text-inverse"
    >
      <div className="mx-auto min-h-dvh w-full max-w-screen-lg bg-background-primary pb-24 shadow-large md:pb-32">
        {/* Temporary desktop header.
            Mobile navigation lives inside ProductGallery.
            Desktop will be redesigned after its Figma is complete. */}
        <header className="sticky top-0 z-30 hidden h-[68px] items-center justify-between border-b border-border-subtle bg-background-secondary/90 px-8 backdrop-blur-xl md:flex">
          <button
            type="button"
            onClick={onBack}
            className="grid size-10 place-items-center rounded-full border border-border-subtle bg-surface-muted text-text-secondary transition-colors hover:border-action-primary/30 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="بازگشت"
          >
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </button>

          <div className="text-center">
            <p className="text-[9px] font-black tracking-[0.24em] text-text-brand">
              FLORISA
            </p>

            <p className="mt-1 text-[11px] font-semibold text-text-secondary">
              جزئیات محصول
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToCart}
            className="relative grid size-10 place-items-center rounded-full border border-border-subtle bg-surface-muted text-text-secondary transition-colors hover:border-action-primary/30 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="مشاهده سبد خرید"
          >
            <ShoppingBag className="size-[18px]" aria-hidden="true" />

            {cartCount > 0 ? (
              <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-action-primary px-1 text-[9px] font-black text-text-inverse ring-2 ring-background-secondary">
                {toPersianDigits(cartCount)}
              </span>
            ) : null}
          </button>
        </header>

        {/* Gallery + primary product information */}
        <div className="grid gap-0 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] md:items-start md:gap-8 md:px-8 md:pt-8">
          <ProductGallery
            gallery={gallery}
            selectedImage={selectedImage}
            cartCount={cartCount}
            onBack={onBack}
            onNavigateToCart={onNavigateToCart}
            onSelectImage={setSelectedImage}
            onOpenZoom={() => setIsZoomOpen(true)}
          />

          <section className="min-w-0 px-4 py-4 sm:px-6 md:px-0 md:py-0 md:pt-2">
            <ProductInfo
              product={product}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
            />

            {plantDetails ? <ProductOptions /> : null}

            <ProductPurchasePanel
              product={product}
              quantity={quantity}
              canBuy={canBuy}
              totalPrice={totalPrice}
              onAddToCart={onAddToCart}
            />
          </section>
        </div>

        {/* Quick plant-care information */}
        {plantDetails ? <ProductCareTips details={plantDetails} /> : null}

        {/* Product description */}
        {product.description || product.short_description ? (
          <section
            className="px-4 py-4 sm:px-6 md:px-8"
            aria-labelledby="product-description"
          >
            <h2
              id="product-description"
              className="text-base font-bold leading-6 text-text-primary"
            >
              توضیحات
            </h2>

            <p className="mt-3 max-w-3xl whitespace-pre-line text-[13px] leading-6 text-text-secondary sm:text-sm sm:leading-7">
              {product.description || product.short_description}
            </p>
          </section>
        ) : null}

        {/* Product-specific details */}
        {plantDetails ? <PlantDetails details={plantDetails} /> : null}

        {cutFlowerDetails ? (
          <CutFlowerSpecifications details={cutFlowerDetails} />
        ) : null}

        {/* Product reviews */}
        <ProductReviews
          reviews={reviews}
          reviewCount={product.review_count}
          ratingAverage={product.rating_average}
          isLoading={areReviewsLoading}
          error={reviewsError}
        />

        {/*
          Remaining mobile sections:

          <RelatedProducts />
          <RelatedArticles />
          <Footer />
        */}
      </div>

      <ProductImageZoomDialog
        isOpen={isZoomOpen}
        image={activeImage}
        onClose={() => setIsZoomOpen(false)}
      />
    </main>
  );
}
