import React from 'react';
import { ShoppingBag, Heart, Search, Leaf } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

interface HeaderProps {
  cartCount: number;
  favoritesCount: number;
  onNavigateToCart: () => void;
  onOpenFavorites: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  favoritesCount,
  onNavigateToCart,
  onOpenFavorites,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0e12]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Leaf className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-1.5 leading-tight">
              برگ و گلدان
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-medium">
                ویترین آنلاین
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">فروشگاه تخصصی گیاهان خانگی</p>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="flex-1 max-w-md hidden sm:block relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی سانسوریا، زامیفولیا، گل رز..."
            className="w-full bg-[#181920] border border-white/10 rounded-full py-2 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Action Icons: Cart & Favorites */}
        <div className="flex items-center gap-2">
          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2.5 rounded-full bg-[#181920] border border-white/10 hover:border-emerald-500/30 text-zinc-300 hover:text-white transition-all"
            title="علاقه‌مندی‌ها"
          >
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {toPersianDigits(favoritesCount)}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onNavigateToCart}
            className="relative p-2.5 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-all flex items-center gap-2 px-3.5"
            title="سبد خرید"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-semibold text-emerald-300 hidden md:inline">
              سبد خرید
            </span>
            {cartCount > 0 && (
              <span className="bg-emerald-500 text-black font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {toPersianDigits(cartCount)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="mt-2.5 sm:hidden relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی گیاه یا گل مورد نظر..."
          className="w-full bg-[#181920] border border-white/10 rounded-full py-2 pr-10 pl-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
        <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>
    </header>
  );
};
