import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface AuthShellProps {
  children: ReactNode;
  className?: string;
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh w-full items-stretch justify-center overflow-hidden bg-black sm:items-center sm:p-6">
      <section
        className={cn(
          "relative flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-[#131313] px-5 pb-8 pt-8 text-[#e5e2e1] sm:min-h-[680px] sm:rounded-3xl sm:border sm:border-[#353535] sm:shadow-2xl",
          className,
        )}
      >
        <div
          className="pointer-events-none absolute -left-20 -top-20 size-48 rounded-full bg-[#e9c349]/10 blur-[80px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-[#bec9c5]/10 blur-[100px]"
          aria-hidden="true"
        />
        {children}
      </section>
    </main>
  );
}

