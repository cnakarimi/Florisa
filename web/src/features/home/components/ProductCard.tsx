import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import type { Product } from '../types';
import { formatToman } from '../utils/persian';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
}) => {
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-[#181a22] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 cursor-pointer flex flex-col justify-between"
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full bg-[#121319] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Favorite Heart Button Overlay */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 left-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-black/40 text-zinc-400 hover:text-white border border-white/10'
          }`}
          title="افزودن به علاقه‌مندی‌ها"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* New Badge */}
        {product.isNew && (
          <span className="absolute top-3 right-3 z-10 bg-amber-500/90 text-black font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300/40">
            جدید
          </span>
        )}

        {/* Care Tags Row matching screenshot (e.g. "نگهداری آسان" and "+۴") */}
        <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between pointer-events-none gap-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {product.careTags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-[#12131a]/85 backdrop-blur-md border border-white/15 text-zinc-200 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full"
              >
                <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                <span>{tag}</span>
              </span>
            ))}
          </div>

          <span className="bg-[#12131a]/85 backdrop-blur-md border border-white/15 text-zinc-400 text-[10px] font-mono px-2 py-1 rounded-full">
            +۴
          </span>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title matching screenshot "سانسوریا پوست ماری" */}
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight mb-1">
            {product.title}
          </h4>

          {/* Subtitle matching screenshot "گلدان فایبرگلاس" */}
          <p className="text-xs text-zinc-400 font-light mb-3">
            {product.potType}
          </p>
        </div>

        {/* Bottom Price & Add to Cart Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
          {/* Price */}
          <div className="flex flex-col">
            {product.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 line-through">
                  {formatToman(product.price)}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                  {formatToman(product.discountPrice)}
                </span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {formatToman(product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button matching screenshot "اضافه به سبد خرید" */}
          <button
            onClick={handleAddToCartClick}
            className={`text-[11px] sm:text-xs font-medium px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              addedAnimation
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-[#222430] hover:bg-emerald-600/30 border-white/10 hover:border-emerald-500/50 text-zinc-200 hover:text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>اضافه شد</span>
              </>
            ) : (
              <span>اضافه به سبد خرید</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
