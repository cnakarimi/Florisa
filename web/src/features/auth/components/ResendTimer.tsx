"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { toPersianDigits } from "@/features/auth/utils/digits";

interface ResendTimerProps {
  initialSeconds: number;
  onResend: () => Promise<void> | void;
  disabled?: boolean;
}

export function ResendTimer({
  initialSeconds,
  onResend,
  disabled = false,
}: ResendTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimeLeft((currentTime) => currentTime - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [timeLeft]);

  const handleResend = async () => {
    if (timeLeft > 0 || isResending || disabled) {
      return;
    }

    setIsResending(true);
    try {
      await onResend();
      setTimeLeft(initialSeconds);
    } catch {
      // The parent displays the API error in the existing inline error area.
    } finally {
      setIsResending(false);
    }
  };

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  return (
    <div className="flex min-h-[58px] flex-col items-center gap-2.5">
      <div
        className="numeric-ltr flex h-5 items-center gap-2 text-white/40"
        dir="ltr"
        aria-live="polite"
      >
        {timeLeft > 0 ? (
          <>
            <Clock className="size-3.5 text-white/30" aria-hidden="true" />
            <span className="text-sm font-semibold tabular-nums">
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
        className="h-5 cursor-pointer text-xs font-bold text-[#D4AF37] transition hover:text-[#E3C45D] disabled:cursor-not-allowed disabled:text-white/30 disabled:no-underline"
      >
        {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
      </button>
    </div>
  );
}
