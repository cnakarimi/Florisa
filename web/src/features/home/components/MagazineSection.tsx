import React from 'react';
import { Leaf, ExternalLink, Clock, BookOpen } from 'lucide-react';
import { ARTICLES } from '../data/products';
import type { Article } from '../types';

interface MagazineSectionProps {
  onSelectArticle: (article: Article) => void;
}

export const MagazineSection: React.FC<MagazineSectionProps> = ({ onSelectArticle }) => {
  const featuredArticle = ARTICLES[0];

  return (
    <section className="my-10">
      {/* Section Header matching screenshot */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span>مجله گیاهان</span>
        </h3>
        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          مطالب آموزشی و مراقبت
        </span>
      </div>

      {/* Featured Article Card matching screenshot */}
      <div
        onClick={() => onSelectArticle(featuredArticle)}
        className="group relative bg-[#181a23] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all duration-300 shadow-xl"
      >
        {/* External Link Icon top right matching screenshot */}
        <div className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-all border border-white/10">
          <ExternalLink className="w-4 h-4" />
        </div>

        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={featuredArticle.image}
            alt={featuredArticle.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121319] via-[#121319]/70 to-transparent" />

          {/* Card Text Content Positioned Bottom */}
          <div className="absolute bottom-0 right-0 left-0 p-6 flex flex-col justify-end">
            <div className="flex items-center gap-3 text-xs text-amber-300/90 mb-2">
              <span className="bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                مقاله برتر
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3 h-3" />
                زمان مطالعه: {featuredArticle.readTime}
              </span>
            </div>

            {/* Title matching screenshot "۱۰ گیاه محبوب آپارتمانی" */}
            <h4 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-emerald-300 transition-colors mb-2 leading-snug">
              {featuredArticle.title}
            </h4>

            {/* Excerpt matching screenshot */}
            <p className="text-xs sm:text-sm text-zinc-300 font-light line-clamp-2 max-w-xl leading-relaxed">
              {featuredArticle.excerpt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
