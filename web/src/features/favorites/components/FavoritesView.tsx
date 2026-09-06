import { Heart, ShoppingBag, Trash2 } from "lucide-react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import type { CatalogProduct } from "@/features/catalog/types";
import { getProductImageUrl } from "@/features/catalog/utils/images";
import { formatToman, toPersianDigits } from "@/utils/persian";

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
      <div className="mb-6 flex items-center justify-between border-b border-border-subtle pb-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
          <Heart
            className="size-5 fill-rose-500 text-rose-500"
            aria-hidden="true"
          />

          <span>علاقه‌مندی‌های شما</span>

          <span className="text-xs font-normal text-text-secondary">
            ({toPersianDigits(favorites.length)} مورد)
          </span>
        </h2>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-surface-muted px-8 py-20 text-center">
          <Heart
            className="mx-auto mb-3 size-12 text-rose-400 opacity-30"
            aria-hidden="true"
          />

          <h3 className="mb-1 text-base font-bold text-text-primary">
            لیست علاقه‌مندی‌ها خالی است
          </h3>

          <p className="text-xs text-text-secondary">
            با انتخاب قلب هر محصول، آن را برای بعد ذخیره کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((product) => {
            const canBuy =
              product.is_in_stock &&
              product.stock_quantity >= product.minimum_order_quantity;

            return (
              <article
                key={product.id}
                className="group relative flex gap-3 overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted p-3"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-background-primary/40"
                  aria-label={`مشاهده ${product.name}`}
                >
                  <CatalogImage
                    src={getProductImageUrl(product.cover_image)}
                    alt={product.name}
                    sizes="96px"
                  />
                </button>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="line-clamp-1 text-right text-sm font-bold text-text-primary transition-colors hover:text-text-brand"
                    >
                      {product.name}
                    </button>

                    <p className="mb-2 text-[11px] text-text-secondary">
                      {toPersianDigits(product.unit_size)} عدد در هر واحد فروش
                    </p>

                    <span className="block text-xs font-extrabold text-text-brand">
                      {formatToman(product.price)} / {product.sale_unit_display}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                    <button
                      type="button"
                      onClick={() => onAddToCart(product)}
                      disabled={!canBuy}
                      className="flex items-center gap-1 rounded-lg bg-action-primary px-3 py-1.5 text-[11px] font-bold text-text-inverse transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-secondary"
                    >
                      <ShoppingBag className="size-3.5" aria-hidden="true" />

                      <span>{canBuy ? "خرید" : "ناموجود"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleFavorite(product)}
                      className="rounded-lg p-1.5 text-text-secondary transition-colors hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
                      title="حذف از لیست"
                      aria-label={`حذف ${product.name} از علاقه‌مندی‌ها`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
