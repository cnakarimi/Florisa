import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export function PrimaryButton({
  children,
  className,
  disabled,
  isLoading = false,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e9c349] px-4 text-base font-semibold text-[#241a00] shadow-lg shadow-[#e9c349]/10 transition-[opacity,transform] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      <span className="flex min-w-0 items-center justify-center gap-2">
        {isLoading ? (
          <LoaderCircle
            className="animate-auth-spin size-5 shrink-0"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </span>
    </button>
  );
}

