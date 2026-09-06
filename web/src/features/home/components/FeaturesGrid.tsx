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
      className="
        grid
        grid-cols-2
        gap-3

        lg:grid-cols-4
        lg:gap-5
      "
    >
      {FEATURES.map(({ id, icon: Icon, title, description }) => (
        <article
          key={id}
          className="
            flex
            min-h-[108px]
            flex-col
            items-center
            justify-center
            rounded-xl
            border
            border-border-subtle/30
            bg-background-tertiary
            px-3
            py-4
            text-center

            transition-[border-color,transform]
            duration-200
            ease-out

            lg:min-h-[150px]
            lg:rounded-2xl
            lg:px-5
            lg:py-6
            lg:hover:-translate-y-0.5
            lg:hover:border-border-brand/45

            motion-reduce:transform-none
            motion-reduce:transition-none
          "
        >
          <Icon
            aria-hidden="true"
            className="
              mb-2
              size-5
              text-action-primary

              lg:mb-3
              lg:size-6
            "
          />

          <h3
            className="
              text-sm
              font-bold
              leading-6
              text-text-primary

              lg:text-base
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              line-clamp-2
              text-[11px]
              leading-5
              text-text-secondary

              lg:mt-2
              lg:text-xs
              lg:leading-5
            "
          >
            {description}
          </p>
        </article>
      ))}
    </section>
  );
}
