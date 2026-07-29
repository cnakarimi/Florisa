import React from "react";
import { ArrowLeft, Check, Leaf } from "lucide-react";

interface WelcomeViewProps {
  onGoToShop: () => void;
  onGoToProfile: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onGoToShop,
  onGoToProfile,
}) => {
  return (
    <div className="dir-rtl relative mx-auto flex min-h-screen max-w-md select-none flex-col justify-between bg-[#0d0e12] p-6 text-center font-['Vazirmatn',sans-serif] text-white">
      <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-8 py-6">
        <div className="relative my-2 flex h-60 w-60 items-center justify-center sm:h-64 sm:w-64">
          <div className="absolute inset-0 flex -rotate-12 transform items-center justify-center rounded-[42%_0_42%_0] border border-white/5 bg-[#171921] shadow-2xl">
            <Leaf className="h-40 w-40 stroke-[1] text-zinc-800 opacity-25" />
          </div>

          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border border-amber-500/30 bg-[#272314] shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ebc351] text-black">
              <Check className="h-8 w-8 stroke-[3.5]" />
            </div>
          </div>

          <div className="absolute right-7 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-[#1c221e] text-emerald-400 shadow-lg">
            <Leaf className="h-5 w-5 fill-emerald-500/20 stroke-[2]" />
          </div>
        </div>

        <div className="mx-auto max-w-xs space-y-3 px-2">
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            تبریک!
          </h2>
          <p className="text-xs font-light leading-relaxed text-zinc-300 sm:text-sm">
            حساب کاربری شما با موفقیت تکمیل شد. اکنون می‌توانید از تمامی
            امکانات فلورال استفاده کنید.
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          <button
            type="button"
            onClick={onGoToShop}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ebc351] py-4 text-sm font-extrabold text-black shadow-xl shadow-amber-500/10 transition-all hover:bg-[#dfb43b] active:scale-[0.99] sm:text-base"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5] text-black" />
            <span>ورود به فروشگاه</span>
          </button>

          <button
            type="button"
            onClick={onGoToProfile}
            className="w-full py-3 text-xs font-semibold text-zinc-300 transition-colors hover:text-white sm:text-sm"
          >
            مشاهده پروفایل من
          </button>
        </div>
      </div>
    </div>
  );
};
