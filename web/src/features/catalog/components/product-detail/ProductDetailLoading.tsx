export function ProductDetailLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-background-primary text-text-primary"
      aria-busy="true"
      aria-label="در حال دریافت جزئیات محصول"
    >
      <div className="mx-auto min-h-dvh w-full max-w-screen-lg animate-pulse bg-background-secondary pb-8 shadow-large md:pb-32">
        <div className="flex h-[68px] items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="size-10 rounded-full bg-surface-muted" />

          <div className="space-y-2">
            <div className="mx-auto h-2 w-14 rounded-full bg-action-primary/20" />
            <div className="h-3 w-20 rounded-full bg-surface-muted" />
          </div>

          <div className="size-10 rounded-full bg-surface-muted" />
        </div>

        <div className="grid gap-7 px-4 sm:px-6 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] md:items-start md:gap-8 md:px-8">
          <div>
            <div className="aspect-[4/4.35] rounded-[26px] bg-surface-muted sm:aspect-[4/3.5] md:aspect-square" />

            <div className="mt-3 flex gap-2">
              <div className="size-16 rounded-xl bg-surface-muted" />
              <div className="size-16 rounded-xl bg-surface-muted" />
              <div className="size-16 rounded-xl bg-surface-muted" />
            </div>
          </div>

          <div className="md:pt-4">
            <div className="h-3 w-20 rounded-full bg-action-primary/15" />

            <div className="mt-4 h-8 w-3/4 rounded-lg bg-surface-muted" />

            <div className="mt-4 h-4 w-full rounded bg-surface-muted" />

            <div className="mt-2 h-4 w-4/5 rounded bg-surface-muted" />

            <div className="mt-7 h-36 rounded-[22px] bg-surface-muted" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 px-4 sm:px-6 md:grid-cols-4 md:px-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl bg-surface-muted" />
          ))}
        </div>

        <div className="mx-4 mt-8 border-t border-border-subtle pt-7 sm:mx-6 md:mx-8">
          <div className="h-5 w-32 rounded bg-surface-muted" />

          <div className="mt-4 h-4 w-full rounded bg-surface-muted" />

          <div className="mt-2 h-4 w-4/5 rounded bg-surface-muted" />
        </div>
      </div>
    </main>
  );
}
