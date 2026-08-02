import type { ChangeEvent } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { normalizeDigits, toPersianDigits } from "@/features/auth/utils/digits";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  hasError = false,
  disabled = false,
}: PhoneInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = normalizeDigits(event.target.value).replace(/\D/g, "");
    onChange(nextValue.slice(0, 11));
  };

  return (
    <div className="numeric-ltr relative flex items-center" dir="ltr">
      <Smartphone
        className="pointer-events-none absolute right-4 size-[18px] text-white/30"
        aria-hidden="true"
      />
      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={toPersianDigits(value)}
        onChange={handleChange}
        placeholder="۰۹۰۰۰۰۰۰۰۰۰"
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? "phone-error" : undefined}
        className={cn(
          "h-14 w-full rounded-2xl border bg-white/[0.035] pl-4 pr-12 text-left font-mono text-base tracking-[0.08em] text-[#F2F0EA] outline-none transition-[border-color,background-color,box-shadow] placeholder:text-white/20 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-60",
          hasError
            ? "border-[#FF8A80]/70 focus:border-[#FF8A80] focus:ring-4 focus:ring-[#FF8A80]/[0.06]"
            : "border-white/[0.09] hover:border-white/[0.14] focus:border-[#D4AF37]/60 focus:ring-4 focus:ring-[#D4AF37]/[0.07]",
        )}
        dir="ltr"
        autoFocus
      />
    </div>
  );
}
