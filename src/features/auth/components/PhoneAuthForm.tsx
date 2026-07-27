"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { InlineError } from "@/features/auth/components/InlineError";
import { PhoneInput } from "@/features/auth/components/PhoneInput";
import {
  phoneFormSchema,
  type PhoneFormValues,
} from "@/features/auth/schemas/auth";
import { storePhone } from "@/features/auth/utils/storage";

export function PhoneAuthForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: "",
    },
    mode: "onChange",
  });

  const submitPhone = async ({ phone }: PhoneFormValues) => {
    storePhone(phone);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    router.push("/auth/verify");
  };

  return (
    <AuthShell>
      <div className="relative z-10 flex flex-1 flex-col">
        <AuthHeader />

        <div className="mb-8 space-y-2 text-right">
          <h1 className="text-2xl font-bold text-[#e5e2e1]">
            ورود / ثبت‌نام
          </h1>
          <p className="text-sm leading-relaxed text-[#c3c7c5]">
            جهت احراز هویت و دسترسی به خدمات فروشگاه botanical، شماره همراه
            خود را وارد نمایید.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(submitPhone)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-right text-xs font-medium text-[#c3c7c5]"
            >
              شماره تلفن همراه
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  hasError={Boolean(fieldState.error)}
                  disabled={isSubmitting}
                />
              )}
            />
            <div className="min-h-5">
              {errors.phone ? (
                <InlineError
                  id="phone-error"
                  message={
                    errors.phone.message ??
                    "لطفاً یک شماره موبایل معتبر وارد کنید"
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#434846]/50 bg-[#20201f]/70 p-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#e9c349]" />
            <p className="text-right text-xs leading-relaxed text-[#c3c7c5]">
              کد یکبار مصرف ۵ رقمی از طریق پیامک برای این شماره ارسال خواهد
              شد.
            </p>
          </div>

          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            disabled={!isValid}
          >
            {isSubmitting ? "در حال انتقال" : "دریافت کد تایید"}
            {!isSubmitting ? (
              <ArrowLeft className="size-5" aria-hidden="true" />
            ) : null}
          </PrimaryButton>
        </form>

        <footer className="mt-auto border-t border-[#434846]/30 pt-6 text-center">
          <p className="text-[11px] text-[#8d9290]">
            با ورود به برگ سبز، قوانین و حریم خصوصی را می‌پذیرید.
          </p>
        </footer>
      </div>
    </AuthShell>
  );
}
