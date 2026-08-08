"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Flower2,
  Heart,
  Layers3,
  Leaf,
  Maximize2,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import {
  getPriceUnitLabel,
  getProductColor,
  getProductIdentity,
  getSaleUnitLabel,
} from "@/features/catalog/utils/product";
import { formatToman, toPersianDigits } from "@/features/home/utils/persian";

import { CatalogImage } from "./CatalogImage";
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
      images.push({ key: "fallback", src: null, alt: product.name });
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
  const [shareStatus, setShareStatus] = useState("");
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeImage = gallery[selectedImage] ?? gallery[0];
  const totalPrice = product.price * quantity;
  const isLowStock =
    canBuy && product.stock_quantity <= Math.max(minimumQuantity + 3, 5);
  const isPlantProduct = product.product_type === "plant";
  const salesUnit = getSaleUnitLabel(product);
  const productIdentity = getProductIdentity(product);
  const productColor = getProductColor(product);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isZoomOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isZoomOpen]);

  const showShareStatus = (message: string) => {
    setShareStatus(message);

    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current);
    }

    shareTimerRef.current = setTimeout(() => {
      setShareStatus("");
    }, 2400);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.short_description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showShareStatus("اشتراک‌گذاری شد");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showShareStatus("لینک محصول کپی شد");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showShareStatus("اشتراک‌گذاری انجام نشد");
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-black text-right text-[#efede8] selection:bg-[#c7a23c]/30 selection:text-white"
    >
      <div className="mx-auto min-h-dvh w-full max-w-screen-lg bg-[#111211] pb-8 shadow-2xl shadow-black md:pb-32">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-white/[0.05] bg-[#111211]/90 px-4 backdrop-blur-xl sm:px-6 md:px-8">
          <button
            type="button"
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[#191b19] text-white/75 transition hover:border-[#c7a23c]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
            aria-label="بازگشت"
          >
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>

          <div className="text-center">
            <p className="text-[9px] font-black tracking-[0.24em] text-[#c7a23c]">
              FLORISA
            </p>
            <p className="mt-1 text-[11px] font-semibold text-white/55">
              جزئیات محصول
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToCart}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[#191b19] text-white/75 transition hover:border-[#c7a23c]/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
            aria-label="مشاهده سبد خرید"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />

            {cartCount > 0 ? (
              <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#c7a23c] px-1 text-[9px] font-black text-[#15160f] ring-2 ring-[#111211]">
                {toPersianDigits(cartCount)}
              </span>
            ) : null}
          </button>
        </header>

        <div className="grid gap-7 px-4 pt-4 sm:px-6 sm:pt-6 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] md:items-start md:gap-8 md:px-8 md:pt-8">
          <section aria-label="گالری تصاویر محصول" className="min-w-0">
            <div className="relative aspect-[4/4.35] overflow-hidden rounded-[26px] border border-white/[0.06] bg-[#0d100e] shadow-[0_22px_55px_rgba(0,0,0,0.3)] sm:aspect-[4/3.5] md:aspect-square">
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
                  {product.is_featured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2c76d]/25 bg-[#c7a23c]/90 px-2.5 py-1.5 text-[9px] font-black text-[#19180f] shadow-lg backdrop-blur-md sm:text-[10px]">
                      <Sparkles className="h-3 w-3" />
                      انتخاب ویژه
                    </span>
                  ) : null}

                  {isLowStock ? (
                    <span className="rounded-full border border-orange-300/20 bg-black/45 px-2.5 py-1.5 text-[9px] font-bold text-orange-200 backdrop-blur-md sm:text-[10px]">
                      موجودی محدود
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-black/40 text-white/90 shadow-lg backdrop-blur-md transition hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label="نمایش تصویر در اندازه بزرگ"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
                {gallery.length > 1 ? (
                  <div className="flex gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-2 backdrop-blur-md">
                    {gallery.map((image, index) => (
                      <button
                        key={image.key}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === selectedImage
                            ? "w-5 bg-[#d6b64d]"
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

                <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1.5 text-[9px] font-semibold text-white/65 backdrop-blur-md">
                  {toPersianDigits(selectedImage + 1)} /{" "}
                  {toPersianDigits(gallery.length)}
                </span>
              </div>
            </div>

            {gallery.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((image, index) => (
                  <button
                    key={image.key}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-[#161816] transition sm:h-[72px] sm:w-[72px] ${
                      index === selectedImage
                        ? "border-[#c7a23c] opacity-100 ring-2 ring-[#c7a23c]/10"
                        : "border-white/[0.07] opacity-55 hover:opacity-90"
                    }`}
                    aria-label={`انتخاب تصویر ${toPersianDigits(index + 1)}`}
                  >
                    <CatalogImage
                      src={image.src}
                      alt={image.alt}
                      sizes="(max-width: 639px) 64px, 72px"
                      quality={70}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="min-w-0 md:pt-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#9fc0aa] sm:text-xs">
                  {product.category.name}
                </p>
                <h1 className="mt-2 text-[26px] font-black leading-[1.45] tracking-tight text-[#f1eee8] sm:text-3xl md:text-[32px]">
                  {product.name}
                </h1>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[#191b19] text-white/60 transition hover:border-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
                  aria-label="اشتراک‌گذاری محصول"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(product)}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c] ${
                    isFavorite
                      ? "border-rose-300/25 bg-rose-500/15 text-rose-300"
                      : "border-white/[0.08] bg-[#191b19] text-white/60 hover:border-rose-300/20 hover:text-rose-300"
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
              <p
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#203329] px-2.5 py-1 text-[10px] font-medium text-[#acd0b6]"
                role="status"
                aria-live="polite"
              >
                <Check className="h-3 w-3" />
                {shareStatus}
              </p>
            ) : null}

            {product.short_description ? (
              <p className="mt-4 text-[13px] leading-7 text-white/48 sm:text-sm">
                {product.short_description}
              </p>
            ) : null}

            {productIdentity || productColor ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {productIdentity ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9fc0aa]/15 bg-[#203329]/70 px-3 py-1.5 text-[10px] font-semibold text-[#afd0b8] sm:text-[11px]">
                    <Leaf className="h-3.5 w-3.5" />
                    {productIdentity}
                  </span>
                ) : null}

                {productColor ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold text-white/60 sm:text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-[#d9d5c9] ring-2 ring-white/10" />
                    {productColor}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-7 overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#181a18] shadow-[0_16px_45px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div>
                  <p className="text-[10px] text-white/35">
                    قیمت هر واحد فروش
                  </p>
                  <p className="mt-1.5 text-lg font-black text-[#ddc362] sm:text-xl">
                    {formatToman(product.price)}
                  </p>
                  <p className="mt-1 text-[9px] text-white/35">
                    {getPriceUnitLabel(product)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                    canBuy
                      ? "bg-emerald-400/[0.08] text-[#9fc0aa]"
                      : "bg-rose-400/[0.08] text-rose-300"
                  }`}
                >
                  {canBuy ? "آماده سفارش" : "ناموجود"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/[0.05] px-4 py-3.5 sm:px-5">
                <div>
                  <p className="text-xs font-bold text-white/85">
                    تعداد {salesUnit}
                  </p>
                  <p className="mt-1 text-[9px] text-white/35 sm:text-[10px]">
                    حداقل سفارش {toPersianDigits(minimumQuantity)} {salesUnit}
                  </p>
                </div>

                <div className="flex items-center rounded-xl border border-white/[0.07] bg-[#101210] p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(minimumQuantity, current - 1),
                      )
                    }
                    disabled={!canBuy || quantity <= minimumQuantity}
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="min-w-10 text-center text-sm font-black text-white">
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
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          className="mt-8 px-4 sm:px-6 md:px-8"
          aria-labelledby="product-specifications"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="product-specifications"
              className="text-sm font-extrabold text-[#e8e5df] sm:text-base"
            >
              مشخصات محصول
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-white/[0.07] to-transparent mr-4" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailStat
               icon={
                 isPlantProduct ? (
                   <Leaf className="h-[18px] w-[18px]" />
                 ) : (
                   <Flower2 className="h-[18px] w-[18px]" />
                 )
               }
               label="تعداد در هر واحد فروش"
               value={`${toPersianDigits(product.unit_size)} ${
                 product.product_type === "cut_flower" ? "شاخه" : "عدد"
               }`}
            />
            <DetailStat
              icon={<Package className="h-[18px] w-[18px]" />}
              label="موجودی"
              value={
                canBuy
                   ? `${toPersianDigits(product.stock_quantity)} ${salesUnit}`
                  : "ناموجود"
              }
            />
            <DetailStat
              icon={<Layers3 className="h-[18px] w-[18px]" />}
              label="حداقل سفارش"
               value={`${toPersianDigits(minimumQuantity)} ${salesUnit}`}
            />
            <DetailStat
              icon={<Tag className="h-[18px] w-[18px]" />}
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
            className="mx-4 mt-9 border-t border-white/[0.06] pt-7 sm:mx-6 md:mx-8 md:mt-11"
            aria-labelledby="product-description"
          >
            <h2
              id="product-description"
              className="text-base font-extrabold text-[#e8e5df] sm:text-lg"
            >
              درباره این محصول
            </h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-[13px] leading-7 text-white/45 sm:text-sm sm:leading-8">
              {product.description || product.short_description}
            </p>
          </section>
        ) : null}

        <div
          data-footer-overlay="product-actions"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-screen-lg border-t border-white/[0.07] bg-[#111211]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-6 md:px-8"
        >
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="min-w-0 shrink-0">
              <p className="text-[9px] text-white/35 sm:text-[10px]">
                جمع {toPersianDigits(quantity)} {salesUnit}
              </p>
              <p className="mt-1 whitespace-nowrap text-sm font-black text-[#ddc362] sm:text-base">
                {formatToman(totalPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddToCart(product, quantity)}
              disabled={!canBuy}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#c7a23c] px-3 text-xs font-black text-[#17170f] shadow-[0_10px_28px_rgba(199,162,60,0.16)] transition hover:bg-[#d6b54c] active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none sm:min-h-14 sm:text-sm"
            >
              {canBuy ? (
                <>
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  افزودن به سبد خرید
                </>
              ) : (
                "در حال حاضر ناموجود"
              )}
            </button>
          </div>
        </div>
      </div>

      {isZoomOpen ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="نمایش بزرگ تصویر محصول"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="بستن تصویر"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative h-[82dvh] w-full max-w-5xl overflow-hidden rounded-[22px]"
            onClick={(event) => event.stopPropagation()}
          >
            <CatalogImage
              src={activeImage.src}
              alt={activeImage.alt}
              sizes="(max-width: 1055px) calc(100vw - 32px), 1024px"
              quality={80}
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
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.055] bg-[#181a18] p-3.5 sm:p-4">
      <span className="mb-3 grid h-8 w-8 place-items-center rounded-xl bg-[#203329] text-[#9fc0aa]">
        {icon}
      </span>
      <p className="text-[9px] text-white/32 sm:text-[10px]">{label}</p>
      <p className="mt-1.5 text-[11px] font-bold leading-5 text-white/75 sm:text-xs">
        {value}
      </p>
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-4 h-px w-8 bg-[#c7a23c]/50"
      />
    </div>
  );
}
