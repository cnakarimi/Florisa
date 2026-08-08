export function CartPageLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0d0e12] px-4 pb-6 pt-4 text-zinc-100 md:pb-36"
      aria-busy="true"
      aria-label="در حال آماده‌سازی سبد خرید"
    >
      <div className="mx-auto w-full max-w-md animate-pulse">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-10 rounded-full bg-white/10" />
          <div className="h-6 w-24 rounded bg-white/10" />
          <div className="h-10 w-10 rounded-full bg-white/10" />
        </div>
        <div className="space-y-4">
          <div className="h-32 rounded-2xl bg-[#141620]" />
          <div className="h-32 rounded-2xl bg-[#141620]" />
          <div className="h-44 rounded-2xl bg-[#141620]" />
        </div>
      </div>
    </main>
  );
}
