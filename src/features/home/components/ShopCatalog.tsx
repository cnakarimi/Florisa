import React, { useState } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/products';

interface ShopCatalogProps {
  products: Product[];
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [careFilter, setCareFilter] = useState<string>('all');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.includes(searchQuery) ||
      (p.titleEnglish && p.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.description.includes(searchQuery);

    const matchesCategory = selectedCat === 'all' || p.category === selectedCat;
    const matchesCare = careFilter === 'all' || p.careLevel === careFilter;

    return matchesSearch && matchesCategory && matchesCare;
  });

  return (
    <div className="py-6 space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#181a24] p-4 rounded-2xl border border-white/10">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی عنوان گیاه، گلدان یا ویژگی..."
            className="w-full bg-[#101117] border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === 'all'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#101117] text-zinc-400 border border-white/10 hover:text-white'
            }`}
          >
            همه
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-[#101117] text-zinc-400 border border-white/10 hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Care Difficulty Filter Strip */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto pb-1">
        <span className="flex items-center gap-1 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          سطح نگهداری:
        </span>
        <button
          onClick={() => setCareFilter('all')}
          className={`px-2.5 py-1 rounded-lg border text-[11px] ${
            careFilter === 'all'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-white/10 text-zinc-400'
          }`}
        >
          همه
        </button>
        <button
          onClick={() => setCareFilter('آسان')}
          className={`px-2.5 py-1 rounded-lg border text-[11px] ${
            careFilter === 'آسان'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-white/10 text-zinc-400'
          }`}
        >
          نگهداری آسان (مبتدی)
        </button>
        <button
          onClick={() => setCareFilter('متوسط')}
          className={`px-2.5 py-1 rounded-lg border text-[11px] ${
            careFilter === 'متوسط'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
              : 'border-white/10 text-zinc-400'
          }`}
        >
          متوسط
        </button>
      </div>

      {/* Grid of Product Cards matching screenshot style */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-[#161722] rounded-2xl border border-white/5">
          <p className="text-sm">هیچ محصولی با این مشخصات یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const isFav = favorites.some((f) => f.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={isFav}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
