import React from 'react';
import { CATEGORIES } from '../data/products';
import { toPersianDigits } from '../utils/persian';

interface CategoriesSectionProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="my-8">
      {/* Section Header matching screenshot */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>دسته بندی</span>
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-amber-400 hover:underline"
          >
            نمایش همه
          </button>
        )}
      </div>

      {/* Circular Category Grid matching screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className="flex flex-col items-center group transition-all focus:outline-none"
            >
              {/* Circular Frame with Glowing Ring */}
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 transition-all duration-300 ${
                  isSelected
                    ? 'border-2 border-amber-400 shadow-[0_0_20px_rgba(229,193,88,0.4)] scale-105'
                    : 'border border-amber-500/40 hover:border-amber-400/80 hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#181920] relative">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                </div>
              </div>

              {/* Title under circle matching screenshot */}
              <span
                className={`mt-3 text-sm sm:text-base font-semibold transition-colors ${
                  isSelected ? 'text-amber-300' : 'text-zinc-200 group-hover:text-amber-200'
                }`}
              >
                {cat.title}
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5">
                {toPersianDigits(cat.count)} تنوع
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
