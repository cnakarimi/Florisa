"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit2 } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { InlineError } from "@/features/auth/components/InlineError";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { ResendTimer } from "@/features/auth/components/ResendTimer";
import {
  MOCK_REQUEST_DELAY_MS,
  MOCK_OTP,
  OTP_LENGTH,
  RESEND_DELAY_SECONDS,
} from "@/features/auth/constants";
import type { AuthStatus } from "@/features/auth/types";
import { toPersianDigits } from "@/features/auth/utils/digits";
import { maskPhone } from "@/features/auth/utils/phone";
import {
  readPhone,
  storeVerification,
} from "@/features/auth/utils/storage";

const EMPTY_OTP = Array<string>(OTP_LENGTH).fill("");

export function OtpVerifyForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [otpRevision, setOtpRevision] = useState(0);
  const verificationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const storedPhone = readPhone();

    if (!storedPhone) {
      router.replace("/auth");
      return;
    }

    setPhone(storedPhone);
  }, [router]);

  useEffect(() => {
    return () => {
      if (verificationTimeoutRef.current !== null) {
        window.clearTimeout(verificationTimeoutRef.current);
      }
    };
  }, []);

  const goToPhoneEntry = () => {
    router.push("/auth");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError("لطفاً تمامی ۵ رقم کد تایید را وارد نمایید");
      return;
    }

    setError("");
    setStatus("submitting");

    verificationTimeoutRef.current = window.setTimeout(() => {
      if (code === MOCK_OTP) {
        storeVerification(true);
        verificationTimeoutRef.current = null;
        router.replace("/");
        return;
      }

      setStatus("idle");
      setError("کد تایید وارد شده صحیح نیست");
      verificationTimeoutRef.current = null;
    }, MOCK_REQUEST_DELAY_MS);
  };

  if (!phone) {
    return <div className="min-h-dvh bg-[#131313]" aria-label="در حال بارگذاری" />;
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
          disabled={status === "submitting"}
          onResend={() => {
            setOtp(Array<string>(OTP_LENGTH).fill(""));
            setError("");
            setStatus("idle");
            setOtpRevision((revision) => revision + 1);
          }}
        />

        <div className="mt-auto pb-2 pt-6">
          <PrimaryButton
            type="submit"
            isLoading={status === "submitting"}
            className="rounded-2xl"
          >
            {status === "submitting" ? "در حال بررسی" : "تایید و ادامه"}
            {status === "idle" ? (
              <ChevronLeft className="size-5" aria-hidden="true" />
            ) : null}
          </PrimaryButton>
        </div>
      </form>
    </AuthShell>
  );
}
