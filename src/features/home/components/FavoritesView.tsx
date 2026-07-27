import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { formatToman, toPersianDigits } from '../utils/persian';

interface FavoritesViewProps {
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}) => {
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <span>علاقه‌مندی‌های شما</span>
          <span className="text-xs text-zinc-400 font-normal">
            ({toPersianDigits(favorites.length)} مورد)
          </span>
        </h2>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-[#161722] rounded-2xl border border-white/5 p-8">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-400" />
          <h3 className="text-base font-bold text-zinc-300 mb-1">لیست علاقه‌مندی‌ها خالی است</h3>
          <p className="text-xs text-zinc-500">
            با کلیک روی آیکون قلب روی هر محصول، آن را برای بعد ذخیره کنید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="bg-[#181a24] border border-white/10 rounded-2xl overflow-hidden p-3 flex gap-3 relative group"
            >
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-xl object-cover bg-black/40 cursor-pointer"
                onClick={() => onSelectProduct(product)}
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    onClick={() => onSelectProduct(product)}
                    className="text-sm font-bold text-white hover:text-emerald-400 cursor-pointer line-clamp-1"
                  >
                    {product.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mb-2">{product.potType}</p>
                  <span className="text-xs font-extrabold text-amber-400 block">
                    {formatToman(product.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="text-[11px] bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>خرید</span>
                  </button>

                  <button
                    onClick={() => onToggleFavorite(product)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg"
                    title="حذف از لیست"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
