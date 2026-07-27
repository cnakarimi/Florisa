import React from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, Truck, Clock } from 'lucide-react';

const heroImg = '/images/hero_living_room_1785179404997.jpg';

interface HeroSectionProps {
  onShopClick: () => void;
  onCareClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopClick, onCareClick }) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden my-4 border border-white/10 shadow-2xl bg-[#14151b]">
      {/* Background Image Container */}
      <div className="relative h-[320px] sm:h-[380px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="دکوراسیون با گیاهان خانگی"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1015] via-[#0f1015]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-right">
          {/* Subtitle Pill matching screenshot */}
          <div className="inline-flex items-center gap-1.5 self-start bg-[#1a1c24]/80 backdrop-blur-md text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-medium mb-3 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>دنیای گیاهان خانگی</span>
          </div>

          {/* Main Title matching screenshot "به خونت جون بده" */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md mb-2">
            به خونت جون بده
          </h2>

          <p className="text-zinc-300 text-xs sm:text-sm max-w-md leading-relaxed mb-6 font-light">
            مجموعه‌ای بی‌نظیر از خاص‌ترین گیاهان آپارتمانی و گل‌های تازه همراه با تضمین سلامت و گلدان‌های لوکس
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onShopClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2 group"
            >
              <span>مشاهده محصولات</span>
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onCareClick}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md text-zinc-200 border border-white/20 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              هوش مصنوعی مراقبت
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Strip */}
      <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-[#14161d] border-t border-white/5 text-center text-zinc-300 text-[11px] sm:text-xs">
        <div className="flex items-center justify-center gap-1.5 py-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>تضمین سلامت ۷ روزه</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 py-1 border-r border-l border-white/10">
          <Truck className="w-4 h-4 text-amber-400" />
          <span>ارسال ایمن و تخصصی</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 py-1">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>مشاوره تخصصی آنلاین</span>
        </div>
      </div>
    </div>
  );
};
