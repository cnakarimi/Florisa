"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check, Heart, PackageX } from "lucide-react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type { CatalogProduct } from "@/features/catalog/types";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { formatTomanAmount, toPersianDigits } from "../utils/persian";

interface ProductCardProps {
  product: CatalogProduct;
  imageSizes: string;
  isFavorite: boolean;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

export function ProductCard({
  product,
  imageSizes,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAvailable =
    product.is_in_stock &&
    product.stock_quantity >= product.minimum_order_quantity;

  const potMaterial =
    product.product_type === "plant"
      ? (product.details?.pot_material ?? "")
      : "";

  const packageLabel =
    product.product_type === "plant"
      ? `گلدان ${potMaterial}`.trim()
      : product.unit_size > 1
        ? `${product.sale_unit_display} ${toPersianDigits(product.unit_size)} عددی`
        : product.sale_unit_display;

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, []);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!isAvailable) return;

    onAddToCart(product);
    setIsAdded(true);

    if (animationTimer.current) {
      clearTimeout(animationTimer.current);
    }

    animationTimer.current = setTimeout(() => {
      setIsAdded(false);
    }, 1400);
  };

  const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite(product);
  };

  return (
    <article
      dir="rtl"
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] bg-[#181a18] transition duration-300 hover:-translate-y-1"
    >
      {/* تصویر محصول */}
      <div className="relative  pb-0">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="relative block aspect-square w-full overflow-hidden rounded-t-[17px] bg-[#0e110f] text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
          aria-label={`مشاهده محصول ${product.name}`}
        >
          <CatalogImage
            src={getProductImageUrl(product.cover_image)}
            alt={product.name}
            sizes={imageSizes}
            quality={75}
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.055]"
          />

          <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
        </button>

        {/* علاقه‌مندی */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `حذف ${product.name} از علاقه‌مندی‌ها`
              : `افزودن ${product.name} به علاقه‌مندی‌ها`
          }
          className={`absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border shadow-lg backdrop-blur-md transition duration-200 active:scale-90 sm:h-9 sm:w-9 ${
            isFavorite
              ? "border-rose-300/30 bg-rose-500/20 text-rose-300"
              : "border-white/15 bg-black/35 text-white/85 hover:bg-black/55"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              isFavorite ? "scale-105 fill-current" : ""
            }`}
          />
        </button>
      </div>

      {/* اطلاعات و خرید */}
      <div className="flex flex-1 flex-col gap-y-3 px-3 pb-6 pt-3 sm:px-3.5">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="block w-full text-right focus-visible:outline-none"
        >
          <h3 className="truncate text-[16px] font-bold leading-6 text-text-primary sm:text-sm">
            {product.name}
          </h3>
        </button>

        {/* قیمت در یک ردیف مستقل */}
        <div className="mb-3 flex min-w-0 items-end justify-between gap-2">
          <div className="flex items-center justify-between w-full">
            <span className=" block text-[12px] font-bold text-border-subtle sm:text-[10px]">
              {packageLabel}
            </span>

            <span className="mt-1 block text-[8px] text-white/35 sm:text-[9px]"></span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="block whitespace-nowrap text-[15px] tracking-tight text-text-primary font-bold">
            {formatTomanAmount(product.price)}
            <span className="mr-1 text-[10px] font-medium">تومان</span>
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            aria-label={
              isAvailable
                ? `افزودن ${product.name} به سبد خرید`
                : `${product.name} ناموجود است`
            }
            className={`mt-auto inline-flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-[12px] text-[12px] font-bold transition-all duration-300 active:scale-[0.98] sm:h-11 px-4 ${
              !isAvailable
                ? "cursor-not-allowed bg-white/[0.04] text-white/30"
                : isAdded
                  ? "border-[#e2c86f]/25 bg-[#d3b555] text-[#171811] shadow-[0_8px_20px_rgba(199,162,60,0.16)]"
                  : "border-[#41604e]/25 bg-text-accent text-background-secondary hover:bg-[#2b4c3a]"
            }`}
          >
            {!isAvailable ? (
              <>
                <PackageX className="h-3.5 w-3.5 shrink-0" />
                <span>ناموجود</span>
              </>
            ) : isAdded ? (
              <>
                <Check className="h-4 w-4 shrink-0" />
                <span>به سبد اضافه شد</span>
              </>
            ) : (
              <>
                <span>افزودن به سبد</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
