import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type { CatalogProduct } from "@/features/catalog/types";
import { formatToman, toPersianDigits } from "../utils/persian";

interface FavoritesViewProps {
  favorites: CatalogProduct[];
  onToggleFavorite: (product: CatalogProduct) => void;
  onAddToCart: (product: CatalogProduct) => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

export function FavoritesView({
  favorites,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}: FavoritesViewProps) {
  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
          <span>علاقه‌مندی‌های شما</span>
          <span className="text-xs font-normal text-zinc-400">
            ({toPersianDigits(favorites.length)} مورد)
          </span>
        </h2>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#161722] p-8 py-20 text-center text-zinc-500">
          <Heart className="mx-auto mb-3 h-12 w-12 text-rose-400 opacity-30" />
          <h3 className="mb-1 text-base font-bold text-zinc-300">
            لیست علاقه‌مندی‌ها خالی است
          </h3>
          <p className="text-xs text-zinc-500">
            با انتخاب قلب هر محصول، آن را برای بعد ذخیره کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((product) => (
            <article
              key={product.id}
              className="group relative flex gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#181a24] p-3"
            >
              <button
                type="button"
                onClick={() => onSelectProduct(product)}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-black/40"
              >
                <CatalogImage
                  src={product.cover_image}
                  alt={product.name}
                  sizes="96px"
                />
              </button>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="line-clamp-1 text-right text-sm font-bold text-white hover:text-emerald-400"
                  >
                    {product.name}
                  </button>
                  <p className="mb-2 text-[11px] text-zinc-400">
                    {toPersianDigits(product.stems_per_bundle)} شاخه در هر دسته
                  </p>
                  <span className="block text-xs font-extrabold text-amber-400">
                    {formatToman(product.price_per_bundle)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    disabled={!product.is_in_stock}
                    className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{product.is_in_stock ? "خرید" : "ناموجود"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(product)}
                    className="rounded-lg p-1.5 text-zinc-500 hover:text-rose-400"
                    title="حذف از لیست"
                    aria-label="حذف از لیست"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
