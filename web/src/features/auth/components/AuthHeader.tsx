import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface AuthHeaderProps {
  title?: string;
  onBack?: () => void;
}

export function AuthHeader({ title, onBack }: AuthHeaderProps) {
  if (title && onBack) {
    return (
      <header className="relative z-10 mb-7">
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-white/70 transition hover:border-[#D4AF37]/25 hover:text-[#D4AF37] active:scale-95"
            aria-label="بازگشت"
          >
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>

          <Image
            src="/images/brand/florisa-logo.svg"
            alt="فلوریسا"
            width={116}
            height={42}
            priority
            className="mx-auto h-10 w-auto object-contain"
          />
          <div className="size-10" aria-hidden="true" />
        </div>

        <h1 className="mt-4 text-center text-sm font-bold text-white/55">
          {title}
        </h1>
      </header>
    );
  }

  return (
    <header className="relative z-10 mb-8 flex flex-col items-center text-center">
      <Image
        src="/images/brand/florisa-logo.svg"
        alt="فلوریسا"
        width={164}
        height={60}
        priority
        className="h-14 w-auto object-contain"
      />
      <p className="mt-2 text-[10px] font-medium tracking-[0.16em] text-white/35">
        زندگی را سبزتر کن
      </p>
    </header>
  );
}
