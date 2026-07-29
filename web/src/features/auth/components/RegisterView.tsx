"use client";

import React, { useState } from "react";
import { X, Check, User, Mail } from "lucide-react";

export interface RegistrationFormData {
  fullName: string;
  email: string;
}

export interface RegistrationFieldErrors {
  full_name?: string;
  email?: string;
}

interface RegisterViewProps {
  onComplete: (userData: RegistrationFormData) => Promise<void>;
  onSkip: () => void;
  onClose: () => void;
  onFieldChange?: (field: keyof RegistrationFieldErrors) => void;
  isSubmitting?: boolean;
  fieldErrors?: RegistrationFieldErrors;
  generalError?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterView: React.FC<RegisterViewProps> = ({
  onComplete,
  onSkip,
  onClose,
  onFieldChange,
  isSubmitting = false,
  fieldErrors = {},
  generalError = "",
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [localErrors, setLocalErrors] =
    useState<RegistrationFieldErrors>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const validationErrors: RegistrationFieldErrors = {};

    if (!trimmedName) {
      validationErrors.full_name =
        "نام و نام خانوادگی را وارد کنید.";
    }
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
      validationErrors.email = "یک ایمیل معتبر وارد کنید.";
    }

    setLocalErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onComplete({
      fullName: trimmedName,
      email: trimmedEmail,
    });
  };

  const fullNameError = localErrors.full_name ?? fieldErrors.full_name;
  const emailError = localErrors.email ?? fieldErrors.email;

  return (
    <div className="dir-rtl relative mx-auto flex min-h-screen max-w-md select-none flex-col justify-between bg-[#0d0e12] p-4 text-right font-['Vazirmatn',sans-serif] text-white sm:p-6">
      <div className="flex items-center justify-between pb-6 pt-2">
        <h1 className="text-2xl font-black tracking-tight text-[#ebc351]">
          فلورال
        </h1>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-full p-2 text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
          title="بستن"
        >
          <X className="h-6 w-6 stroke-[2]" />
        </button>
      </div>

      <div className="my-auto flex flex-1 flex-col items-center justify-center space-y-6 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-[#272314] text-amber-400 shadow-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3b839] text-black">
            <Check className="h-5 w-5 stroke-[3]" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-xs font-extrabold text-[#ebc351] sm:text-sm">
            شماره موبایل شما تأیید شد
          </p>
          <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            حساب کاربری‌تان را تکمیل کنید
          </h2>
          <p className="mx-auto max-w-xs text-xs font-light leading-relaxed text-zinc-400">
            برای ثبت سفارش و استفاده بهتر از فلورال، نام خود را وارد کنید.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 pt-2 text-right"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="registration-full-name"
              className="block pr-1 text-xs font-semibold text-zinc-300"
            >
              نام و نام خانوادگی
            </label>
            <div className="relative">
              <input
                id="registration-full-name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setLocalErrors((errors) => ({
                    ...errors,
                    full_name: undefined,
                  }));
                  onFieldChange?.("full_name");
                }}
                disabled={isSubmitting}
                aria-invalid={Boolean(fullNameError)}
                aria-describedby={
                  fullNameError ? "registration-full-name-error" : undefined
                }
                placeholder="مثلاً سینا کریمی"
                className="w-full rounded-2xl border border-white/10 bg-[#161820] py-3.5 pl-4 pr-11 text-xs text-white placeholder-zinc-500 transition-colors focus:border-amber-400 focus:outline-none disabled:opacity-60 sm:text-sm"
              />
              <User className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            </div>
            {fullNameError ? (
              <p
                id="registration-full-name-error"
                role="alert"
                className="pr-1 text-[11px] text-rose-300"
              >
                {fullNameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="registration-email"
                className="text-xs font-semibold text-zinc-300"
              >
                ایمیل
              </label>
              <span className="text-[11px] text-zinc-500">اختیاری</span>
            </div>
            <div className="relative">
              <input
                id="registration-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLocalErrors((errors) => ({
                    ...errors,
                    email: undefined,
                  }));
                  onFieldChange?.("email");
                }}
                disabled={isSubmitting}
                aria-invalid={Boolean(emailError)}
                aria-describedby={
                  emailError ? "registration-email-error" : undefined
                }
                placeholder="example@email.com"
                dir="ltr"
                className="w-full rounded-2xl border border-white/10 bg-[#161820] py-3.5 pl-4 pr-11 text-right text-xs text-white placeholder-zinc-500 transition-colors focus:border-amber-400 focus:outline-none disabled:opacity-60 sm:text-sm"
              />
              <Mail className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            </div>
            {emailError ? (
              <p
                id="registration-email-error"
                role="alert"
                className="pr-1 text-[11px] text-rose-300"
              >
                {emailError}
              </p>
            ) : null}
          </div>

          {generalError ? (
            <p role="alert" className="text-center text-xs text-rose-300">
              {generalError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-[#ebc351] py-4 text-sm font-extrabold text-black shadow-xl shadow-amber-500/10 transition-all hover:bg-[#dfb43b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {isSubmitting ? "در حال تکمیل..." : "تکمیل ثبت‌نام"}
          </button>
        </form>

        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="pt-1 text-xs font-semibold text-zinc-300 transition-colors hover:text-white disabled:opacity-50 sm:text-sm"
        >
          بعداً تکمیل می‌کنم
        </button>
      </div>

      <div className="border-t border-white/5 py-4 text-center">
        <p className="mx-auto max-w-xs text-[11px] font-light leading-relaxed text-zinc-500">
          اطلاعات شما فقط برای ثبت سفارش و ارتباط بهتر استفاده می‌شود.
        </p>
      </div>
    </div>
  );
};
