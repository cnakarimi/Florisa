import Image from "next/image";
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
      </div>

      <button
        type="button"
        onClick={() => onSelectArticle(featuredArticle)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-[#151715] text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
      >
        <Image
          fill
          src={featuredArticle.image}
          alt={featuredArticle.title}
          sizes="(max-width: 639px) calc(100vw - 72px), (max-width: 767px) calc(100vw - 88px), (max-width: 1023px) calc(100vw - 104px), 920px"
          quality={75}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
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
