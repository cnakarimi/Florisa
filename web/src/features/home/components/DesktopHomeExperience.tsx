"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Heart,
  LayoutGrid,
  Leaf,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import { CatalogFeedback } from "@/features/catalog/components/CatalogFeedback";
import { CatalogImage } from "@/features/catalog/components/CatalogImage";
import { getCategoryImageUrl } from "@/features/catalog/utils/images";

import { ARTICLES } from "../data/products";
import { toPersianDigits } from "../utils/persian";
import { FeaturesGrid } from "./Footer";
import type { HomeExperiencePresentationProps } from "./homeExperience.types";
import { ProductCard } from "./ProductCard";

const HERO_IMAGE = "/images/hero_living_room_1785179404997.webp";

const NAV_ITEMS = [
  { href: "/", label: "خانه", activePath: "/" },
  { href: "/shop", label: "فروشگاه", activePath: "/shop" },
  { href: "/care", label: "مراقبت هوشمند", activePath: "/care" },
  { href: "/#magazine", label: "مجله", activePath: "" },
] as const;

function DesktopHeader({
  cartCount,
  favoritesCount,
  onSearch,
}: Pick<
  HomeExperiencePresentationProps,
  "cartCount" | "favoritesCount" | "onSearch"
>) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0c0e0d]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-8 px-8">
        <Link
          href="/"
          className="flex w-28 shrink-0 items-center rounded-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
          aria-label="فلوریسا، صفحه خانه"
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
              item.activePath === "/"
                ? pathname === "/"
                : Boolean(item.activePath) &&
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

        <div className="mr-auto flex items-center gap-2 text-zinc-300">
          <form
            role="search"
            onSubmit={handleSubmit}
            className="relative ml-2 w-56"
          >
            <label htmlFor="desktop-home-search" className="sr-only">
              جست‌وجوی محصولات فلوریسا
            </label>
            <button
              type="submit"
              aria-label="اجرای جست‌وجو"
              className="absolute right-1.5 top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full text-[#d4af37] transition hover:bg-[#d4af37]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
            <input
              id="desktop-home-search"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="جست‌وجوی محصول..."
              className="h-10 w-full rounded-full border border-white/10 bg-[#181b19] pr-9 pl-4 text-xs text-white outline-none transition placeholder:text-zinc-500 hover:border-white/20 focus:border-[#d4af37]/70 focus:ring-2 focus:ring-[#d4af37]/15"
            />
          </form>

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
      </div>
    </header>
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

export function DesktopHomeExperience(
  props: HomeExperiencePresentationProps,
) {
  const {
    categories,
    latestProducts,
    selectedCategory,
    isCategoriesLoading,
    isProductsLoading,
    categoriesError,
    productsError,
    cartCount,
    favoritesCount,
    onSelectCategory,
    onRetryCategories,
    onRetryProducts,
    onToggleFavorite,
    onAddToCart,
    onSelectProduct,
    onSelectArticle,
    onSearch,
    isFavorite,
  } = props;

  return (
    <div
      data-home-experience="desktop"
      className="min-h-dvh overflow-x-hidden bg-[#0d0f0e] text-zinc-100 selection:bg-[#c7a23c]/30 selection:text-white"
    >
      <DesktopHeader
        cartCount={cartCount}
        favoritesCount={favoritesCount}
        onSearch={onSearch}
      />

      <main>
        <section
          className="mx-auto max-w-7xl px-8 pt-8"
          aria-labelledby="desktop-hero-title"
        >
          <div className="relative isolate h-[480px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#111411] shadow-2xl shadow-black/40">
            <Image
              fill
              src={HERO_IMAGE}
              alt="فضای خانه با گیاهان آپارتمانی"
              sizes="(min-width: 1280px) 1216px, calc(100vw - 64px)"
              quality={80}
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/40" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
              <span className="mb-5 rounded-full border border-white/15 bg-black/25 px-5 py-2 text-xs font-medium text-white/85 backdrop-blur-md">
                دنیای گیاهان خانگی
              </span>
              <h1
                id="desktop-hero-title"
                className="text-5xl font-black leading-tight tracking-tight text-white drop-shadow-2xl"
              >
                به خونت جون بده
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-100/85 drop-shadow-lg">
                با انتخاب گل‌ها و گیاهان تازه، آرامش و زندگی را به خانه‌ات دعوت
                کن؛ فلوریسا برای یک انتخاب سبز کنارت است.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4af37] px-8 text-sm font-black text-[#11130f] shadow-xl transition hover:bg-[#e3c45d] motion-safe:hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3dc91] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                مشاهده محصولات
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-8 py-20"
          aria-labelledby="desktop-categories-title"
        >
          <SectionHeading
            id="desktop-categories-title"
            title="دسته‌بندی"
            icon={<LayoutGrid className="size-5" aria-hidden="true" />}
          />

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
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 lg:grid-cols-4">
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
                      className={`relative size-44 overflow-hidden rounded-full border bg-[#151715] p-1 transition duration-300 motion-reduce:transform-none ${
                        isSelected
                          ? "scale-[1.04] border-2 border-[#d4af37] shadow-[0_0_32px_rgba(212,175,55,0.28)]"
                          : "border-[#d4af37]/50 group-hover:scale-[1.04] group-hover:border-[#d4af37]"
                      }`}
                    >
                      <span className="relative block size-full overflow-hidden rounded-full">
                        <CatalogImage
                          src={getCategoryImageUrl(category.image)}
                          alt={category.name}
                          sizes="176px"
                          quality={75}
                          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                      </span>
                    </span>
                    <span
                      className={`mt-4 text-base font-bold transition-colors ${
                        isSelected
                          ? "text-[#d4af37]"
                          : "text-zinc-100 group-hover:text-[#d4af37]"
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

        <section
          className="mx-auto max-w-7xl px-8 pb-20"
          aria-labelledby="desktop-products-title"
        >
          <div className="mb-7 flex items-center justify-between">
            <h2
              id="desktop-products-title"
              className="text-2xl font-black tracking-tight text-white"
            >
              جدیدترین محصولات
            </h2>
            <Link
              href="/shop"
              className="rounded-md text-sm font-bold text-[#d4af37] transition hover:text-[#ead06f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
            >
              مشاهده همه
            </Link>
          </div>

          {isProductsLoading ? (
            <CatalogFeedback kind="loading" />
          ) : productsError && latestProducts.length === 0 ? (
            <CatalogFeedback
              kind="error"
              message={productsError}
              onRetry={onRetryProducts}
            />
          ) : latestProducts.length === 0 ? (
            <CatalogFeedback
              kind="empty"
              message={
                selectedCategory
                  ? "در این دسته‌بندی هنوز محصولی ثبت نشده است."
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageSizes="(min-width: 1280px) 284px, calc((100vw - 124px) / 4)"
                  isFavorite={isFavorite(product)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-7xl px-8 pb-20">
          <FeaturesGrid />
        </section>

        <section
          id="magazine"
          className="mx-auto max-w-7xl scroll-mt-28 px-8 pb-20"
          aria-labelledby="desktop-magazine-title"
        >
          <SectionHeading
            id="desktop-magazine-title"
            title="مجله گیاهان"
            icon={<Leaf className="size-5" aria-hidden="true" />}
          />

          <div
            className={`grid gap-6 ${
              ARTICLES.length >= 3 ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {ARTICLES.map((article) => (
              <button
                type="button"
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[#181a18] text-right shadow-xl transition hover:border-[#d4af37]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
              >
                <CatalogImage
                  src={article.image}
                  alt={article.title}
                  sizes={
                    ARTICLES.length >= 3
                      ? "(min-width: 1280px) 390px, calc((100vw - 112px) / 3)"
                      : "(min-width: 1280px) 596px, calc((100vw - 88px) / 2)"
                  }
                  quality={80}
                  className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0b0d0c] via-black/45 to-transparent" />
                <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-xl border border-white/10 bg-black/55 text-[#d4af37] backdrop-blur-md">
                  <ExternalLink className="size-4" aria-hidden="true" />
                </span>
                <span className="absolute inset-x-0 bottom-0 block p-6">
                  <strong className="block text-lg font-black leading-7 text-white transition-colors group-hover:text-[#d4af37]">
                    {article.title}
                  </strong>
                  <span className="mt-2 block line-clamp-2 text-xs font-light leading-6 text-zinc-300">
                    {article.excerpt}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  icon,
}: {
  id: string;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center gap-2">
      <h2 id={id} className="text-2xl font-black tracking-tight text-white">
        {title}
      </h2>
      <span className="text-[#d4af37]">{icon}</span>
    </div>
  );
}
