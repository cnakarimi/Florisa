import { FlaskConical, WandSparkles } from "lucide-react";
import { toPersianDigits } from "../utils/digits";

interface AuthDemoHintProps {
  label: string;
  value: string;
  description: string;
  onUse: () => void;
  disabled?: boolean;
}

export function AuthDemoHint({
  label,
  value,
  description,
  onUse,
  disabled = false,
}: AuthDemoHintProps) {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.055] p-3.5">
      <div
        className="pointer-events-none absolute -left-6 -top-8 size-24 rounded-full bg-[#D4AF37]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]">
          <FlaskConical className="size-[18px]" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-[#F2EEE3]">
              ورود آزمایشی
            </p>
            <span className="rounded-full border border-[#D4AF37]/20 bg-black/20 px-2 py-0.5 text-[9px] font-bold text-[#D4AF37]">
              DEMO
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-white/45">
            {description}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
            <div className="min-w-0">
              <span className="block text-[9px] text-white/35">{label}</span>
              <b
                className="numeric-ltr mt-0.5 block truncate text-sm tracking-[0.12em] text-[#F1D56D]"
                dir="ltr"
              >
                {toPersianDigits(value)}
              </b>
            </div>

            <button
              type="button"
              onClick={onUse}
              disabled={disabled}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 text-[10px] font-extrabold text-[#11130F] transition hover:bg-[#E3C45D] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <WandSparkles className="size-3.5" aria-hidden="true" />
              استفاده
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
