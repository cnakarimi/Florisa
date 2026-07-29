import { useState } from "react";
import {
  Check,
  Flower2,
  Heart,
  Layers3,
  Package,
  Palette,
  ShoppingBag,
  X,
} from "lucide-react";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type {
  CatalogProduct,
  CatalogProductDetail,
} from "@/features/catalog/types";
import { formatToman, toPersianDigits } from "../utils/persian";

interface ProductModalProps {
  product: CatalogProductDetail;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct, quantity: number) => void;
}

export function ProductModal({
  product,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductModalProps) {
  const minimumQuantity = Math.max(1, product.minimum_order_bundles);
  const [quantity, setQuantity] = useState(minimumQuantity);
  const [added, setAdded] = useState(false);
  const gallery = [
    ...(product.cover_image
      ? [{ id: "cover", image: product.cover_image, alt_text: product.name }]
      : []),
    ...product.images.map((image) => ({
      id: String(image.id),
      image: image.image,
      alt_text: image.alt_text || product.name,
    })),
  ];
  const [selectedImage, setSelectedImage] = useState<string | null>(
    gallery[0]?.image ?? null,
  );

  const handleAdd = () => {
    if (!product.is_in_stock) {
      return;
    }
    onAddToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-4">
      <div className="relative my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#161822] text-right shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-black/60 p-2.5 text-zinc-300 backdrop-blur-md hover:text-white"
            aria-label="بستن جزئیات محصول"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(product)}
            className={`rounded-full border p-2.5 backdrop-blur-md transition-all ${
              isFavorite
                ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                : "border-white/10 bg-black/60 text-zinc-300 hover:text-white"
            }`}
            aria-label="افزودن به علاقه‌مندی‌ها"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-rose-500" : ""}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex min-h-[320px] flex-col bg-[#101117]">
            <div className="relative min-h-[300px] flex-1">
              <CatalogImage
                src={selectedImage}
                alt={product.name}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161822] via-transparent to-transparent md:hidden" />
            </div>

            {gallery.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-white/5 p-3">
                {gallery.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() => setSelectedImage(image.image)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${
                      selectedImage === image.image
                        ? "border-amber-400"
                        : "border-white/10"
                    }`}
                    aria-label={`نمایش ${image.alt_text}`}
                  >
                    <CatalogImage
                      src={image.image}
                      alt={image.alt_text}
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col justify-between p-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-amber-400">
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-amber-300">
                  {product.category.name}
                </span>
                <span
                  className={
                    product.is_in_stock ? "text-emerald-400" : "text-rose-400"
                  }
                >
                  {product.is_in_stock
                    ? `${toPersianDigits(product.stock_bundles)} دسته موجود`
                    : "ناموجود"}
                </span>
              </div>

              <h1 className="mb-1 text-2xl font-bold leading-tight text-white">
                {product.name}
              </h1>
              {product.short_description ? (
                <p className="mb-3 text-xs leading-6 text-zinc-400">
                  {product.short_description}
                </p>
              ) : null}
              {product.description ? (
                <p className="mb-5 text-xs font-light leading-6 text-zinc-300">
                  {product.description}
                </p>
              ) : null}

              <div className="mb-5 grid grid-cols-2 gap-2.5 rounded-xl border border-white/5 bg-[#101117] p-3 text-xs">
                <div className="flex items-center gap-2">
                  <Flower2 className="h-4 w-4 text-amber-400" />
                  <div>
                    <span className="block text-[10px] text-zinc-500">
                      نوع گل
                    </span>
                    <span className="font-medium text-zinc-200">
                      {product.flower_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-rose-400" />
                  <div>
                    <span className="block text-[10px] text-zinc-500">رنگ</span>
                    <span className="font-medium text-zinc-200">
                      {product.color || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="block text-[10px] text-zinc-500">
                      اندازه دسته
                    </span>
                    <span className="font-medium text-zinc-200">
                      {toPersianDigits(product.stems_per_bundle)} شاخه
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-400" />
                  <div>
                    <span className="block text-[10px] text-zinc-500">
                      حداقل سفارش
                    </span>
                    <span className="font-medium text-zinc-200">
                      {toPersianDigits(product.minimum_order_bundles)} دسته
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101117] p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(minimumQuantity, current - 1),
                      )
                    }
                    disabled={!product.is_in_stock}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f212d] text-base font-bold text-white hover:bg-zinc-700 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">
                    {toPersianDigits(quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(product.stock_bundles, current + 1),
                      )
                    }
                    disabled={
                      !product.is_in_stock ||
                      quantity >= product.stock_bundles
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f212d] text-base font-bold text-white hover:bg-zinc-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <div className="text-left">
                  <span className="block text-[10px] text-zinc-400">
                    مبلغ کل
                  </span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {formatToman(product.price_per_bundle * quantity)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.is_in_stock}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-lg transition-all ${
                  !product.is_in_stock
                    ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
                    : added
                      ? "bg-emerald-600 text-white shadow-emerald-950/50"
                      : "bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5 text-white" />
                    <span>به سبد خرید اضافه شد</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>
                      {product.is_in_stock
                        ? "افزودن به سبد خرید"
                        : "ناموجود"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
