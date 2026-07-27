import React, { useState } from 'react';
import { X, Heart, Sun, Droplets, Thermometer, ShieldAlert, Check, ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../types';
import { formatToman, toPersianDigits } from '../utils/persian';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, potColor?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedPotColor, setSelectedPotColor] = useState('مشکی مات');
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const potColors = [
    { name: 'مشکی مات', hex: '#1a1a1a' },
    { name: 'سفید سرامیکی', hex: '#e5e5e5' },
    { name: 'خاکستری بتنی', hex: '#666666' },
    { name: 'سبد کنفی', hex: '#b38b59' },
  ];

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedPotColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#161822] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-right animate-in fade-in zoom-in duration-200 my-8">
        {/* Close & Favorite Top Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(product)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
              isFavorite
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-black/60 text-zinc-300 border-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="relative bg-[#101117] h-72 md:h-full min-h-[300px]">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161822] via-transparent to-transparent md:hidden" />
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-amber-400 mb-2">
                <span className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-amber-300">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{toPersianDigits(product.rating)}</span>
                  <span className="text-zinc-500">({toPersianDigits(product.reviewCount)} نظر)</span>
                </div>
              </div>

              {/* Title & Pot */}
              <h3 className="text-2xl font-bold text-white leading-tight mb-1">
                {product.title}
              </h3>
              {product.titleEnglish && (
                <p className="text-xs text-zinc-400 font-mono mb-3">{product.titleEnglish}</p>
              )}

              <p className="text-xs text-zinc-300 leading-relaxed font-light mb-5">
                {product.description}
              </p>

              {/* Plant Care Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#101117] border border-white/5 mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">نیاز نوری</span>
                    <span className="text-zinc-200 font-medium">{product.sunlight}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">آبیاری</span>
                    <span className="text-zinc-200 font-medium">{product.watering}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">درجه سختی</span>
                    <span className="text-zinc-200 font-medium">{product.careLevel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">ایمنی حیوانات</span>
                    <span className="text-zinc-200 font-medium">
                      {product.isPetFriendly ? 'ایمن' : 'غیرایمن'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pot Color Selector */}
              <div className="mb-5">
                <label className="text-xs text-zinc-400 block mb-2">رنگ گلدان پایه:</label>
                <div className="flex items-center gap-3">
                  {potColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedPotColor(color.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        selectedPotColor === color.name
                          ? 'border-emerald-400 bg-emerald-500/10 text-white font-medium'
                          : 'border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Quantity & Add to Cart */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-[#101117] border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-[#1f212d] hover:bg-zinc-700 text-white text-base flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">
                    {toPersianDigits(quantity)}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg bg-[#1f212d] hover:bg-zinc-700 text-white text-base flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-zinc-400 block">مبلغ کل</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {formatToman(product.price * quantity)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  added
                    ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>به سبد خرید اضافه شد</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>افزودن به سبد خرید</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
