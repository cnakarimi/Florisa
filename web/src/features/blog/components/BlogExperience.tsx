import { BottomNav } from "@/features/home/components/BottomNav";

export function BlogExperience() {
  return (
    <div className="min-h-dvh bg-black text-zinc-100">
      <div className="relative mx-auto min-h-dvh w-full max-w-screen-lg overflow-x-hidden bg-[#111211] md:pb-24">
        <main className="px-4 py-8 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold">وبلاگ فلوریسا</h1>

          <p className="mt-3 text-sm text-zinc-400">
            مقالات و راهنماهای گل و گیاه به‌زودی اینجا قرار می‌گیرند.
          </p>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
