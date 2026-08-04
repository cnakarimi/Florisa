"use client";

import Image from "next/image";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";

interface AuthStateScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

export function AuthStateScreen({ error, onRetry }: AuthStateScreenProps) {
  return (
    <AuthShell>
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <Image
          src="/images/brand/florisa-logo.svg"
          alt="فلوریسا"
          width={146}
          height={52}
          className="h-12 w-auto object-contain"
        />

        {error ? (
          <div className="mt-8 max-w-xs space-y-5">
            <p className="text-xs leading-6 text-white/55">{error}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mx-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 text-xs font-extrabold text-[#11130F] transition hover:bg-[#E3C45D]"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                تلاش دوباره
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className="mt-8 flex flex-col items-center gap-4"
            aria-live="polite"
          >
            <LoaderCircle
              className="size-7 animate-spin text-[#D4AF37]"
              aria-hidden="true"
            />
            <p className="text-xs text-white/40">در حال بررسی حساب کاربری...</p>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
