import { ExternalLink, Leaf } from "lucide-react";
import { ARTICLES } from "../data/products";
import type { Article } from "../types";

interface MagazineSectionProps {
  onSelectArticle: (article: Article) => void;
}

export function MagazineSection({ onSelectArticle }: MagazineSectionProps) {
  const featuredArticle = ARTICLES[0];

  if (!featuredArticle) return null;

  return (
    <section className="px-5 pb-10 pt-8" aria-labelledby="magazine-title">
      <div className="mb-5 flex items-center justify-between">
        <h2
          id="magazine-title"
          className="text-lg font-extrabold text-[#dedbd5]"
        >
          مجله گیاهان
        </h2>
        <Leaf className="h-5 w-5 -rotate-12 text-[#c8a333]" />
      </div>

      <button
        type="button"
        onClick={() => onSelectArticle(featuredArticle)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-[#151715] text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
      >
        <img
          src={featuredArticle.image}
          alt={featuredArticle.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

        <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-sm border border-[#c7a23c]/20 bg-black/30 text-[#d1ad38] backdrop-blur-sm">
          <ExternalLink className="h-4 w-4" />
        </span>

        <span className="absolute inset-x-0 bottom-0 block p-5">
          <strong className="block text-base font-extrabold text-white">
            {featuredArticle.title}
          </strong>
          <span className="mt-2 block line-clamp-2 text-[11px] font-light leading-5 text-white/72">
            {featuredArticle.excerpt}
          </span>
        </span>
      </button>
    </section>
  );
}
