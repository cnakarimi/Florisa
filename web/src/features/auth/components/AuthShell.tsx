import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AuthShellProps {
  children: ReactNode;
  className?: string;
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main className="h-dvh overflow-hidden bg-[#11130f]">
      <div
        className={cn(
          "mx-auto flex h-full w-full max-w-md flex-col justify-center overflow-hidden px-5 py-4 sm:px-6 sm:py-6",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
