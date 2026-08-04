"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Bell,
  Wallet,
  Bookmark,
  Headphones,
  Phone,
  Info,
  ShieldCheck,
  FileText,
  LogOut,
  Pencil,
  ChevronLeft,
  X,
  Check,
  PhoneCall,
  Mail,
} from "lucide-react";
import type { TabType } from "../types";
import { toPersianDigits } from "../utils/persian";

type ActiveModal =
  | "edit_profile"
  | "addresses"
  | "orders"
  | "support"
  | "contact"
  | "about"
  | "privacy"
  | "terms"
  | "notifications"
  | "logout_confirm"
  | null;

interface ProfileViewProps {
  phone: string;
  fullName?: string;
  email?: string | null;
  onLogout: () => void | Promise<void>;
  logoutPending?: boolean;
  logoutError?: string;
  onNavigateToCart?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToTab?: (tab: TabType) => void;
  cartCount?: number;
}

export function ProfileView({
  phone,
  fullName = "",
  email = null,
  onLogout,
  logoutPending = false,
  logoutError = "",
  onNavigateToCart,
  onNavigateToOrders,
  onNavigateToTab,
  cartCount = 0,
}: ProfileViewProps) {
  const [userName, setUserName] = useState(fullName.trim());
  const userPhone = phone;
  const [userEmail, setUserEmail] = useState(email ?? "");
  const [userAddress] = useState(
    "تهران، نیاوران، خیابان مژده، پلاک ۲۴، واحد ۵",
  );
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  const avatarUrl =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveSuccess(true);
    saveTimeoutRef.current = window.setTimeout(() => {
      setSaveSuccess(false);
      setActiveModal(null);
      saveTimeoutRef.current = null;
    }, 1200);
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="dir-rtl mx-auto max-w-md space-y-5 px-1 py-4 font-['Vazirmatn',sans-serif]">
      <div className="flex items-center justify-between border-b border-white/5 px-1 pb-3 pt-1">
        <h1 className="text-2xl font-black tracking-tight text-[#e5c158]">
          فلورا
        </h1>

        <button
          type="button"
          onClick={onNavigateToCart}
          className="relative rounded-full p-2 text-zinc-300 transition-all hover:bg-white/5 hover:text-amber-400"
          aria-label="سبد خرید"
        >
          <ShoppingBag className="size-6 stroke-[1.8]" aria-hidden="true" />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-black">
              {toPersianDigits(cartCount)}
            </span>
          ) : null}
        </button>
      </div>

      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex flex-col text-right">
          <span className="mb-0.5 flex items-center gap-1.5 text-xs font-medium text-zinc-300 sm:text-sm">
            سلام {userName.split(/\s+/)[0]}{" "}
            <span className="text-base">👋</span>
          </span>
          <h2 className="mb-1 text-xl font-black leading-tight text-white sm:text-2xl">
            {userName}
          </h2>
          <bdi
            dir="ltr"
            className="numeric-ltr font-mono text-xs tracking-wider text-zinc-400"
          >
            {toPersianDigits(userPhone)}
          </bdi>
        </div>

        <div className="relative">
          <div className="size-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-lg shadow-amber-500/10 sm:size-22">
            <Image
              src={avatarUrl}
              alt={userName}
              width={88}
              height={88}
              sizes="(max-width: 639px) 80px, 88px"
              quality={75}
              className="size-full rounded-full bg-zinc-800 object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveModal("edit_profile")}
            className="absolute bottom-0 right-0 rounded-full border-2 border-[#0d0e12] bg-amber-400 p-1.5 text-black shadow-md transition-all hover:bg-amber-300"
            aria-label="ویرایش حساب"
          >
            <Pencil className="size-3.5 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-[#121617] shadow-lg">
        <button
          type="button"
          onClick={() => setActiveModal("edit_profile")}
          className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-white/[0.03]"
        >
          <span className="flex items-center gap-3">
            <User className="size-5 stroke-[2] text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-100">
              اطلاعات شخصی
            </span>
          </span>
          <ChevronLeft className="size-5 text-zinc-500" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("addresses")}
          className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-white/[0.03]"
        >
          <span className="flex items-center gap-3">
            <MapPin className="size-5 stroke-[2] text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-100">
              آدرس‌های ذخیره شده
            </span>
          </span>
          <ChevronLeft className="size-5 text-zinc-500" aria-hidden="true" />
        </button>
      </div>

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-[#121617] shadow-lg">
        <button
          type="button"
          onClick={() => {
            if (onNavigateToOrders) onNavigateToOrders();
            else setActiveModal("orders");
          }}
          className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-white/[0.03]"
        >
          <span className="flex items-center gap-3">
            <ShoppingBag className="size-5 stroke-[2] text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-100">
              سفارش‌های من
            </span>
          </span>
          <ChevronLeft className="size-5 text-zinc-500" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateToTab?.("favorites")}
          className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-white/[0.03]"
        >
          <span className="flex items-center gap-3">
            <Heart className="size-5 stroke-[2] text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-100">
              علاقه‌مندی‌ها
            </span>
          </span>
          <ChevronLeft className="size-5 text-zinc-500" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setActiveModal("notifications")}
          className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-white/[0.03]"
        >
          <span className="flex items-center gap-3">
            <Bell className="size-5 stroke-[2] text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-100">
              اطلاع‌رسانی‌ها
            </span>
          </span>
          <ChevronLeft className="size-5 text-zinc-500" aria-hidden="true" />
        </button>
      </div>

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-[#121617] shadow-lg">
        <div className="flex w-full items-center justify-between p-4 opacity-80">
          <div className="flex items-center gap-3">
            <Wallet className="size-5 stroke-[2] text-amber-400/80" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-200">کیف پول</span>
          </div>
          <span className="rounded-md border border-white/5 bg-[#1e2326] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
            به زودی
          </span>
        </div>

        <div className="flex w-full items-center justify-between p-4 opacity-80">
          <div className="flex items-center gap-3">
            <Bookmark className="size-5 stroke-[2] text-amber-400/80" aria-hidden="true" />
            <span className="text-sm font-semibold text-zinc-200">
              مقالات ذخیره شده
            </span>
          </div>
          <span className="rounded-md border border-white/5 bg-[#1e2326] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
            به زودی
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-[#121617] shadow-lg">
        {[
          { id: "support", label: "پشتیبانی", icon: Headphones },
          { id: "contact", label: "تماس با ما", icon: Phone },
          { id: "about", label: "درباره ما", icon: Info },
          { id: "privacy", label: "سیاست حریم خصوصی", icon: ShieldCheck },
          { id: "terms", label: "شرایط و قوانین", icon: FileText },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveModal(item.id as ActiveModal)}
              className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-white/[0.03]"
            >
              <span className="flex items-center gap-3">
                <Icon className="size-5 stroke-[2] text-amber-400" aria-hidden="true" />
                <span className="text-sm font-semibold text-zinc-100">
                  {item.label}
                </span>
              </span>
              <ChevronLeft className="size-5 text-zinc-500" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setActiveModal("logout_confirm")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-[#14161b] px-4 py-3.5 text-sm font-bold text-rose-300 shadow-sm transition-all hover:bg-rose-500/10"
        >
          <LogOut className="size-5 text-rose-400" aria-hidden="true" />
          <span>خروج از حساب کاربری</span>
        </button>
      </div>

      {activeModal === "edit_profile" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#161822] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 id="edit-profile-title" className="text-base font-bold text-white">
                ویرایش اطلاعات شخصی
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="بستن"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="profile-name" className="mb-1 block text-zinc-400">
                  نام و نام خانوادگی:
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#101117] p-3 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="profile-phone" className="mb-1 block text-zinc-400">
                  شماره همراه:
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  value={userPhone}
                  readOnly
                  className="numeric-ltr w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#101117] p-3 font-mono text-zinc-400"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="mb-1 block text-zinc-400">
                  آدرس ایمیل:
                </label>
                <input
                  id="profile-email"
                  type="email"
                  dir="ltr"
                  value={userEmail}
                  onChange={(event) => setUserEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#101117] p-3 font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-extrabold text-black transition-all hover:bg-amber-300"
              >
                {saveSuccess ? (
                  <>
                    <Check className="size-4 text-black" aria-hidden="true" />
                    <span>تغییرات با موفقیت ذخیره شد</span>
                  </>
                ) : (
                  <span>ذخیره اطلاعات</span>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {activeModal === "addresses" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="addresses-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#161822] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 id="addresses-title" className="text-base font-bold text-white">
                آدرس‌های ذخیره شده
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="بستن"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-amber-400/30 bg-[#101117] p-3.5 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-400">
                <span>آدرس اصلی (منزل)</span>
                <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px]">
                  پیش‌فرض
                </span>
              </div>
              <p className="font-light leading-relaxed text-zinc-300">
                {userAddress}
              </p>
              <bdi
                dir="ltr"
                className="numeric-ltr block text-[10px] text-zinc-500"
              >
                کدپستی: ۱۹۸۳۴۷۲۸۱۹
              </bdi>
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-dashed border-white/20 py-2.5 text-xs font-semibold text-amber-400 hover:border-amber-400"
            >
              + افزودن آدرس جدید
            </button>
          </div>
        </div>
      ) : null}

      {activeModal === "orders" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="orders-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#161822] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 id="orders-title" className="text-base font-bold text-white">
                تاریخچه سفارش‌ها
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="بستن"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto">
              <div className="space-y-2 rounded-xl border border-white/5 bg-[#101117] p-3.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <bdi dir="ltr" className="text-white">
                    سفارش #FL-9021
                  </bdi>
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                    در حال ارسال 🚚
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  اقلام: سانسوریا پوست ماری + گلدان مشکی مات
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-1 text-zinc-300">
                  <span className="text-[10px] text-zinc-500">
                    تاریخ: ۵ مرداد ۱۴۰۵
                  </span>
                  <bdi
                    dir="ltr"
                    className="numeric-ltr font-extrabold text-amber-400"
                  >
                    ۴۰۰,۰۰۰ تومان
                  </bdi>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeModal === "support" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#161822] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3
                id="support-title"
                className="flex items-center gap-2 text-base font-bold text-white"
              >
                <Headphones className="size-5 text-amber-400" aria-hidden="true" />
                <span>پشتیبانی و مشاوره تخصصی</span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="بستن"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs font-light leading-relaxed text-zinc-300">
              تیم کارشناسان گیاه‌پزشک و پشتیبانی فلورا همه‌روزه از ساعت ۹ صبح
              تا ۹ شب پاسخگوی سوالات شما درباره نگهداری و تعویض گیاهان هستند.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#101117] p-3">
                <PhoneCall className="size-4 text-emerald-400" aria-hidden="true" />
                <bdi dir="ltr" className="text-zinc-200">
                  شماره پشتیبانی: ۰۲۱-۸۸۹۹۰۰۱۱
                </bdi>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#101117] p-3">
                <Mail className="size-4 text-amber-400" aria-hidden="true" />
                <bdi dir="ltr" className="text-zinc-200">
                  ایمیل: support@flora-plants.ir
                </bdi>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeModal === "contact" ||
      activeModal === "about" ||
      activeModal === "privacy" ||
      activeModal === "terms" ||
      activeModal === "notifications" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="information-title"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#161822] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 id="information-title" className="text-base font-bold text-white">
                {activeModal === "contact" ? "تماس با ما" : null}
                {activeModal === "about" ? "درباره فروشگاه فلورا" : null}
                {activeModal === "privacy" ? "سیاست حریم خصوصی" : null}
                {activeModal === "terms" ? "شرایط و قوانین استفاده" : null}
                {activeModal === "notifications"
                  ? "تنظیمات اطلاع‌رسانی‌ها"
                  : null}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 text-zinc-400 hover:text-white"
                aria-label="بستن"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs font-light leading-relaxed text-zinc-300">
              {activeModal === "about"
                ? "فروشگاه آنلاین فلورا ارائه‌دهنده خاص‌ترین و باکیفیت‌ترین گیاهان خانگی و آپارتمانی همراه با ضمانت سلامت و گلدان‌های لوکس دکوراتیو است."
                : null}
              {activeModal === "contact"
                ? "دفتر مرکزی: تهران، خیابان ولیعصر، نرسیده به تجریش، مجتمع اداری فلورا، طبقه ۴."
                : null}
              {activeModal === "privacy"
                ? "تمامی اطلاعات شخصی شما نزد فلورا کاملاً محفوظ است و صرفاً جهت پردازش و ارسال بهتر سفارش‌ها استفاده خواهد شد."
                : null}
              {activeModal === "terms"
                ? "خرید از فلورا شامل ۷ روز گارانتی سلامت و تعویض گیاه در صورت عدم رضایت یا آسیب در ارسال می‌باشد."
                : null}
              {activeModal === "notifications"
                ? "اعلان‌های یادآور آبیاری و کدهای تخفیف به شماره همراه شما ارسال می‌گردد."
                : null}
            </p>

            <button
              type="button"
              onClick={closeModal}
              className="w-full rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-black"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      ) : null}

      {activeModal === "logout_confirm" ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-[#161822] p-6 text-right shadow-2xl">
            <h3 id="logout-title" className="text-base font-bold text-white">
              خروج از حساب کاربری
            </h3>
            <p className="text-xs text-zinc-400">
              آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onLogout}
                disabled={logoutPending}
                aria-busy={logoutPending}
                aria-describedby={logoutError ? "logout-error" : undefined}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white hover:bg-rose-600"
              >
                {logoutPending
                  ? "در حال خروج..."
                  : logoutError
                    ? "تلاش مجدد"
                    : "بله، خروج"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
              >
                انصراف
              </button>
            </div>
            {logoutError ? (
              <span id="logout-error" className="sr-only" aria-live="polite">
                {logoutError}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
