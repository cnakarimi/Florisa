import { ExternalLink } from "lucide-react";

import { CatalogImage } from "@/features/catalog/components/CatalogImage";

import { ARTICLES } from "../data/products";
import type { HomeExperiencePresentationProps } from "./homeExperience.types";

type MagazineSectionProps = Pick<
  HomeExperiencePresentationProps,
  "onSelectArticle"
>;

export function MagazineSection({ onSelectArticle }: MagazineSectionProps) {
  return (
    <section
      id="magazine"
      className="mx-auto max-w-[1600px] scroll-mt-28 px-5 pb-10 pt-8 lg:px-8 lg:pb-20 lg:pt-0"
      aria-labelledby="home-magazine-title"
    >
      <div className="mb-5 flex items-center gap-2 lg:mb-8">
        <h2
          id="home-magazine-title"
          className="text-desktop-heading-h2 text-[#dedbd5]"
        >
          مجله گیاهان
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ARTICLES.map((article, index) => (
          <button
            type="button"
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className={`${
              index === 0 ? "block" : "hidden lg:block"
            } group relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#151715] text-right shadow-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c] lg:rounded-2xl lg:border lg:border-white/10 lg:bg-[#181a18] lg:hover:border-[#d4af37]/55 lg:focus-visible:ring-[#d4af37]`}
          >
            <CatalogImage
              src={article.image}
              alt={article.title}
              sizes="(min-width: 1280px) 596px, (min-width: 1024px) calc((100vw - 88px) / 2), (max-width: 639px) calc(100vw - 72px), (max-width: 767px) calc(100vw - 88px), calc(100vw - 104px)"
              quality={80}
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
            />

            <span className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent lg:from-[#0b0d0c] lg:via-black/45" />

            <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-sm border border-[#c7a23c]/20 bg-black/30 text-[#d1ad38] backdrop-blur-sm lg:left-4 lg:top-4 lg:size-10 lg:rounded-xl lg:border-white/10 lg:bg-black/55 lg:text-[#d4af37] lg:backdrop-blur-md">
              <ExternalLink className="size-4" aria-hidden="true" />
            </span>

            <span className="absolute inset-x-0 bottom-0 block p-5 lg:p-6">
              <strong className="block text-base font-extrabold text-white transition-colors group-hover:text-[#d4af37] lg:text-lg lg:font-black lg:leading-7">
                {article.title}
              </strong>

              <span className="mt-2 block line-clamp-2 text-[11px] font-light leading-5 text-white/72 lg:text-xs lg:leading-6 lg:text-zinc-300">
                {article.excerpt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
