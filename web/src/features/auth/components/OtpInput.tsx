"use client";

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useRef,
} from "react";
import { cn } from "@/lib/cn";
import { OTP_LENGTH } from "@/features/auth/constants";
import type { OtpInputProps } from "@/features/auth/types";
import { normalizeDigits, toPersianDigits } from "@/features/auth/utils/digits";

export function OtpInput({
  value,
  onChange,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const fillDigits = (rawValue: string, startIndex = 0) => {
    const digits = normalizeDigits(rawValue).replace(/\D/g, "");

    if (!digits) {
      return;
    }

    const nextValue = [...value];
    digits
      .slice(0, OTP_LENGTH - startIndex)
      .split("")
      .forEach((digit, offset) => {
        nextValue[startIndex + offset] = digit;
      });

    onChange(nextValue);
    const focusIndex = Math.min(startIndex + digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = normalizeDigits(event.target.value);

    if (inputValue.length > 1) {
      fillDigits(inputValue, index);
      return;
    }

    if (inputValue && !/^\d$/.test(inputValue)) {
      return;
    }

    const nextValue = [...value];
    nextValue[index] = inputValue;
    onChange(nextValue);

    if (inputValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillDigits(event.clipboardData.getData("text"));
  };

  return (
    <div
      className="numeric-ltr grid w-full grid-cols-5 gap-2 sm:gap-3"
      dir="ltr"
      role="group"
      aria-label="کد تأیید پنج رقمی"
    >
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={toPersianDigits(digit)}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={index === 0}
          aria-label={`رقم ${index + 1} کد تأیید`}
          aria-invalid={hasError}
          aria-describedby={hasError ? "otp-error" : undefined}
          className={cn(
            "h-14 min-w-0 w-full rounded-2xl border bg-white/[0.035] text-center font-mono text-xl font-extrabold text-[#F2F0EA] outline-none transition-[border-color,background-color,box-shadow,transform] focus:-translate-y-0.5 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[60px] sm:text-2xl",
            hasError
              ? "border-[#FF8A80]/70 focus:border-[#FF8A80] focus:ring-4 focus:ring-[#FF8A80]/[0.06]"
              : digit
                ? "border-[#D4AF37]/70 bg-[#D4AF37]/[0.07] text-[#F1D56D]"
                : "border-white/[0.09] focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/[0.07]",
          )}
        />
      ))}
    </div>
  );
}
