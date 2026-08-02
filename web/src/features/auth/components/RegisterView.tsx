"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ArrowLeft, Check, Mail, User, X } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthShell } from "@/features/auth/components/AuthShell";

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
  const [localErrors, setLocalErrors] = useState<RegistrationFieldErrors>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const validationErrors: RegistrationFieldErrors = {};

    if (!trimmedName) {
      validationErrors.full_name = "نام و نام خانوادگی را وارد کنید.";
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
    <AuthShell className="overflow-y-auto pt-6 sm:pt-7">
      <div className="relative z-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="grid size-10 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-white/50 transition hover:border-[#D4AF37]/25 hover:text-[#D4AF37] disabled:opacity-50"
          aria-label="بستن"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <Image
          src="/images/brand/florisa-logo.svg"
          alt="فلوریسا"
          width={120}
          height={44}
          priority
          className="h-10 w-auto object-contain"
        />

        <div className="size-10" aria-hidden="true" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col pt-7">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.08] shadow-[0_12px_35px_rgba(212,175,55,0.08)]">
            <span className="grid size-8 place-items-center rounded-xl bg-[#D4AF37] text-[#11130F]">
              <Check className="size-[18px] stroke-[3]" aria-hidden="true" />
            </span>
          </div>

          <p className="mt-4 text-[10px] font-extrabold tracking-[0.1em] text-[#D4AF37]">
            شماره موبایل تأیید شد
          </p>
          <h1 className="mt-2 text-xl font-black tracking-tight text-[#F2F0EA] sm:text-2xl">
            فقط یک قدم تا فلوریسا
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-white/40">
            نامت را وارد کن تا حساب کاربری و تجربه خریدت شخصی‌تر شود.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 text-right"
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="registration-full-name"
              className="block pr-1 text-xs font-bold text-white/65"
            >
              نام و نام خانوادگی
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-white/30"
                aria-hidden="true"
              />
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
                className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] pl-4 pr-12 text-sm text-[#F2F0EA] outline-none transition placeholder:text-white/20 hover:border-white/[0.14] focus:border-[#D4AF37]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#D4AF37]/[0.07] disabled:opacity-60"
              />
            </div>
            {fullNameError ? (
              <p
                id="registration-full-name-error"
                role="alert"
                className="pr-1 text-[11px] text-[#FFAAA2]"
              >
                {fullNameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="registration-email"
                className="text-xs font-bold text-white/65"
              >
                ایمیل
              </label>
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/30">
                اختیاری
              </span>
            </div>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-white/30"
                aria-hidden="true"
              />
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
                className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] pl-4 pr-12 text-left text-sm text-[#F2F0EA] outline-none transition placeholder:text-white/20 hover:border-white/[0.14] focus:border-[#D4AF37]/60 focus:bg-white/[0.055] focus:ring-4 focus:ring-[#D4AF37]/[0.07] disabled:opacity-60"
              />
            </div>
            {emailError ? (
              <p
                id="registration-email-error"
                role="alert"
                className="pr-1 text-[11px] text-[#FFAAA2]"
              >
                {emailError}
              </p>
            ) : null}
          </div>

          {generalError ? (
            <p role="alert" className="text-center text-xs text-[#FFAAA2]">
              {generalError}
            </p>
          ) : null}

          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            className="mt-2 h-14 rounded-2xl bg-[#D4AF37] font-extrabold text-[#11130F] shadow-[0_12px_32px_rgba(212,175,55,0.14)] hover:bg-[#E3C45D]"
          >
            {isSubmitting ? "در حال تکمیل..." : "تکمیل حساب کاربری"}
            {!isSubmitting ? (
              <ArrowLeft className="size-5" aria-hidden="true" />
            ) : null}
          </PrimaryButton>
        </form>

        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="mx-auto mt-4 px-3 py-2 text-[11px] font-bold text-white/35 transition hover:text-white/65 disabled:opacity-50"
        >
          بعداً تکمیل می‌کنم
        </button>

        <p className="mt-auto border-t border-white/[0.05] pt-5 text-center text-[10px] leading-5 text-white/25">
          اطلاعاتت فقط برای ثبت سفارش و ارتباط بهتر استفاده می‌شود.
        </p>
      </div>
    </AuthShell>
  );
};
