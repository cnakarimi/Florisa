import { Banknote, Package, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  {
    id: "health-guarantee",
    icon: ShieldCheck,
    title: "تضمین سلامت گیاه",
    description: "گیاه سالم و بررسی‌شده تحویل بگیر",
  },
  {
    id: "tehran-delivery",
    icon: Truck,
    title: "ارسال در تهران",
    description: "ارسال ایمن و سریع در محدوده تهران",
  },
  {
    id: "safe-packaging",
    icon: Package,
    title: "بسته‌بندی مطمئن",
    description: "محافظت از گیاه و گل هنگام ارسال",
  },
  {
    id: "cash-on-delivery",
    icon: Banknote,
    title: "پرداخت در محل",
    description: "ثبت سفارش ساده و پرداخت هنگام تحویل",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section
      dir="rtl"
      aria-label="مزیت‌های خرید از فلوریسا"
      className="grid grid-cols-4 gap-5"
    >
      {FEATURES.map(({ id, icon: Icon, title, description }) => (
        <article
          key={id}
          className="rounded-2xl border border-white/[0.08] bg-[#151817] p-5 text-center shadow-lg shadow-black/15 transition hover:border-[#d4af37]/30"
        >
          <span
            aria-hidden="true"
            className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]"
          >
            <Icon className="size-5" />
          </span>

          <h3 className="text-sm font-black text-white">{title}</h3>

          <p className="mt-2 text-xs leading-5 text-zinc-400">{description}</p>
        </article>
      ))}
    </section>
  );
}
