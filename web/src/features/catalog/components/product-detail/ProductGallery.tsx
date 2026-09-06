"use client";

import { Maximize2, Sparkles } from "lucide-react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { toPersianDigits } from "@/utils/persian";

export interface GalleryImage {
  key: string;
  src: string | null;
  alt: string;
}

interface ProductGalleryProps {
  gallery: GalleryImage[];
  selectedImage: number;
  isFeatured: boolean;
  isLowStock: boolean;
  onSelectImage: (index: number) => void;
  onOpenZoom: () => void;
}

export function ProductGallery({
  gallery,
  selectedImage,
  isFeatured,
  isLowStock,
  onSelectImage,
  onOpenZoom,
}: ProductGalleryProps) {
  const activeImage = gallery[selectedImage] ?? gallery[0];

  return (
    <section aria-label="گالری تصاویر محصول" className="min-w-0">
      <div className="relative aspect-[4/4.35] overflow-hidden rounded-[26px] border border-border-subtle bg-background-primary shadow-large sm:aspect-[4/3.5] md:aspect-square">
        <CatalogImage
          src={activeImage.src}
          alt={activeImage.alt}
          sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(100vw - 48px), (max-width: 791px) calc(100vw - 416px), (max-width: 1023px) calc(54vw - 52px), 501px"
          quality={80}
          className="object-cover object-center transition-transform duration-500"
          priority
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between sm:inset-x-4 sm:top-4">
          <div className="flex flex-wrap gap-2">
            {isFeatured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-action-primary/25 bg-action-primary/90 px-2.5 py-1.5 text-[9px] font-black text-text-inverse shadow-large backdrop-blur-md sm:text-[10px]">
                <Sparkles className="size-3" aria-hidden="true" />
                انتخاب ویژه
              </span>
            ) : null}

            {isLowStock ? (
              <span className="rounded-full border border-orange-300/20 bg-background-primary/45 px-2.5 py-1.5 text-[9px] font-bold text-orange-200 backdrop-blur-md sm:text-[10px]">
                موجودی محدود
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onOpenZoom}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border-subtle bg-background-primary/60 text-text-inverse shadow-large backdrop-blur-md transition-colors hover:bg-background-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="نمایش تصویر در اندازه بزرگ"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
          {gallery.length > 1 ? (
            <div className="flex gap-1.5 rounded-full border border-border-subtle bg-background-primary/45 px-2.5 py-2 backdrop-blur-md">
              {gallery.map((image, index) => (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => onSelectImage(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === selectedImage
                      ? "w-5 bg-action-primary"
                      : "w-1.5 bg-white/45 hover:bg-white/75"
                  }`}
                  aria-label={`نمایش تصویر ${toPersianDigits(index + 1)}`}
                  aria-current={index === selectedImage}
                />
              ))}
            </div>
          ) : (
            <span />
          )}

          <span className="rounded-full border border-border-subtle bg-background-primary/45 px-2.5 py-1.5 text-[9px] font-semibold text-text-inverse-muted backdrop-blur-md">
            {toPersianDigits(selectedImage + 1)} /{" "}
            {toPersianDigits(gallery.length)}
          </span>
        </div>
      </div>

      {gallery.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {gallery.map((image, index) => {
            const isSelected = index === selectedImage;

            return (
              <button
                key={image.key}
                type="button"
                onClick={() => onSelectImage(index)}
                className={`relative size-16 shrink-0 overflow-hidden rounded-xl border bg-surface-muted transition sm:size-[72px] ${
                  isSelected
                    ? "border-action-primary opacity-100 ring-2 ring-action-primary/10"
                    : "border-border-subtle opacity-55 hover:opacity-90"
                }`}
                aria-label={`انتخاب تصویر ${toPersianDigits(index + 1)}`}
                aria-current={isSelected}
              >
                <CatalogImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(max-width: 639px) 64px, 72px"
                  quality={70}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
