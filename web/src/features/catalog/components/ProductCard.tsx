"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type { CatalogProduct } from "@/features/catalog/types";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { formatTomanAmount, toPersianDigits } from "@/utils/persian";

interface ProductCardProps {
  product: CatalogProduct;
  imageSizes: string;
  originalPrice?: string | number | null;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

const ADDED_FEEDBACK_DURATION_MS = 1400;

export function ProductCard({
  product,
  imageSizes,
  originalPrice,
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
        ? `${product.sale_unit_display} ${toPersianDigits(
            product.unit_size,
          )} عددی`
        : product.sale_unit_display;

  const numericOriginalPrice =
    originalPrice === null || originalPrice === undefined
      ? null
      : Number(originalPrice);

  const numericCurrentPrice = Number(product.price);

  const hasDiscount =
    numericOriginalPrice !== null &&
    Number.isFinite(numericOriginalPrice) &&
    Number.isFinite(numericCurrentPrice) &&
    numericOriginalPrice > numericCurrentPrice;

  useEffect(() => {
    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, []);

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!isAvailable) {
      return;
    }

    onAddToCart(product);

    setIsAdded(true);

    if (animationTimer.current) {
      clearTimeout(animationTimer.current);
    }

    animationTimer.current = setTimeout(() => {
      setIsAdded(false);
    }, ADDED_FEEDBACK_DURATION_MS);
  };

  return (
    <article
      dir="rtl"
      className="
        group
        relative
        flex
        min-w-0
        flex-col
        overflow-hidden
        rounded-xl
        
        bg-background-secondary

        transition-[transform]
        duration-300
        ease-out

        lg:hover:-translate-y-1

        motion-reduce:transform-none
        motion-reduce:transition-none
      "
    >
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        aria-label={`مشاهده محصول ${product.name}`}
        className="
          relative
          block
          aspect-square
          w-full
          overflow-hidden
          bg-background-primary
          text-right

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-action-primary
        "
      >
        <CatalogImage
          src={getProductImageUrl(product.cover_image)}
          alt={product.name}
          sizes={imageSizes}
          quality={80}
          className="
            object-cover
            object-center
            transition-transform
            duration-500
            ease-out

            lg:group-hover:scale-[1.03]

            motion-reduce:transform-none
            motion-reduce:transition-none
          "
        />
      </button>

      <div
        className="
          flex
          min-h-[140px]
          flex-1
          flex-col
          px-3
          pb-3
          pt-3

          sm:px-4
          sm:pb-4
          sm:pt-4

          lg:min-h-[138px]
        "
      >
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="
            block
            w-full
            text-right

            focus-visible:outline-none
            focus-visible:text-text-brand
          "
        >
          <h3
            className="
              truncate
              text-base
              font-bold
              leading-6
              text-text-primary

              lg:text-lg
            "
          >
            {product.name}
          </h3>
        </button>

        <p
          className="
            mt-1
            truncate
            text-sm
            leading-6
            text-text-secondary
          "
        >
          {packageLabel}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex min-w-0 flex-col items-start gap-1">
            <span className="whitespace-nowrap text-sm font-bold text-text-primary sm:text-base">
              {formatTomanAmount(product.price)}

              <span className="mr-1 text-xs font-medium text-text-secondary">
                تومان
              </span>
            </span>

            {hasDiscount ? (
              <span
                className="
                  whitespace-nowrap
                  text-xs
                  text-text-tertiary
                  line-through
                  decoration-text-tertiary
                "
              >
                {formatTomanAmount(numericOriginalPrice)}

                <span className="mr-1 text-[10px]">تومان</span>
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            aria-label={
              isAvailable
                ? `افزودن ${product.name} به سبد خرید`
                : `${product.name} ناموجود است`
            }
            className={`
              inline-flex
              min-h-9
              shrink-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              px-3
              text-xs
              font-bold

              transition-[background-color,color,transform,opacity]
              duration-200

              active:scale-[0.98]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-action-primary
              focus-visible:ring-offset-2
              focus-visible:ring-offset-background-secondary

              sm:min-h-10
              sm:px-4

              ${
                !isAvailable
                  ? "cursor-not-allowed bg-background-tertiary text-text-disabled"
                  : isAdded
                    ? "bg-feedback-success text-background-primary"
                    : "bg-action-primary text-background-primary hover:opacity-90"
              }
            `}
          >
            {!isAvailable ? (
              <>
                <span className="text-white text-center">ناموجود</span>
              </>
            ) : isAdded ? (
              <>
                <Check className="size-4 shrink-0" aria-hidden="true" />
                <span>اضافه شد</span>
              </>
            ) : (
              <span>افزودن به سبد</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
