export function ProductDetailLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0d0e12] px-4 pb-28 pt-5 text-white sm:px-6"
      aria-busy="true"
      aria-label="در حال دریافت جزئیات محصول"
    >
      <div className="mx-auto w-full max-w-md animate-pulse">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-11 w-11 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="mx-auto h-2 w-16 rounded bg-emerald-400/20" />
            <div className="h-3 w-24 rounded bg-white/10" />
          </div>
          <div className="h-11 w-11 rounded-full bg-white/10" />
        </div>
        <div className="h-[360px] rounded-[2rem] bg-[#171921] sm:h-[400px]" />
        <div className="mt-8 h-3 w-20 rounded bg-emerald-400/20" />
        <div className="mt-3 h-8 w-3/4 rounded bg-white/10" />
        <div className="mt-4 h-4 w-full rounded bg-white/5" />
        <div className="mt-2 h-4 w-4/5 rounded bg-white/5" />
        <div className="mt-7 h-32 rounded-2xl bg-[#171921]" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-28 rounded-2xl bg-[#171921]" />
          <div className="h-28 rounded-2xl bg-[#171921]" />
          <div className="h-28 rounded-2xl bg-[#171921]" />
          <div className="h-28 rounded-2xl bg-[#171921]" />
        </div>
      </div>
    </main>
  );
}
