import { useState, type MouseEvent } from "react";
import { Check, Heart, PackageX } from "lucide-react";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type { CatalogProduct } from "@/features/catalog/types";
import { formatToman, toPersianDigits } from "../utils/persian";

interface ProductCardProps {
  product: CatalogProduct;
  isFavorite: boolean;
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

export function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}: ProductCardProps) {
  const [addedAnimation, setAddedAnimation] = useState(false);
  const productTags = [product.flower_type, product.color].filter(Boolean);

  const handleAddToCartClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!product.is_in_stock) {
      return;
    }

    onAddToCart(product);
    setAddedAnimation(true);
    window.setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleFavoriteClick = (event: MouseEvent) => {
    event.stopPropagation();
    onToggleFavorite(product);
  };

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#181a22] transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-black/50"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#121319]">
        <CatalogImage
          src={product.cover_image}
          alt={product.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
        />

        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute left-3 top-3 z-10 rounded-full border p-2 backdrop-blur-md transition-all ${
            isFavorite
              ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
              : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
          }`}
          title="افزودن به علاقه‌مندی‌ها"
          aria-label="افزودن به علاقه‌مندی‌ها"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {product.is_featured ? (
          <span className="absolute right-3 top-3 z-10 rounded-full border border-amber-300/40 bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
            ویژه
          </span>
        ) : null}

        <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {productTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#12131a]/85 px-2.5 py-1 text-[10px] text-zinc-200 backdrop-blur-md sm:text-[11px]"
              >
                <Check className="h-3 w-3 stroke-[2.5] text-emerald-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          <span
            className={`rounded-full border bg-[#12131a]/85 px-2 py-1 text-[10px] backdrop-blur-md ${
              product.is_in_stock
                ? "border-emerald-500/30 text-emerald-300"
                : "border-rose-500/30 text-rose-300"
            }`}
          >
            {product.is_in_stock ? "موجود" : "ناموجود"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h4 className="mb-1 text-sm font-bold leading-tight text-white transition-colors group-hover:text-emerald-400 sm:text-base">
            {product.name}
          </h4>
          <p className="mb-3 text-xs font-light text-zinc-400">
            {toPersianDigits(product.stems_per_bundle)} شاخه در هر دسته
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2">
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-white sm:text-sm">
              {formatToman(product.price_per_bundle)}
            </span>
            <span className="text-[10px] text-zinc-500">هر دسته</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCartClick}
            disabled={!product.is_in_stock}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-medium transition-all sm:text-xs ${
              !product.is_in_stock
                ? "cursor-not-allowed border-white/5 bg-[#1a1b22] text-zinc-600"
                : addedAnimation
                  ? "border-emerald-500 bg-emerald-600 text-white"
                  : "border-white/10 bg-[#222430] text-zinc-200 hover:border-emerald-500/50 hover:bg-emerald-600/30 hover:text-white"
            }`}
          >
            {!product.is_in_stock ? (
              <>
                <PackageX className="h-3.5 w-3.5" />
                <span>ناموجود</span>
              </>
            ) : addedAnimation ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>اضافه شد</span>
              </>
            ) : (
              <span>اضافه به سبد خرید</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
