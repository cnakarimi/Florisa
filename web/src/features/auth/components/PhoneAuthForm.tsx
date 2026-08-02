"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthDemoHint } from "@/features/auth/components/AuthDemoHint";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import { InlineError } from "@/features/auth/components/InlineError";
import { PhoneInput } from "@/features/auth/components/PhoneInput";
import {
  phoneFormSchema,
  type PhoneFormValues,
} from "@/features/auth/schemas/auth";
import { normalizeIranianPhone } from "@/features/auth/utils/phone";
import { storePendingPhone } from "@/features/auth/utils/storage";
import { withNext } from "@/features/auth/utils/redirect";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import { getApiErrorMessage } from "@/lib/api/client";

interface PhoneAuthFormProps {
  nextPath?: string;
}

export function PhoneAuthForm({ nextPath = "/" }: PhoneAuthFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!auth.isInitializing && auth.isAuthenticated) {
      router.replace(
        auth.isProfileComplete
          ? nextPath
          : withNext("/auth/register", nextPath),
      );
    }
  }, [
    auth.isAuthenticated,
    auth.isInitializing,
    auth.isProfileComplete,
    nextPath,
    router,
  ]);

  const submitPhone = async ({ phone }: PhoneFormValues) => {
    const normalizedPhone = normalizeIranianPhone(phone);

    try {
      await auth.requestOtp(normalizedPhone);
      storePendingPhone(normalizedPhone);
      router.push(withNext("/auth/verify", nextPath));
    } catch (error) {
      setError("phone", {
        type: "server",
        message: getApiErrorMessage(error, ["phone"]),
      });
    }
  };

  if (auth.isInitializing || auth.isAuthenticated || auth.initializationError) {
    return (
      <AuthStateScreen
        error={auth.initializationError}
        onRetry={() => {
          auth.refreshCurrentUser().catch(() => undefined);
        }}
      />
    );
  }

  return (
    <AuthShell>
      <div className="relative z-10 flex w-full min-h-0 flex-col">
        <AuthHeader />
        <div className="mb-4 space-y-1.5 text-center sm:mb-6 sm:space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-[#F2F0EA] sm:text-[28px]">
            ورود یا ثبت‌نام
          </h1>
        </div>
        <form
          onSubmit={handleSubmit(submitPhone)}
          className="space-y-3 sm:space-y-4"
          noValidate
        >
          <div className="space-y-2.5 mt-6">
            <label
              htmlFor="phone"
              className="block pr-1 text-right text-xs font-bold text-white/65"
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
            <div className="min-h-5 px-1">
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

          <AuthDemoHint
            label="شماره موبایل دمو"
            value="09000000000"
            description="برای تست پروژه بدون پیامک واقعی، از این شماره استفاده کن."
            disabled={isSubmitting}
            onUse={() => {
              setValue("phone", "09000000000", {
                shouldDirty: true,
                shouldValidate: true,
              });
              clearErrors("phone");
            }}
          />

          <PrimaryButton
            type="submit"
            isLoading={isSubmitting}
            disabled={!isValid}
            className="mt-2 h-14 rounded-2xl bg-[#D4AF37] font-extrabold text-[#11130F] shadow-[0_12px_32px_rgba(212,175,55,0.14)] hover:bg-[#E3C45D]"
          >
            {isSubmitting ? "در حال ارسال..." : "دریافت کد تأیید"}
            {!isSubmitting ? (
              <ArrowLeft className="size-5" aria-hidden="true" />
            ) : null}
          </PrimaryButton>
        </form>
        <footer className="pt-4 text-center sm:pt-6">
          <p className="inline-flex items-center justify-center gap-1.5 text-[10px] leading-5 text-white/30">
            <LockKeyhole
              className="size-3.5 text-[#D4AF37]/60"
              aria-hidden="true"
            />
            با ورود به فلوریسا، قوانین و حریم خصوصی را می‌پذیری.
          </p>
        </footer>
      </div>
    </AuthShell>
  );
}
