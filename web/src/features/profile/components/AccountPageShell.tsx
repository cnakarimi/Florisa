"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/features/home/components/BottomNav";
import { AccountNavigation } from "./AccountNavigation";

export function AccountPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <main dir="rtl" className="min-h-dvh bg-[#0d0e12] pb-20 text-zinc-100 md:pb-24">
      <header className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          aria-label="بازگشت به حساب کاربری"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-[#191b23] outline-none transition hover:border-amber-400/30 hover:text-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-black sm:text-xl">{title}</h1>
          <p className="mt-0.5 text-xs leading-5 text-zinc-500">{description}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden md:block"><div className="sticky top-5"><AccountNavigation /></div></aside>
        <div className="min-w-0">{children}</div>
      </div>
      <BottomNav />
    </main>
  );
}
