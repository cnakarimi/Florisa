"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthStateScreen } from "@/features/auth/components/AuthStateScreen";
import { InlineError } from "@/features/auth/components/InlineError";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { ResendTimer } from "@/features/auth/components/ResendTimer";
import {
  OTP_LENGTH,
  RESEND_DELAY_SECONDS,
} from "@/features/auth/constants";
import { useAuth } from "@/features/auth/hooks/AuthProvider";
import type { AuthStatus } from "@/features/auth/types";
import {
  normalizeDigits,
  toPersianDigits,
} from "@/features/auth/utils/digits";
import { maskPhone } from "@/features/auth/utils/phone";
import {
  clearPendingPhone,
  readPendingPhone,
} from "@/features/auth/utils/storage";
import { getApiErrorMessage } from "@/lib/api/client";

const EMPTY_OTP = Array<string>(OTP_LENGTH).fill("");

export function OtpVerifyForm() {
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
      router.replace(auth.isProfileComplete ? "/" : "/auth/register");
      return;
    }

    const storedPhone = readPendingPhone();

    if (!storedPhone) {
      router.replace("/auth");
      return;
    }

    setPhone(storedPhone);
  }, [
    auth.initializationError,
    auth.isAuthenticated,
    auth.isInitializing,
    auth.isProfileComplete,
    router,
  ]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const goToPhoneEntry = () => {
    clearPendingPhone();
    router.push("/auth");
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
        user.is_profile_complete ? "/" : "/auth/register",
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

  return (
    <AuthShell className="pt-10">
      <AuthHeader title="تایید شماره موبایل" onBack={goToPhoneEntry} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-1 flex-col"
        noValidate
      >
        <div className="mb-8 space-y-1 text-center">
          <p className="text-base text-[#c3c7c5]">
            کد تایید به شماره زیر ارسال شد
          </p>
          <div
            className="numeric-ltr flex items-center justify-center gap-2 py-1"
            dir="ltr"
          >
            <span className="font-mono text-xl font-bold tracking-widest text-[#e9c349]">
              {toPersianDigits(maskPhone(phone))}
            </span>
          </div>
          <button
            type="button"
            onClick={goToPhoneEntry}
            disabled={isLocked}
            className="mt-1 inline-flex h-6 cursor-pointer items-center gap-1 text-sm font-semibold text-[#e9c349] transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="mb-4 mt-4 min-h-5">
          {error ? (
            <InlineError id="otp-error" message={error} centered />
          ) : null}
        </div>

        <ResendTimer
          initialSeconds={RESEND_DELAY_SECONDS}
          disabled={isLocked}
          onResend={handleResend}
        />

        <div className="mt-auto pb-2 pt-6">
          <PrimaryButton
            type="submit"
            isLoading={isLocked}
            className="rounded-2xl"
          >
            {isLocked ? "در حال بررسی" : "تایید و ادامه"}
            {!isLocked ? (
              <ChevronLeft className="size-5" aria-hidden="true" />
            ) : null}
          </PrimaryButton>
        </div>
      </form>
    </AuthShell>
  );
}
