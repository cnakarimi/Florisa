"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";

import type { GalleryImage } from "./ProductGallery";

interface ProductImageZoomDialogProps {
  isOpen: boolean;
  image: GalleryImage;
  onClose: () => void;
}

export function ProductImageZoomDialog({
  isOpen,
  image,
  onClose,
}: ProductImageZoomDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-background-primary/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="نمایش بزرگ تصویر محصول"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-border-subtle bg-background-primary/60 text-text-inverse transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        aria-label="بستن تصویر"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div
        className="relative h-[82dvh] w-full max-w-5xl overflow-hidden rounded-[22px]"
        onClick={(event) => event.stopPropagation()}
      >
        <CatalogImage
          src={image.src}
          alt={image.alt}
          sizes="(max-width: 1055px) calc(100vw - 32px), 1024px"
          quality={80}
          className="object-contain"
        />
      </div>
    </div>
  );
}
