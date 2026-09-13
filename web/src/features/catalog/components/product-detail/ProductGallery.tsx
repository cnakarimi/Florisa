"use client";

import { ArrowRight, Maximize2, ShoppingBag } from "lucide-react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { toPersianDigits } from "@/utils/persian";
import { BackIcon } from "@/components/icons/BackIcon";
import { CartIcon } from "@/components/icons";
import { ExpandIcon } from "@/components/icons/ExpandIcon";

export interface GalleryImage {
  key: string;
  src: string | null;
  alt: string;
}

interface ProductGalleryProps {
  gallery: GalleryImage[];
  selectedImage: number;
  cartCount: number;
  onBack: () => void;
  onNavigateToCart: () => void;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
}

export function ProductGallery({
  gallery,
  selectedImage,
  cartCount,
  onBack,
  onNavigateToCart,
  onSelectImage,
  onOpenZoom,
}: ProductGalleryProps) {
  const activeImage = gallery[selectedImage] ?? gallery[0];

  return (
    <section aria-label="گالری تصاویر محصول" className="min-w-0">
      <div className="relative aspect-square w-full overflow-hidden bg-background-primary">
        <CatalogImage
          src={activeImage.src}
          alt={activeImage.alt}
          sizes="(max-width: 767px) 100vw, 501px"
          quality={80}
          className="object-cover object-center"
          priority
        />

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center transition-colors"
          aria-label="بازگشت"
        >
          <BackIcon className="" aria-hidden="true" />
        </button>

        {/* Basket */}
        <button
          type="button"
          onClick={onNavigateToCart}
          className="absolute left-4 top-4 z-10 grid size-10 place-items-center"
          aria-label="مشاهده سبد خرید"
        >
          <CartIcon className="" aria-hidden="true" />

          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-action-primary text-[9px] font-bold leading-none text-text-inverse">
              {toPersianDigits(cartCount)}
            </span>
          ) : null}
        </button>

        {/* Pagination */}
        {gallery.length > 1 ? (
          <div
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1"
            aria-label="انتخاب تصویر محصول"
          >
            {gallery.map((image, index) => {
              const isActive = index === selectedImage;

              return (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => onSelectImage(index)}
                  className={
                    isActive
                      ? "h-[5px] w-[14px] rounded-full bg-action-primary transition-all"
                      : "size-[5px] rounded-full bg-white/50 transition-all hover:bg-white/80"
                  }
                  aria-label={`نمایش تصویر ${toPersianDigits(index + 1)}`}
                  aria-current={isActive ? "true" : undefined}
                />
              );
            })}
          </div>
        ) : null}

        {/* Expand */}
        <button
          type="button"
          onClick={onOpenZoom}
          className="absolute bottom-4 right-4 z-10 grid size-10 place-items-center"
          aria-label="نمایش تصویر در اندازه بزرگ"
        >
          <ExpandIcon aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
