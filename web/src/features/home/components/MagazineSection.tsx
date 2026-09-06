import { getImageProps } from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { ARTICLES } from "@/features/blog/data/articles";

const BLOG_MOBILE_IMAGE = "/images/blog/blog-mobile.png";
const BLOG_DESKTOP_IMAGE = "/images/blog/blog-desktop.png";

function MagazineImage({ alt }: { alt: string }) {
  const common = {
    alt,
    quality: 80 as const,
  };

  const { props: mobileProps } = getImageProps({
    ...common,
    src: BLOG_MOBILE_IMAGE,
    width: 1275,
    height: 850,
    sizes: "(max-width: 1023px) 300px, 1px",
  });

  const { props: desktopProps } = getImageProps({
    ...common,
    src: BLOG_DESKTOP_IMAGE,
    width: 1200,
    height: 700,
    sizes: "(min-width: 1024px) calc((100vw - 160px) / 3), 1px",
  });

  return (
    <picture className="absolute inset-0 block size-full">
      <source
        media="(min-width: 1024px)"
        srcSet={desktopProps.srcSet}
        sizes={desktopProps.sizes}
      />

      <img
        {...mobileProps}
        alt={alt}
        className="
          absolute
          inset-0
          size-full
          object-cover
          object-center

          transition-transform
          duration-700
          ease-out

          lg:group-hover:scale-[1.035]

          motion-reduce:transform-none
          motion-reduce:transition-none
        "
      />
    </picture>
  );
}

export function MagazineSection() {
  return (
    <section
      id="magazine"
      className="
        mx-auto
        w-full
        max-w-[1600px]
        scroll-mt-28
        pb-10
        pt-8

        lg:px-8
        lg:pb-20
        lg:pt-0
      "
      aria-labelledby="home-magazine-title"
    >
      <div className="mb-5 lg:mb-8">
        <h2
          id="home-magazine-title"
          className="
            text-mobile-heading-lg
            text-text-primary

            lg:text-desktop-heading-h2
          "
        >
          مجله گیاهان
        </h2>
      </div>

      <div
        dir="rtl"
        className="
          -mx-4
          flex
          snap-x
          snap-mandatory
          gap-4
          overflow-x-auto
          px-4
          pb-2
          overscroll-x-contain

          sm:-mx-6
          sm:px-6

          md:-mx-8
          md:px-8

          lg:mx-0
          lg:grid
          lg:grid-cols-3
          lg:gap-6
          lg:overflow-visible
          lg:px-0
          lg:pb-0

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {ARTICLES.map((article) => (
          <Link
            key={article.id}
            href="/blog"
            aria-label={`مطالعه ${article.title}`}
            className="
              group
              relative
              aspect-[7/8]
              w-[76vw]
              min-w-[260px]
              max-w-[300px]
              shrink-0
              snap-start
              overflow-hidden
              rounded-xl
              border
              border-border-subtle/25
              bg-background-secondary
              text-right

              transition-[transform,border-color]
              duration-300
              ease-out

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-action-primary

              sm:w-[48vw]
              sm:max-w-[320px]

              md:w-[36vw]
              md:max-w-[340px]

              lg:aspect-[6/5]
              lg:w-auto
              lg:min-w-0
              lg:max-w-none
              lg:rounded-2xl
              lg:hover:-translate-y-1
              lg:hover:border-border-brand/60

              motion-reduce:transform-none
              motion-reduce:transition-none
            "
          >
            <MagazineImage alt={article.title} />

            <span
              aria-hidden="true"
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-background-primary
                via-background-primary/30
                to-transparent
              "
            />

            <span
              aria-hidden="true"
              className="
                absolute
                left-3
                top-3
                grid
                size-8
                place-items-center
                rounded-md
                border
                border-border-brand/30
                bg-background-primary/60
                text-text-brand
                backdrop-blur-sm

                transition-[background-color,border-color]
                duration-200

                lg:left-4
                lg:top-4
                lg:size-10
                lg:rounded-lg
                lg:group-hover:border-border-brand/70
                lg:group-hover:bg-background-primary/80
              "
            >
              <ExternalLink className="size-4" aria-hidden="true" />
            </span>

            <span className="absolute inset-x-0 bottom-0 block p-4 sm:p-5 lg:p-6">
              <strong
                className="
                  block
                  line-clamp-2
                  text-base
                  font-bold
                  leading-7
                  text-text-primary

                  transition-colors
                  duration-200

                  lg:text-lg
                  lg:font-extrabold
                  lg:group-hover:text-text-brand
                "
              >
                {article.title}
              </strong>

              <span
                className="
                  mt-2
                  block
                  line-clamp-2
                  text-xs
                  leading-5
                  text-text-secondary

                  lg:leading-6
                "
              >
                {article.excerpt}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
