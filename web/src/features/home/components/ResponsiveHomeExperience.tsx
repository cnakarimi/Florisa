"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  LayoutGrid,
  Leaf,
  ShoppingBag,
  User,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getCategoryImageUrl } from "@/features/catalog/utils/images";

import { ARTICLES } from "../data/products";
import { toPersianDigits } from "../utils/persian";
import { BottomNav } from "./BottomNav";
import { FeaturesGrid } from "./Footer";
import type { HomeExperiencePresentationProps } from "./homeExperience.types";
import { ProductCard } from "./ProductCard";
import { ScrollNavbar } from "./ScrollNavbar";

const HERO_IMAGE = "/images/hero_1.png";

const NAV_ITEMS = [
  { href: "/shop", label: "فروشگاه", activePath: "/shop" },
  { href: "/#magazine", label: "مجله", activePath: "" },
] as const;

function DesktopHeader({
  cartCount,
  favoritesCount,
}: Pick<HomeExperiencePresentationProps, "cartCount" | "favoritesCount">) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsScrolled(window.scrollY > 16);
    };

    updateHeaderState();

    window.addEventListener("scroll", updateHeaderState, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
    };
  }, []);

  return (
    <>
      <header
        className={`hidden lg:fixed lg:inset-x-0 lg:top-0 lg:z-[100] lg:block ${
          isScrolled
            ? "border-b border-white/10 bg-[#090b0a]/95 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-xl"
            : "border-b border-white/[0.04] bg-[#0d0f0e]/80 backdrop-blur-md"
        } transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-8 px-8">
          <div className="flex items-center gap-2 text-zinc-300">
            <HeaderAction
              href="/favorites"
              label="علاقه‌مندی‌ها"
              count={favoritesCount}
              icon={<Heart className="size-5" aria-hidden="true" />}
            />

            <HeaderAction
              href="/cart"
              label="سبد خرید"
              count={cartCount}
              icon={<ShoppingBag className="size-5" aria-hidden="true" />}
            />

            <HeaderAction
              href="/profile"
              label="حساب کاربری"
              icon={<User className="size-5" aria-hidden="true" />}
            />
          </div>

          <Link
            href="/"
            aria-label="فلوریسا، صفحه خانه"
            className="mx-auto flex w-28 items-center justify-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
          >
            <Image
              src="/images/brand/florisa-logo.svg"
              alt="فلوریسا"
              width={112}
              height={43}
              className="h-auto w-full object-contain"
            />
          </Link>

          <nav
            aria-label="ناوبری اصلی دسکتاپ"
            className="flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.activePath !== "" &&
                (pathname === item.activePath ||
                  pathname.startsWith(`${item.activePath}/`));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-sm py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/65 ${
                    isActive
                      ? "font-bold text-[#d4af37] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#d4af37]"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Header is fixed, so this element reserves its original space. */}
      <div aria-hidden="true" className="hidden h-[76px] shrink-0 lg:block" />
    </>
  );
}

function HeaderAction({
  href,
  label,
  count = 0,
  icon,
}: {
  href: string;
  label: string;
  count?: number;
  icon: ReactNode;
}) {
  const accessibleLabel = count
    ? `${label}، ${toPersianDigits(count)} مورد`
    : label;

  return (
    <Link
      href={href}
      aria-label={accessibleLabel}
      className="relative grid size-10 place-items-center rounded-full transition hover:bg-white/[0.06] hover:text-[#d4af37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
    >
      {icon}

      {count > 0 ? (
        <span className="absolute -left-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#d4af37] text-[9px] font-black text-black">
          {toPersianDigits(count)}
        </span>
      ) : null}
    </Link>
  );
}

function ProductsSlider({
  latestProducts,
  selectedCategory,
  isProductsLoading,
  productsError,
  onRetryProducts,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  isFavorite,
}: Pick<
  HomeExperiencePresentationProps,
  | "latestProducts"
  | "selectedCategory"
  | "isProductsLoading"
  | "productsError"
  | "onRetryProducts"
  | "onToggleFavorite"
  | "onAddToCart"
  | "onSelectProduct"
  | "isFavorite"
>) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  const [canSlideLeft, setCanSlideLeft] = useState(false);
  const [canSlideRight, setCanSlideRight] = useState(false);

  const updateSliderState = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const slides = Array.from(
      slider.querySelectorAll<HTMLElement>("[data-product-slide]"),
    );

    if (slides.length === 0) {
      setCanSlideLeft(false);
      setCanSlideRight(false);
      activeIndexRef.current = 0;
      return;
    }

    const sliderRect = slider.getBoundingClientRect();
    const firstSlideRect = slides[0].getBoundingClientRect();
    const lastSlideRect = slides[slides.length - 1].getBoundingClientRect();

    setCanSlideLeft(lastSlideRect.left < sliderRect.left - 2);
    setCanSlideRight(firstSlideRect.right > sliderRect.right + 2);

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const distanceFromStart = Math.abs(slideRect.right - sliderRect.right);

      if (distanceFromStart < closestDistance) {
        closestDistance = distanceFromStart;
        closestIndex = index;
      }
    });

    activeIndexRef.current = closestIndex;
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const animationFrame = window.requestAnimationFrame(updateSliderState);

    const resizeObserver = new ResizeObserver(updateSliderState);
    resizeObserver.observe(slider);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [latestProducts.length, updateSliderState]);

  const scrollToProduct = (direction: "left" | "right") => {
    const slider = sliderRef.current;

    if (!slider) return;

    const slides = Array.from(
      slider.querySelectorAll<HTMLElement>("[data-product-slide]"),
    );

    if (slides.length === 0) return;

    const indexChange = direction === "left" ? 1 : -1;

    const targetIndex = Math.min(
      Math.max(activeIndexRef.current + indexChange, 0),
      slides.length - 1,
    );

    activeIndexRef.current = targetIndex;

    slides[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  if (isProductsLoading) {
    return <CatalogFeedback kind="loading" />;
  }

  if (productsError && latestProducts.length === 0) {
    return (
      <CatalogFeedback
        kind="error"
        message={productsError}
        onRetry={onRetryProducts}
      />
    );
  }

  if (latestProducts.length === 0) {
    return (
      <CatalogFeedback
        kind="empty"
        message={
          selectedCategory
            ? "در این دسته‌بندی هنوز محصولی ثبت نشده است."
            : undefined
        }
      />
    );
  }

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        dir="rtl"
        role="region"
        tabIndex={0}
        onScroll={updateSliderState}
        aria-label="اسلایدر جدیدترین محصولات"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scroll-smooth overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:mx-0 lg:gap-5 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {latestProducts.map((product) => (
          <div
            key={product.id}
            data-product-slide
            className="w-[72vw] min-w-[240px] max-w-[290px] shrink-0 snap-start sm:w-[44vw] sm:max-w-[310px] md:w-[30vw] md:max-w-[300px] lg:w-[calc((100%_-_2.5rem)_/_3)] lg:min-w-0 lg:max-w-none xl:w-[calc((100%_-_3.75rem)_/_4)]"
          >
            <ProductCard
              product={product}
              imageSizes="(min-width: 1280px) 289px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 768px) 300px, (min-width: 640px) 310px, 290px"
              isFavorite={isFavorite(product)}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between lg:flex">
        <SliderButton
          label="نمایش محصولات بعدی"
          disabled={!canSlideLeft}
          onClick={() => scrollToProduct("left")}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </SliderButton>

        <SliderButton
          label="نمایش محصولات قبلی"
          disabled={!canSlideRight}
          onClick={() => scrollToProduct("right")}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </SliderButton>
      </div>
    </div>
  );
}

function SliderButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/15 bg-[#111411]/95 text-white shadow-xl backdrop-blur-md transition hover:border-[#d4af37]/60 hover:bg-[#d4af37] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] disabled:pointer-events-none disabled:opacity-0"
    >
      {children}
    </button>
  );
}

function Categories({
  categories,
  selectedCategory,
  isCategoriesLoading,
  categoriesError,
  onSelectCategory,
  onRetryCategories,
}: Pick<
  HomeExperiencePresentationProps,
  | "categories"
  | "selectedCategory"
  | "isCategoriesLoading"
  | "categoriesError"
  | "onSelectCategory"
  | "onRetryCategories"
>) {
  const shouldShowOnMobile =
    isCategoriesLoading || Boolean(categoriesError) || categories.length >= 2;

  return (
    <section
      className={`${
        shouldShowOnMobile ? "block" : "hidden lg:block"
      } px-5 py-6 lg:mx-auto max-w-[1600px] lg:px-8 lg:py-20`}
      aria-labelledby="home-categories-title"
    >
      <div className="mb-5 flex items-center justify-between lg:mb-8 lg:justify-start lg:gap-2">
        <h2
          id="home-categories-title"
          className="text-lg font-extrabold text-[#dedbd5] lg:text-2xl lg:font-black lg:tracking-tight lg:text-white"
        >
          دسته‌بندی
        </h2>

        {selectedCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-[11px] font-medium text-[#c5a33d] lg:hidden"
          >
            نمایش همه
          </button>
        ) : null}
      </div>

      {isCategoriesLoading ? (
        <CatalogFeedback
          kind="loading"
          message="در حال دریافت دسته‌بندی‌ها..."
          compact
        />
      ) : categoriesError ? (
        <CatalogFeedback
          kind="error"
          message={categoriesError}
          onRetry={onRetryCategories}
          compact
        />
      ) : categories.length === 0 ? (
        <CatalogFeedback
          kind="empty"
          message="در حال حاضر دسته‌بندی فعالی وجود ندارد."
          compact
        />
      ) : (
        <div className="flex items-center gap-x-24">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug;

            return (
              <button
                type="button"
                key={category.id}
                onClick={() =>
                  onSelectCategory(isSelected ? null : category.slug)
                }
                aria-pressed={isSelected}
                className="group flex min-w-0 flex-col items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
              >
                <span
                  className={`relative aspect-square w-full max-w-[138px] overflow-hidden rounded-full border bg-[#151715] transition duration-300 motion-reduce:transform-none lg:size-44 lg:max-w-none lg:p-1 ${
                    isSelected
                      ? "scale-[1.03] border-[#e1bd4d] shadow-[0_0_0_3px_rgba(199,162,60,0.13)] lg:scale-[1.04] lg:border-2 lg:border-[#d4af37] lg:shadow-[0_0_32px_rgba(212,175,55,0.28)]"
                      : "border-[#9a7d2d] group-active:scale-[0.98] lg:border-[#d4af37]/50 lg:group-hover:scale-[1.04] lg:group-hover:border-[#d4af37]"
                  }`}
                >
                  <span className="relative block size-full overflow-hidden rounded-full">
                    <CatalogImage
                      src={getCategoryImageUrl(category.image)}
                      alt={category.name}
                      sizes="(min-width: 1024px) 176px, (max-width: 367px) calc(50vw - 46px), 138px"
                      quality={75}
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />

                    <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent lg:from-black/35" />
                  </span>
                </span>

                <span
                  className={`mt-3 text-sm font-bold transition-colors lg:mt-4 lg:text-base ${
                    isSelected
                      ? "text-[#e1bd4d] lg:text-[#d4af37]"
                      : "text-[#ddd9d2] lg:text-zinc-100 lg:group-hover:text-[#d4af37]"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Hero() {
  return (
    <section
      className="relative isolate aspect-[3/2] w-full overflow-hidden mx-auto h-[480px] "
      aria-labelledby="home-hero-title"
    >
      <Image
        fill
        src={HERO_IMAGE}
        alt="فضای خانه با گیاهان آپارتمانی"
        sizes="(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), 100vw"
        quality={80}
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#101110] via-black/5 to-black/30 lg:bg-black/25" />

      <div className="absolute inset-0 hidden bg-gradient-to-t from-black/75 via-black/10 to-black/40 lg:block" />

      <Link
        href="/shop"
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-8 px-6 pt-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c7a23c] lg:px-12 lg:pt-0"
        aria-label="مشاهده محصولات فلوریسا"
      >
        <h1
          id="home-hero-title"
          className="text-[36px] font-bold leading-tight tracking-tight text-white block"
        >
          به خونت جون بده
        </h1>
        <span className="mt-5 rounded-full border border-white/25 bg-black/20 px-5 py-2 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-[#c7a23c]/70 hover:bg-[#c7a23c]/15 sm:px-6 sm:py-2.5 sm:text-sm lg:mb-5 lg:mt-0 lg:border-white/15 lg:bg-black/25 lg:text-xs lg:text-white/85 lg:backdrop-blur-md">
          دنیای گیاهان خانگی
        </span>
      </Link>
    </section>
  );
}

export function ResponsiveHomeExperience(
  props: HomeExperiencePresentationProps,
) {
  const {
    latestProducts,
    selectedCategory,
    isProductsLoading,
    productsError,
    cartCount,
    favoritesCount,
    onRetryProducts,
    onToggleFavorite,
    onAddToCart,
    onSelectProduct,
    onSelectArticle,
    onShopClick,
    onSearch,
    isFavorite,
  } = props;

  return (
    <div
      data-home-experience="responsive"
      className="min-h-dvh overflow-x-clip bg-black text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white lg:bg-[#0d0f0e]"
    >
      <div className="lg:hidden">
        <ScrollNavbar
          searchQuery=""
          onSearch={onSearch}
          onLogoClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        />
      </div>

      <DesktopHeader cartCount={cartCount} favoritesCount={favoritesCount} />

      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg bg-[#111211] shadow-2xl shadow-black lg:max-w-none lg:bg-transparent lg:shadow-none">
        <main>
          <Hero />

          <div className="px-4 sm:px-6 md:px-8 lg:contents">
            <Categories {...props} />

            <section
              className="pb-2 pt-6 sm:pt-8 mx-auto max-w-[1600px] lg:px-8 lg:pb-20 lg:pt-0"
              aria-labelledby="home-products-title"
            >
              <div className="mb-4 flex items-center justify-between sm:mb-6 lg:mb-7">
                <h2
                  id="home-products-title"
                  className="text-lg font-extrabold text-[#dedbd5] sm:text-xl md:text-2xl lg:font-black lg:tracking-tight lg:text-white"
                >
                  جدیدترین محصولات
                </h2>

                <button
                  type="button"
                  onClick={onShopClick}
                  className="shrink-0 rounded-md text-xs font-medium text-[#c5a33d] transition-colors hover:text-[#e2c465] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70 sm:text-sm lg:font-bold lg:text-[#d4af37]"
                >
                  مشاهده همه
                </button>
              </div>

              <ProductsSlider
                latestProducts={latestProducts}
                selectedCategory={selectedCategory}
                isProductsLoading={isProductsLoading}
                productsError={productsError}
                onRetryProducts={onRetryProducts}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
                onSelectProduct={onSelectProduct}
                isFavorite={isFavorite}
              />
            </section>

            <section className="mx-auto hidden max-w-[1600px] px-8 pb-20 lg:block">
              <FeaturesGrid />
            </section>

            <section
              id="magazine"
              className="scroll-mt-28 px-5 pb-10 pt-8 lg:mx-auto max-w-[1600px] lg:px-8 lg:pb-20 lg:pt-0"
              aria-labelledby="home-magazine-title"
            >
              <div className="mb-5 flex items-center gap-2 lg:mb-8">
                <h2
                  id="home-magazine-title"
                  className="text-lg font-extrabold text-[#dedbd5] lg:text-2xl lg:font-black lg:tracking-tight lg:text-white"
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
          </div>
        </main>

        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
