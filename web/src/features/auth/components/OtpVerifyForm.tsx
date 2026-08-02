"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit2, MessageSquareText } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthDemoHint } from "@/features/auth/components/AuthDemoHint";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import { InlineError } from "@/features/auth/components/InlineError";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { ResendTimer } from "@/features/auth/components/ResendTimer";
import { OTP_LENGTH, RESEND_DELAY_SECONDS } from "@/features/auth/constants";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import type { AuthStatus } from "@/features/auth/types";
import { normalizeDigits, toPersianDigits } from "@/features/auth/utils/digits";
import { maskPhone, normalizeIranianPhone } from "@/features/auth/utils/phone";
import {
  clearPendingPhone,
  readPendingPhone,
} from "@/features/auth/utils/storage";
import { withNext } from "@/features/auth/utils/redirect";
import { getApiErrorMessage } from "@/lib/api/client";

const EMPTY_OTP = Array<string>(OTP_LENGTH).fill("");
const DEMO_OTP = "12345";

interface OtpVerifyFormProps {
  nextPath?: string;
}

export function OtpVerifyForm({ nextPath = "/" }: OtpVerifyFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [otpRevision, setOtpRevision] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (auth.isInitializing || auth.initializationError) {
      return;
    }

    if (auth.isAuthenticated) {
      router.replace(
        auth.isProfileComplete
          ? nextPath
          : withNext("/auth/register", nextPath),
      );
      return;
    }

    const storedPhone = readPendingPhone();

    if (!storedPhone) {
      router.replace(withNext("/auth", nextPath));
      return;
    }

    setPhone(storedPhone);
  }, [
    auth.initializationError,
    auth.isAuthenticated,
    auth.isInitializing,
    auth.isProfileComplete,
    nextPath,
    router,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const goToPhoneEntry = () => {
    clearPendingPhone();
    router.push(withNext("/auth", nextPath));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    const code = normalizeDigits(otp.join(""));

    if (code.length !== OTP_LENGTH) {
      setError("لطفاً تمامی ۵ رقم کد تایید را وارد نمایید");
      return;
    }

    setError("");
    setStatus("submitting");

    try {
      const user = await auth.verifyOtp(phone, code);
      clearPendingPhone();
      router.replace(
        user.is_profile_complete
          ? nextPath
          : withNext("/auth/register", nextPath),
      );
    } catch (requestError) {
      if (isMountedRef.current) {
        setStatus("idle");
        setError(getApiErrorMessage(requestError, ["code", "phone"]));
      }
    }
  };

  const handleResend = async () => {
    setError("");

    try {
      await auth.requestOtp(phone);
      if (isMountedRef.current) {
        setOtp(Array<string>(OTP_LENGTH).fill(""));
        setOtpRevision((revision) => revision + 1);
      }
    } catch (requestError) {
      if (isMountedRef.current) {
        setError(getApiErrorMessage(requestError, ["phone"]));
      }
      throw requestError;
    }
  };

  if (
    auth.isInitializing ||
    auth.isAuthenticated ||
    auth.initializationError ||
    !phone
  ) {
    return (
      <AuthStateScreen
        error={auth.initializationError}
        onRetry={() => {
          auth.refreshCurrentUser().catch(() => undefined);
        }}
      />
    );
  }

  const isLocked = status === "submitting";
  const isDemoPhone = normalizeIranianPhone(phone) === "09000000000";

  return (
    <AuthShell>
      <div className="relative z-10 flex w-full min-h-0 flex-col">
        <AuthHeader title="تأیید ورود" onBack={goToPhoneEntry} />

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col"
          noValidate
        >
          <div className="mb-4 text-center sm:mb-6">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.07] text-[#D4AF37] sm:mb-4">
              <MessageSquareText className="size-5" aria-hidden="true" />
            </span>

            <h2 className="text-xl font-black tracking-tight text-[#F2F0EA] sm:text-2xl">
              کد تأیید را وارد کن
            </h2>

            <p className="mt-1.5 text-xs leading-5 text-white/45 sm:mt-2 sm:leading-6">
              کد پنج‌رقمی ارسال‌شده به این شماره
            </p>

            <div
              className="numeric-ltr mt-1 flex items-center justify-center gap-2"
              dir="ltr"
            >
              <span className="text-base font-extrabold tracking-[0.12em] text-[#D4AF37]">
                {toPersianDigits(maskPhone(phone))}
              </span>
            </div>

            <button
              type="button"
              onClick={goToPhoneEntry}
              disabled={isLocked}
              className="mt-2 inline-flex h-6 cursor-pointer items-center gap-1 text-[11px] font-bold text-white/40 transition hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Edit2 className="size-3.5" aria-hidden="true" />
              ویرایش شماره موبایل
            </button>
          </div>

          <OtpInput
            key={otpRevision}
            value={otp}
            onChange={(digits) => {
              setOtp(digits);
              setError("");
            }}
            disabled={isLocked}
            hasError={Boolean(error)}
          />

          <div className="mb-2 mt-2 min-h-5 sm:mb-3 sm:mt-3">
            {error ? (
              <InlineError id="otp-error" message={error} centered />
            ) : null}
          </div>

          {isDemoPhone ? (
            <AuthDemoHint
              label="کد ورود دمو"
              value={DEMO_OTP}
              description="برای ورود آزمایشی، این کد را وارد کن؛ پیامکی ارسال نمی‌شود."
              disabled={isLocked}
              onUse={() => {
                setOtp(DEMO_OTP.split(""));
                setError("");
              }}
            />
          ) : null}

          <div className="mt-3 sm:mt-4">
            <ResendTimer
              initialSeconds={RESEND_DELAY_SECONDS}
              disabled={isLocked}
              onResend={handleResend}
            />
          </div>

          <div className="pb-1 pt-4 sm:pt-5">
            <PrimaryButton
              type="submit"
              isLoading={isLocked}
              className="h-14 rounded-2xl bg-[#D4AF37] font-extrabold text-[#11130F] shadow-[0_12px_32px_rgba(212,175,55,0.14)] hover:bg-[#E3C45D]"
            >
              {isLocked ? "در حال بررسی" : "تأیید و ادامه"}

              {!isLocked ? (
                <ChevronLeft className="size-5" aria-hidden="true" />
              ) : null}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
