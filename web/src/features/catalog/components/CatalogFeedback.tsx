import {
  LoaderCircle,
  PackageOpen,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

interface CatalogFeedbackProps {
  kind: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function CatalogFeedback({
  kind,
  message,
  onRetry,
  compact = false,
}: CatalogFeedbackProps) {
  const Icon =
    kind === "loading"
      ? LoaderCircle
      : kind === "error"
        ? TriangleAlert
        : PackageOpen;

  const defaultMessage =
    kind === "loading"
      ? "در حال دریافت محصولات..."
      : kind === "error"
        ? "دریافت اطلاعات فروشگاه با مشکل روبه‌رو شد."
        : "در حال حاضر محصولی برای نمایش وجود ندارد.";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#161722] px-6 text-center text-zinc-400 ${
        compact ? "min-h-40 py-8" : "min-h-64 py-14"
      }`}
      role={kind === "error" ? "alert" : "status"}
    >
      <Icon
        className={`mb-3 h-10 w-10 ${
          kind === "loading"
            ? "animate-auth-spin text-emerald-400"
            : kind === "error"
              ? "text-rose-400"
              : "text-amber-400"
        }`}
      />
      <p className="max-w-md text-sm leading-6">
        {message || defaultMessage}
      </p>
      {kind === "error" && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#222430] px-4 py-2 text-xs font-semibold text-white hover:border-emerald-500/50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تلاش دوباره
        </button>
      ) : null}
    </div>
  );
}
