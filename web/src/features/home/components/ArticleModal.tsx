import React from 'react';
import Image from 'next/image';
import { X, Clock, User } from 'lucide-react';
import type { Article } from '../types';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#161822] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-right my-8 max-h-[90vh] flex flex-col">
        {/* Top Floating Close Button */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 w-full flex-shrink-0">
          <Image
            fill
            src={article.image}
            alt={article.title}
            sizes="(max-width: 639px) calc(100vw - 24px), (max-width: 703px) calc(100vw - 32px), 672px"
            quality={75}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161822] via-[#161822]/40 to-transparent" />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-amber-400 mb-2">
              <span className="flex items-center gap-1 text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                زمان مطالعه: {article.readTime}
              </span>
              <span>•</span>
              <span className="text-zinc-400">{article.date}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug mb-4">
              {article.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
              <User className="w-4 h-4" />
              <span>نویسنده: {article.author}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed border-r-2 border-emerald-500 pr-3">
            {article.excerpt}
          </p>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
            {article.content.map((paragraph, idx) => (
              <p key={idx} className="bg-[#101117] p-4 rounded-xl border border-white/5">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400">برچسب‌ها:</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-[#222432] text-zinc-300 border border-white/10 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
