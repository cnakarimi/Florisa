"use client";

interface AuthStateScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

export function AuthStateScreen({
  error,
  onRetry,
}: AuthStateScreenProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0d0e12] p-6 text-center text-zinc-300">
      {error ? (
        <div className="max-w-sm space-y-4">
          <p className="text-sm leading-relaxed">{error}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-[#ebc351] px-5 py-3 text-sm font-bold text-black"
            >
              تلاش دوباره
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm" aria-live="polite">
          در حال بررسی حساب کاربری...
        </p>
      )}
    </div>
  );
}
