"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Flower2,
  Layers3,
  Leaf,
  Package,
  ShoppingBag,
  Tag,
} from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { getSaleUnitLabel } from "@/features/catalog/utils/product";
import { toPersianDigits } from "@/utils/persian";

import { ProductGallery, type GalleryImage } from "./ProductGallery";
import { ProductImageZoomDialog } from "./ProductImageZoomDialog";
import { ProductInfo } from "./ProductInfo";
import { ProductPurchasePanel } from "./ProductPurchasePanel";
import {
  CutFlowerSpecifications,
  PlantSpecifications,
} from "./ProductSpecifications";

interface ProductDetailViewProps {
  product: CatalogProductDetail;
  cartCount: number;
  isFavorite: boolean;
  onBack: () => void;
  onNavigateToCart: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct, quantity: number) => void;
}

export function ProductDetailView({
  product,
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

  const maximumQuantity = Math.max(minimumQuantity, product.stock_quantity);

  const canBuy =
    product.is_in_stock && product.stock_quantity >= minimumQuantity;

  const [quantity, setQuantity] = useState(minimumQuantity);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const activeImage = gallery[selectedImage] ?? gallery[0];

  const totalPrice = product.price * quantity;

  const isLowStock =
    canBuy && product.stock_quantity <= Math.max(minimumQuantity + 3, 5);

  const isPlantProduct = product.product_type === "plant";

  const salesUnit = getSaleUnitLabel(product);

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-background-primary text-right text-text-primary selection:bg-action-primary/30 selection:text-text-inverse"
    >
      <div className="mx-auto min-h-dvh w-full max-w-screen-lg bg-background-secondary pb-8 shadow-large md:pb-32">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border-subtle bg-background-secondary/90 px-4 backdrop-blur-xl sm:px-6 md:px-8">
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

        <div className="grid gap-7 px-4 pt-4 sm:px-6 sm:pt-6 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] md:items-start md:gap-8 md:px-8 md:pt-8">
          <ProductGallery
            gallery={gallery}
            selectedImage={selectedImage}
            isFeatured={product.is_featured}
            isLowStock={isLowStock}
            onSelectImage={setSelectedImage}
            onOpenZoom={() => setIsZoomOpen(true)}
          />

          <section className="min-w-0 md:pt-2">
            <ProductInfo
              product={product}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
            />

            <ProductPurchasePanel
              product={product}
              quantity={quantity}
              minimumQuantity={minimumQuantity}
              maximumQuantity={maximumQuantity}
              canBuy={canBuy}
              salesUnit={salesUnit}
              totalPrice={totalPrice}
              onQuantityChange={setQuantity}
              onAddToCart={onAddToCart}
            />
          </section>
        </div>

        <section
          className="mt-8 px-4 sm:px-6 md:px-8"
          aria-labelledby="product-specifications"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="product-specifications"
              className="text-sm font-extrabold text-text-primary sm:text-base"
            >
              مشخصات محصول
            </h2>

            <span className="mr-4 h-px flex-1 bg-border-subtle" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailStat
              icon={
                isPlantProduct ? (
                  <Leaf className="size-[18px]" aria-hidden="true" />
                ) : (
                  <Flower2 className="size-[18px]" aria-hidden="true" />
                )
              }
              label="تعداد در هر واحد فروش"
              value={`${toPersianDigits(product.unit_size)} ${
                product.product_type === "cut_flower" ? "شاخه" : "عدد"
              }`}
            />

            <DetailStat
              icon={<Package className="size-[18px]" aria-hidden="true" />}
              label="موجودی"
              value={
                canBuy
                  ? `${toPersianDigits(product.stock_quantity)} ${salesUnit}`
                  : "ناموجود"
              }
            />

            <DetailStat
              icon={<Layers3 className="size-[18px]" aria-hidden="true" />}
              label="حداقل سفارش"
              value={`${toPersianDigits(minimumQuantity)} ${salesUnit}`}
            />

            <DetailStat
              icon={<Tag className="size-[18px]" aria-hidden="true" />}
              label="دسته‌بندی"
              value={product.category.name}
            />
          </div>
        </section>

        {product.product_type === "plant" && product.details ? (
          <PlantSpecifications details={product.details} />
        ) : product.product_type === "cut_flower" && product.details ? (
          <CutFlowerSpecifications details={product.details} />
        ) : null}

        {product.description || product.short_description ? (
          <section
            className="mx-4 mt-9 border-t border-border-subtle pt-7 sm:mx-6 md:mx-8 md:mt-11"
            aria-labelledby="product-description"
          >
            <h2
              id="product-description"
              className="text-base font-extrabold text-text-primary sm:text-lg"
            >
              درباره این محصول
            </h2>

            <p className="mt-3 max-w-3xl whitespace-pre-line text-[13px] leading-7 text-text-secondary sm:text-sm sm:leading-8">
              {product.description || product.short_description}
            </p>
          </section>
        ) : null}
      </div>

      <ProductImageZoomDialog
        isOpen={isZoomOpen}
        image={activeImage}
        onClose={() => setIsZoomOpen(false)}
      />
    </main>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted p-3.5 sm:p-4">
      <span className="mb-3 grid size-8 place-items-center rounded-xl bg-background-primary text-text-brand">
        {icon}
      </span>

      <p className="text-[9px] text-text-secondary sm:text-[10px]">{label}</p>

      <p className="mt-1.5 text-[11px] font-bold leading-5 text-text-primary sm:text-xs">
        {value}
      </p>

      <span
        aria-hidden="true"
        className="absolute bottom-0 right-4 h-px w-8 bg-action-primary/50"
      />
    </div>
  );
}
