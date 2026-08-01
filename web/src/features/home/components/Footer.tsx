"use client";

import {
  ArrowLeft,
  Heart,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

interface FooterProps {
  onShopClick: () => void;
  onCareClick: () => void;
  onFavoritesClick: () => void;
}

const trustItems = [
  { label: "ارسال با هماهنگی", icon: Truck },
  { label: "تضمین سلامت گیاه", icon: ShieldCheck },
];

export function Footer({
  onShopClick,
  onCareClick,
  onFavoritesClick,
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateFromFooter = (navigate: () => void) => {
    navigate();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      dir="rtl"
      className="relative mt-12 overflow-hidden border-t border-white/[0.06] bg-[#0c0e0c] px-4 pb-7 pt-5 sm:mt-16 sm:px-6 sm:pb-9 md:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-[#31513d]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-[#c7a23c]/[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl">
        <section className="relative overflow-hidden rounded-[24px] border border-[#c7a23c]/20 bg-gradient-to-l from-[#1c2b22] via-[#172019] to-[#141714] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
          <div
            aria-hidden="true"
            className="absolute -left-8 -top-10 text-[#c7a23c]/[0.07]"
          >
            <Leaf className="h-40 w-40 rotate-[-18deg] stroke-[1]" />
          </div>

          <div className="relative max-w-md">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#c7a23c]/20 bg-[#c7a23c]/10 px-2.5 py-1 text-[10px] font-bold text-[#d9bd67] sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              انتخابی سبز برای خانه تو
            </span>

            <h2 className="text-xl font-black leading-8 text-[#f0eee8] sm:text-2xl sm:leading-10">
              خونه‌ات جای یک زندگی تازه دارد
            </h2>

            <p className="mt-1.5 text-xs leading-6 text-white/50 sm:text-sm">
              از بین گل‌ها و گیاهان فلوریسا، همراه سبز خانه‌ات را پیدا کن.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateFromFooter(onShopClick)}
            className="relative mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c7a23c] px-5 text-xs font-black text-[#17170f] shadow-[0_10px_28px_rgba(199,162,60,0.2)] transition hover:bg-[#d7b84e] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eed77f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172019] sm:mt-0 sm:w-auto sm:min-w-36 sm:text-sm"
          >
            مشاهده فروشگاه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </section>

        <div className="grid gap-8 px-1 pb-7 pt-9 sm:grid-cols-[1.15fr_0.85fr] sm:gap-12 sm:pb-9 sm:pt-11">
          <div>
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-3 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c]"
              aria-label="بازگشت به ابتدای صفحه"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#c7a23c]/25 bg-[#c7a23c]/10 text-[#d5b651] transition group-hover:bg-[#c7a23c]/15">
                <Leaf className="h-5 w-5" />
              </span>

              <span>
                <strong className="block text-xl font-black tracking-tight text-[#efede8]">
                  فلوریسا
                </strong>
                <span className="mt-0.5 block text-[10px] text-white/35 sm:text-[11px]">
                  دنیای گل‌ها و گیاهان خانگی
                </span>
              </span>
            </button>

            <p className="mt-5 max-w-md text-xs leading-6 text-white/45 sm:text-[13px] sm:leading-7">
              فلوریسا کمک می‌کند گیاه مناسب فضای خودت را ساده‌تر انتخاب کنی و با
              آگاهی بیشتری از آن نگهداری کنی.
            </p>
          </div>

          <nav aria-label="دسترسی سریع فوتر">
            <p className="mb-4 text-xs font-extrabold text-[#d8d5cf]">
              دسترسی سریع
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigateFromFooter(onShopClick)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-[11px] font-medium text-white/55 transition hover:border-[#c7a23c]/20 hover:bg-[#c7a23c]/[0.06] hover:text-[#ddc46f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c] sm:text-xs"
              >
                <ShoppingBag className="h-4 w-4" />
                فروشگاه
              </button>

              <button
                type="button"
                onClick={() => navigateFromFooter(onFavoritesClick)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-[11px] font-medium text-white/55 transition hover:border-rose-400/20 hover:bg-rose-400/[0.05] hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c] sm:text-xs"
              >
                <Heart className="h-4 w-4" />
                علاقه‌مندی‌ها
              </button>

              <button
                type="button"
                onClick={() => navigateFromFooter(onCareClick)}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-[11px] font-medium text-white/55 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.05] hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a23c] sm:text-xs"
              >
                <Leaf className="h-4 w-4" />
                راهنمای هوشمند نگهداری گیاه
              </button>
            </div>
          </nav>
        </div>

        <div className="grid grid-cols-2 gap-2 border-y border-white/[0.05] py-3 sm:flex sm:items-center sm:gap-5">
          {trustItems.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center justify-center gap-2 text-[10px] text-white/40 sm:justify-start sm:text-[11px]"
            >
              <Icon className="h-4 w-4 text-[#b79a40]" />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-2 pt-5 text-center text-[9px] text-white/25 sm:flex-row sm:text-[10px]">
          <p>تمامی حقوق این وب‌سایت برای فلوریسا محفوظ است.</p>
          <p>با عشق به زندگی سبز</p>
        </div>
      </div>
    </footer>
  );
}
