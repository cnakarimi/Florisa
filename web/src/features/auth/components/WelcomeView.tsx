import Image from "next/image";
import React from "react";
import { ArrowLeft, Check, Leaf, UserRound } from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";

interface WelcomeViewProps {
  onGoToShop: () => void;
  onGoToProfile: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onGoToShop,
  onGoToProfile,
}) => {
  return (
    <AuthShell>
      <div className="relative z-10 flex flex-1 flex-col items-center text-center">
        <Image
          src="/images/brand/florisa-logo.svg"
          alt="فلوریسا"
          width={150}
          height={54}
          priority
          className="h-12 w-auto object-contain"
        />

        <div className="my-auto flex w-full flex-col items-center py-8">
          <div className="relative grid size-44 place-items-center sm:size-48">
            <div
              className="absolute inset-3 rotate-12 rounded-[42%_58%_45%_55%] border border-[#D4AF37]/10 bg-gradient-to-br from-[#D4AF37]/[0.09] to-transparent"
              aria-hidden="true"
            />
            <Leaf
              className="absolute size-36 -rotate-[28deg] stroke-[0.7] text-[#D4AF37]/10"
              aria-hidden="true"
            />
            <div className="relative grid size-24 place-items-center rounded-full border border-[#D4AF37]/25 bg-[#171913] shadow-[0_20px_60px_rgba(212,175,55,0.12)]">
              <span className="grid size-14 place-items-center rounded-full bg-[#D4AF37] text-[#11130F]">
                <Check className="size-8 stroke-[3.5]" aria-hidden="true" />
              </span>
            </div>
          </div>

          <p className="mt-5 text-[10px] font-extrabold tracking-[0.12em] text-[#D4AF37]">
            همه‌چیز آماده است
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#F2F0EA] sm:text-3xl">
            به فلوریسا خوش آمدی
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-xs leading-6 text-white/45 sm:text-sm">
            حساب کاربری‌ات با موفقیت تکمیل شد. حالا می‌توانی گل‌ها و گیاهان
            فلوریسا را کشف کنی.
          </p>
        </div>

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={onGoToShop}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] text-sm font-extrabold text-[#11130F] shadow-[0_12px_32px_rgba(212,175,55,0.14)] transition hover:bg-[#E3C45D] active:scale-[0.99]"
          >
            ورود به فروشگاه
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onGoToProfile}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.025] text-xs font-bold text-white/55 transition hover:border-white/[0.14] hover:text-white/80"
          >
            <UserRound className="size-4" aria-hidden="true" />
            مشاهده پروفایل من
          </button>
        </div>
      </div>
    </AuthShell>
  );
};
