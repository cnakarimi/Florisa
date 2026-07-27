import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

interface InlineErrorProps {
  message: string;
  centered?: boolean;
  id?: string;
}

export function InlineError({
  message,
  centered = false,
  id,
}: InlineErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "flex min-h-5 items-center gap-1.5 text-xs text-[#ffb4ab]",
        centered && "justify-center text-center",
      )}
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

