"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductDesignIcon } from "./PlantMobileSections";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { toPersianDigits } from "@/utils/persian";
import { BackIcon } from "@/components/icons/BackIcon";
import { CartIcon } from "@/components/icons";
import { ExpandIcon } from "@/components/icons/ExpandIcon";

export interface GalleryImage {
  key: string;
  src: string | null;
  alt: string;
  isConfiguration?: boolean;
}

interface ProductGalleryProps {
  gallery: GalleryImage[];
  selectedImage: number;
  cartCount: number;
  onBack: () => void;
  onNavigateToCart: () => void;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
  mobilePlant?: boolean;
  caption?: string;
}

export function ProductGallery({
  gallery,
  selectedImage,
  cartCount,
  onBack,
  onNavigateToCart,
  onSelectImage,
  onOpenZoom,
  mobilePlant = false,
  caption,
}: ProductGalleryProps) {
  const touchStart = useRef<number | null>(null);
  const activeImage = gallery[selectedImage] ?? gallery[0];

  return (
    <section aria-label="گالری تصاویر محصول" className="min-w-0">
      <div className="relative aspect-square w-full overflow-hidden bg-background-primary"
        tabIndex={mobilePlant && gallery.length > 1 ? 0 : undefined}
        onKeyDown={event => { if (!mobilePlant || gallery.length < 2) return; if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); onSelectImage((selectedImage + (event.key === "ArrowLeft" ? 1 : -1) + gallery.length) % gallery.length); } }}
        onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={event => { if (!mobilePlant || touchStart.current === null || gallery.length < 2) return; const distance = event.changedTouches[0].clientX - touchStart.current; touchStart.current = null; if (Math.abs(distance) > 40) onSelectImage((selectedImage + (distance > 0 ? 1 : -1) + gallery.length) % gallery.length); }}>
        <CatalogImage
          src={activeImage.src}
          alt={activeImage.alt}
          sizes="(max-width: 767px) 100vw, 501px"
          quality={80}
          className="object-cover object-center"
          priority
        />

        {mobilePlant && <div dir="ltr" className="absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between">
          <div className="flex w-[88px] items-center gap-2">
            <button type="button" onClick={onNavigateToCart} aria-label="مشاهده سبد خرید" className="relative grid size-10 shrink-0 place-items-center focus-visible:outline-2 focus-visible:outline-action-primary">
              <ProductDesignIcon name="cart" />{cartCount > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-action-primary text-xs font-medium text-background-primary">{toPersianDigits(cartCount)}</span>}
            </button>
            <Link href="/shop" aria-label="جست‌وجوی محصولات" className="grid size-10 shrink-0 place-items-center focus-visible:outline-2 focus-visible:outline-action-primary"><ProductDesignIcon name="search" /></Link>
          </div>
          <Link href="/" aria-label="فلوریسا"><Image src="/images/product-detail/logo.svg" width={73} height={28} alt="فلوریسا" /></Link>
          <div className="flex w-[88px] justify-end"><button type="button" onClick={onBack} aria-label="بازگشت" className="grid size-10 place-items-center focus-visible:outline-2 focus-visible:outline-action-primary"><ProductDesignIcon name="back" /></button></div>
        </div>}
        {/* Back */}
        {!mobilePlant && <>
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
            <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-text-brand text-[9px] font-bold leading-none text-black">
              {toPersianDigits(cartCount)}
            </span>
          ) : null}
        </button>

        </>}
        {/* Pagination */}
        {gallery.length > 1 ? (
          <div
            className={`absolute left-1/2 z-10 flex -translate-x-1/2 items-center ${mobilePlant ? "bottom-0" : "bottom-4 gap-1"}`}
            aria-label="انتخاب تصویر محصول"
          >
            {gallery.map((image, index) => {
              const isActive = index === selectedImage;

              return (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => onSelectImage(index)}
                  className={mobilePlant ? `grid h-7 place-items-center focus-visible:outline-2 focus-visible:outline-action-primary ${isActive ? "w-[18px]" : "w-[9px]"}` :
                    isActive
                      ? "h-[5px] w-[14px] rounded-full bg-action-primary transition-all"
                      : "size-[5px] rounded-full bg-white/50 transition-all hover:bg-white/80"
                  }
                  aria-label={`نمایش تصویر ${toPersianDigits(index + 1)}`}
                  aria-current={isActive ? "true" : undefined}
                >{mobilePlant && <span className={`block h-[5px] rounded-full ${isActive ? "w-[14px] bg-action-primary" : "w-[5px] bg-text-tertiary"}`} />}</button>
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
          {mobilePlant ? <ProductDesignIcon name="expand" /> : <ExpandIcon aria-hidden="true" />}
        </button>
      </div>
      {caption && <p className="px-4 py-2 text-xs leading-6 text-text-secondary">{caption}</p>}
    </section>
  );
}
