import React from 'react';
import { User, Package, MapPin, CreditCard, Bell, Shield, ChevronLeft, Gift } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

export const ProfileView: React.FC = () => {
  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-[#181a26] border border-white/10 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5">
            <div className="w-full h-full rounded-full bg-[#12131a] flex items-center justify-center text-white">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">کاربر ویژه برگ و گلدان</h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">0912 345 6789</p>
            <span className="inline-block mt-2 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              عضو سطح طلایی 🌟
            </span>
          </div>
        </div>

        <div className="text-left bg-[#12131a] border border-white/10 p-3 rounded-xl">
          <span className="text-[10px] text-zinc-400 block">کیف پول باشگاه</span>
          <span className="text-sm font-bold text-amber-400">
            {toPersianDigits(150000)} تومان
          </span>
        </div>
      </div>

      {/* Orders Summary Card */}
      <div className="bg-[#181a26] border border-white/10 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>سفارش‌های من</span>
          <span className="text-xs text-amber-400 cursor-pointer hover:underline">مشاهده همه</span>
        </h4>

        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#12131a] border border-white/5">
            <Package className="w-5 h-5 mx-auto mb-1.5 text-amber-400" />
            <span className="text-zinc-300 block font-semibold">جاری (۱)</span>
            <span className="text-[10px] text-zinc-500">در حال ارسال</span>
          </div>

          <div className="p-3 rounded-xl bg-[#12131a] border border-white/5">
            <Package className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
            <span className="text-zinc-300 block font-semibold">تحویل شده (۴)</span>
            <span className="text-[10px] text-zinc-500">تکمیل شده</span>
          </div>

          <div className="p-3 rounded-xl bg-[#12131a] border border-white/5">
            <Gift className="w-5 h-5 mx-auto mb-1.5 text-purple-400" />
            <span className="text-zinc-300 block font-semibold">امتیاز خرید</span>
            <span className="text-[10px] text-amber-400 font-bold">{toPersianDigits(320)} pt</span>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-[#181a26] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 text-xs text-zinc-200">
        <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>آدرس‌های تحویل (تهران، نیاوران، خیابان مژده...)</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-500" />
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>روش‌های پرداخت و کارت‌های شتاب</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-500" />
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-blue-400" />
            <span>تنظیمات یادآور آبیاری و اعلان‌ها</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-500" />
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>پشتیبانی ۷/۲۴ و تضمین تعویض گیاه</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-zinc-500" />
        </div>
      </div>
    </div>
  );
};
