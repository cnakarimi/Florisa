import type { ChangeEvent } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  normalizeDigits,
  toPersianDigits,
} from "@/features/auth/utils/digits";

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
      <div className="pointer-events-none absolute left-3 flex items-center gap-1 text-xs text-[#8d9290]">
        <Phone className="size-4" aria-hidden="true" />
        <span>+۹۸</span>
      </div>
      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={toPersianDigits(value)}
        onChange={handleChange}
        placeholder="۰۹۱۲۱۲۳۴۵۶۷"
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? "phone-error" : undefined}
        className={cn(
          "h-[52px] w-full rounded-xl border bg-[#20201f] pl-16 pr-4 text-left font-mono text-base text-[#e5e2e1] outline-none transition-colors placeholder:text-[#686d6b] focus:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60",
          hasError
            ? "border-[#ffb4ab] focus:border-[#ffb4ab]"
            : "border-[#434846] focus:border-[#e9c349]",
        )}
        dir="ltr"
        autoFocus
      />
    </div>
  );
}
