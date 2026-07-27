"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { MOCK_REQUEST_DELAY_MS } from "@/features/auth/constants";
import { toPersianDigits } from "@/features/auth/utils/digits";

interface ResendTimerProps {
  initialSeconds: number;
  onResend: () => void;
  disabled?: boolean;
}

export function ResendTimer({
  initialSeconds,
  onResend,
  disabled = false,
}: ResendTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);
  const resendTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimeLeft((currentTime) => currentTime - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (resendTimeoutRef.current !== null) {
        window.clearTimeout(resendTimeoutRef.current);
      }
    };
  }, []);

  const handleResend = () => {
    if (timeLeft > 0 || isResending || disabled) {
      return;
    }

    setIsResending(true);
    resendTimeoutRef.current = window.setTimeout(() => {
      onResend();
      setTimeLeft(initialSeconds);
      setIsResending(false);
      resendTimeoutRef.current = null;
    }, MOCK_REQUEST_DELAY_MS);
  };

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="flex min-h-[68px] flex-col items-center gap-3">
      <div
        className="numeric-ltr flex h-5 items-center gap-2 text-[#c3c7c5]"
        dir="ltr"
        aria-live="polite"
      >
        {timeLeft > 0 ? (
          <>
            <Clock className="size-4 text-[#8d9290]" aria-hidden="true" />
            <span className="font-mono text-sm font-semibold tabular-nums">
              {toPersianDigits(formattedTime)}
            </span>
          </>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleResend}
        disabled={timeLeft > 0 || isResending || disabled}
        aria-busy={isResending}
        className="h-5 cursor-pointer text-sm font-semibold text-[#e9c349] transition-opacity hover:underline disabled:cursor-not-allowed disabled:text-[#8d9290] disabled:opacity-50 disabled:no-underline"
      >
        {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
      </button>
    </div>
  );
}
