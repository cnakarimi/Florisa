"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Flower2,
  Heart,
  Layers3,
  Maximize2,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { formatToman, toPersianDigits } from "@/features/home/utils/persian";
import { CatalogImage } from "./CatalogImage";

interface ProductDetailViewProps {
  product: CatalogProductDetail;
  cartCount: number;
  isFavorite: boolean;
  onBack: () => void;
  onOpenCart: () => void;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct, quantity: number) => void;
}

interface GalleryImage {
  key: string;
  src: string | null;
  alt: string;
}

export function ProductDetailView({
  product,
  cartCount,
  isFavorite,
  onBack,
  onOpenCart,
  onToggleFavorite,
  onAddToCart,
}: ProductDetailViewProps) {
  const gallery = useMemo<GalleryImage[]>(() => {
    const seen = new Set<string>();
    const images: GalleryImage[] = [];

    if (product.cover_image) {
      seen.add(product.cover_image);
      images.push({
        key: "cover",
        src: product.cover_image,
        alt: product.name,
      });
    }

    for (const image of product.images) {
      if (seen.has(image.image)) {
        continue;
      }
      seen.add(image.image);
      images.push({
        key: String(image.id),
        src: image.image,
        alt: image.alt_text || product.name,
      });
    }

    if (images.length === 0) {
      images.push({ key: "fallback", src: null, alt: product.name });
    }

    return images;
  }, [product]);

  const minimumQuantity = Math.max(1, product.minimum_order_bundles);
  const maximumQuantity = Math.max(minimumQuantity, product.stock_bundles);
  const [quantity, setQuantity] = useState(minimumQuantity);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const activeImage = gallery[selectedImage] ?? gallery[0];
  const canBuy = product.is_in_stock && product.stock_bundles >= minimumQuantity;

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.short_description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("اشتراک‌گذاری شد");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("لینک کپی شد");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setShareStatus("اشتراک‌گذاری انجام نشد");
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0d0e12] px-4 pb-28 pt-5 text-right text-white sm:px-6"
    >
      <div className="mx-auto w-full max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#191b23] text-zinc-200 transition hover:border-emerald-400/40 hover:text-white"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-[10px] tracking-[0.2em] text-emerald-400">
              FLORISA
            </p>
            <p className="mt-1 text-xs font-semibold text-zinc-300">
              جزئیات محصول
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#191b23] text-zinc-200 transition hover:border-amber-400/40 hover:text-white"
            aria-label="مشاهده سبد خرید"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-black">
                {toPersianDigits(cartCount)}
              </span>
            ) : null}
          </button>
        </header>

        <section className="relative h-[360px] overflow-hidden rounded-[2rem] border border-white/5 bg-[#171921] shadow-2xl sm:h-[400px]">
          <CatalogImage
            src={activeImage.src}
            alt={activeImage.alt}
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover object-center transition duration-500"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/70"
            aria-label="نمایش تصویر بزرگ"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {product.is_featured ? (
            <span className="absolute right-4 top-4 rounded-full border border-amber-300/30 bg-amber-400/90 px-3 py-1 text-[10px] font-extrabold text-black">
              انتخاب ویژه
            </span>
          ) : null}

          {gallery.length > 1 ? (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-md">
              {gallery.map((image, index) => (
                <button
                  key={image.key}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === selectedImage
                      ? "w-6 bg-amber-400"
                      : "w-2 bg-white/45 hover:bg-white/70"
                  }`}
                  aria-label={`تصویر ${toPersianDigits(index + 1)}`}
                  aria-current={index === selectedImage}
                />
              ))}
            </div>
          ) : null}
        </section>

        {gallery.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((image, index) => (
              <button
                key={image.key}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-[#171921] transition ${
                  index === selectedImage
                    ? "border-amber-400"
                    : "border-white/10 opacity-65 hover:opacity-100"
                }`}
                aria-label={`انتخاب تصویر ${toPersianDigits(index + 1)}`}
              >
                <CatalogImage
                  src={image.src}
                  alt={image.alt}
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        ) : null}

        <section className="pt-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-medium text-emerald-400">
                {product.category.name}
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {product.short_description}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#191b23] text-zinc-300 transition hover:text-white"
                aria-label="اشتراک‌گذاری محصول"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(product)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? "border-rose-400/40 bg-rose-500/10 text-rose-400"
                    : "border-white/10 bg-[#191b23] text-zinc-300 hover:text-rose-400"
                }`}
                aria-label={
                  isFavorite
                    ? "حذف از علاقه‌مندی‌ها"
                    : "افزودن به علاقه‌مندی‌ها"
                }
                aria-pressed={isFavorite}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </div>

          {shareStatus ? (
            <p className="mt-3 text-[11px] text-emerald-400" role="status">
              {shareStatus}
            </p>
          ) : null}

          <div className="mt-7 rounded-2xl border border-white/5 bg-[#171921] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-500">مشخصات گل:</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                {product.flower_type}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                {product.color}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
              <div>
                <p className="text-xs font-bold text-white">تعداد دسته</p>
                <p className="mt-1 text-[10px] text-zinc-500">
                  حداقل سفارش {toPersianDigits(minimumQuantity)} دسته
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101117] p-1">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(minimumQuantity, current - 1),
                    )
                  }
                  disabled={!canBuy || quantity <= minimumQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="کاهش تعداد"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-black">
                  {toPersianDigits(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(maximumQuantity, current + 1),
                    )
                  }
                  disabled={!canBuy || quantity >= maximumQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="افزایش تعداد"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <DetailStat
              icon={<Flower2 className="h-5 w-5" />}
              label="شاخه در هر دسته"
              value={toPersianDigits(product.stems_per_bundle)}
            />
            <DetailStat
              icon={<Package className="h-5 w-5" />}
              label="موجودی"
              value={
                product.is_in_stock
                  ? `${toPersianDigits(product.stock_bundles)} دسته`
                  : "ناموجود"
              }
            />
            <DetailStat
              icon={<Layers3 className="h-5 w-5" />}
              label="حداقل سفارش"
              value={`${toPersianDigits(product.minimum_order_bundles)} دسته`}
            />
            <DetailStat
              icon={<Tag className="h-5 w-5" />}
              label="دسته‌بندی"
              value={product.category.name}
            />
          </div>

          <section className="mt-8 border-t border-white/5 pt-7">
            <h2 className="text-base font-extrabold">درباره این محصول</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-400">
              {product.description || product.short_description}
            </p>
          </section>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0d0e12]/95 p-4 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-md items-center gap-4">
            <div className="min-w-28">
              <p className="text-[10px] text-zinc-500">قیمت هر دسته</p>
              <p className="mt-1 text-sm font-black text-amber-400">
                {formatToman(product.price_per_bundle)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddToCart(product, quantity)}
              disabled={!canBuy}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#ebc351] px-4 text-sm font-extrabold text-black shadow-xl shadow-amber-500/10 transition hover:bg-[#dfb43b] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {canBuy ? (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  افزودن به سبد خرید
                </>
              ) : (
                "ناموجود"
              )}
            </button>
          </div>
        </div>
      </div>

      {isZoomOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="نمایش بزرگ تصویر محصول"
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white"
            aria-label="بستن تصویر"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl">
            <CatalogImage
              src={activeImage.src}
              alt={activeImage.alt}
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#171921] p-4">
      <div className="mb-3 text-emerald-400">{icon}</div>
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-zinc-200">{value}</p>
    </div>
  );
}
