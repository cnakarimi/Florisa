import Image from "next/image";

const HERO_IMAGE = "/images/hero_living_room_1785179404997.webp";

interface HeroSectionProps {
  onShopClick: () => void;
}

export function HeroSection({ onShopClick }: HeroSectionProps) {
  return (
    <section className="relative isolate aspect-[3/2] w-full overflow-hidden bg-[#111411] sm:aspect-[16/8] md:aspect-[16/7]">
      <Image
        fill
        src={HERO_IMAGE}
        alt="فضای خانه با گیاهان آپارتمانی"
        sizes="(max-width: 1023px) 100vw, 1024px"
        quality={80}
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#101110] via-black/5 to-black/30" />

      <button
        type="button"
        onClick={onShopClick}
        className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center px-6 pt-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c7a23c]"
        aria-label="مشاهده محصولات فلوریسا"
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl">
          به خونت جون بده
        </h1>

        <span className="mt-2 text-xs font-light text-white/75 drop-shadow-md sm:text-sm md:mt-3 md:text-base">
          دنیای گیاهان خانگی
        </span>

        <span className="mt-5 rounded-full border border-white/25 bg-black/20 px-5 py-2 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-[#c7a23c]/70 hover:bg-[#c7a23c]/15 sm:px-6 sm:py-2.5 sm:text-sm">
          مشاهده محصولات
        </span>
      </button>
    </section>
  );
}
