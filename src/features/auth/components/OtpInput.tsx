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
import {
  normalizeDigits,
  toPersianDigits,
} from "@/features/auth/utils/digits";

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
    const focusIndex = Math.min(
      startIndex + digits.length,
      OTP_LENGTH - 1,
    );
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
      className="numeric-ltr flex w-full flex-row justify-center gap-3"
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
            "size-14 min-w-0 rounded-2xl border bg-[#20201f] text-center font-mono text-2xl font-bold text-[#e5e2e1] outline-none transition-colors focus:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60",
            hasError
              ? "border-[#ffb4ab] focus:border-[#ffb4ab]"
              : digit
                ? "border-[#e9c349]"
                : "border-[#434846] focus:border-[#e9c349]",
          )}
        />
      ))}
    </div>
  );
}
