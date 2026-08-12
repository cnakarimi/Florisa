"use client";

import {
  Banknote,
  Check,
  MessageSquare,
  Package,
  Send,
  ShieldCheck,
  Truck,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const features = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "تضمین سلامت گیاه",
    description: "گیاه سالم و بررسی‌شده تحویل بگیر",
  },
  {
    id: 2,
    icon: Truck,
    title: "ارسال در تهران",
    description: "ارسال ایمن و سریع در محدوده تهران",
  },
  {
    id: 3,
    icon: Package,
    title: "بسته‌بندی مطمئن",
    description: "محافظت از گیاه و گل هنگام ارسال",
  },
  {
    id: 4,
    icon: Banknote,
    title: "پرداخت در محل",
    description: "ثبت سفارش ساده و پرداخت هنگام تحویل",
  },
];

const socialItems = [
  {
    id: "announcements",
    label: "اطلاعیه‌ها",
    icon: Volume2,
  },
  {
    id: "telegram",
    label: "تلگرام",
    icon: Send,
  },
  {
    id: "chat",
    label: "گفتگو",
    icon: MessageSquare,
  },
];

const customerServiceLinks = [
  { label: "فروشگاه", href: "/shop" },
  { label: "پیگیری سفارش", href: "/orders" },
  { label: "مراقبت از گیاه", href: "/care" },
];

const florisaLinks = [
  { label: "خانه", href: "/" },
  { label: "علاقه‌مندی‌ها", href: "/favorites" },
  { label: "حساب کاربری", href: "/profile" },
];

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="transition-colors hover:text-amber-400 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {children}
    </Link>
  );
}

export function FeaturesGrid() {
  return (
    <section
      dir="rtl"
      aria-label="مزیت‌های خرید از فلوریسا"
      className="grid grid-cols-4 gap-5"
    >
      {features.map(({ id, icon: Icon, title, description }) => (
        <article
          key={id}
          className="rounded-2xl border border-white/[0.08] bg-[#151817] p-5 text-center shadow-lg shadow-black/15 transition hover:border-[#d4af37]/30"
        >
          <span
            aria-hidden="true"
            className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]"
          >
            <Icon className="h-5 w-5" />
          </span>

          <h3 className="text-sm font-black text-white">
            {title}
          </h3>

          <p className="mt-2 text-xs leading-5 text-zinc-400">
            {description}
          </p>
        </article>
      ))}
    </section>
  );
}

export function Footer() {
  const pathname = usePathname();
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState("");
  const [showDemoConfirmation, setShowDemoConfirmation] = useState(false);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return;
    }

    setShowDemoConfirmation(true);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setEmail("");
      setShowDemoConfirmation(false);
    }, 3000);
  };

  const currentPersianYear = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
  }).format(new Date());

  return (
    <footer
      dir="rtl"
      className={[
        "site-footer relative mx-auto mt-12 w-full max-w-screen-lg overflow-hidden",
        "border-t border-white/10 bg-[#090a0f] px-5 pb-7 pt-8 text-white",
        "shadow-2xl shadow-black sm:mt-16 sm:px-7 sm:pb-9 sm:pt-10",
        "lg:mt-0 lg:max-w-none lg:px-8 lg:pb-10 lg:pt-14",
        pathname === "/" ? "" : "md:hidden",
      ].join(" ")}
    >
      <div className="mx-auto max-w-4xl space-y-7 lg:max-w-7xl lg:space-y-10">
        <div className="space-y-7 lg:grid lg:grid-cols-4 lg:gap-12 lg:space-y-0">
          <div className="space-y-4 lg:order-1">
            <section aria-labelledby="footer-brand-heading">
              <h2
                id="footer-brand-heading"
                className="text-2xl font-black tracking-tight text-white lg:text-[#d4af37]"
              >
                فلوریسا
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-6 text-zinc-400 sm:text-sm sm:leading-7 lg:text-xs">
                فلوریسا؛ همراه شما در انتخاب و نگهداری گیاهان آپارتمانی و
                گل‌های تازه. تجربه‌ای سبز و آرام برای فضای زندگی شما.
              </p>
            </section>

            <div
              aria-label="راه‌های ارتباط با فلوریسا؛ به‌زودی"
              className="flex items-center justify-start gap-3"
            >
              {socialItems.map(({ id, label, icon: Icon }) => (
                <span
                  key={id}
                  aria-label={`${label}؛ به‌زودی`}
                  role="img"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#141620] text-zinc-400"
                >
                  <Icon className="h-4 w-4 stroke-[2]" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          <section
            aria-labelledby="newsletter-heading"
            className="space-y-3 lg:order-4"
          >
          <h3
            id="newsletter-heading"
            className="text-xs font-bold text-white sm:text-sm"
          >
            از جدیدترین تخفیف‌ها و آموزش‌ها باخبر شوید
          </h3>

          <form
            onSubmit={handleSubscribe}
            className="flex max-w-md items-center gap-2"
          >
            <label htmlFor="footer-email" className="sr-only">
              ایمیل شما
            </label>

            <input
              id="footer-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ایمیل شما"
              className={[
                "min-w-0 flex-1 rounded-xl border border-white/10",
                "bg-[#141620] px-3.5 py-3 text-left text-xs text-white",
                "placeholder:text-right placeholder:text-zinc-500",
                "transition-colors focus:border-amber-400/80",
                "focus:outline-none focus:ring-2 focus:ring-amber-400/20",
              ].join(" ")}
            />

            <button
              type="submit"
              className={[
                "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5",
                "rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-black",
                "shadow-md transition-all hover:bg-amber-300 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-amber-200 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-[#090a0f]",
              ].join(" ")}
            >
              {showDemoConfirmation ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>عضو شدید</span>
                </>
              ) : (
                <span>عضویت</span>
              )}
            </button>
          </form>

          <p aria-live="polite" className="sr-only">
            {showDemoConfirmation
              ? "این پیش‌نمایش نمایشی است و ایمیل شما ذخیره نمی‌شود."
              : ""}
          </p>
          </section>

          <nav
            aria-label="پیوندهای فوتر"
            className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 lg:contents"
          >
          <section
            aria-labelledby="customer-service-heading"
            className="lg:order-2"
          >
            <h3
              id="customer-service-heading"
              className="text-xs font-black text-white"
            >
              خدمات مشتریان
            </h3>

            <ul className="mt-3 space-y-2.5 text-[11px] font-medium text-zinc-400 sm:text-xs">
              {customerServiceLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="florisa-links-heading"
            className="lg:order-3"
          >
            <h3
              id="florisa-links-heading"
              className="text-xs font-black text-white"
            >
              فلوریسا
            </h3>

            <ul className="mt-3 space-y-2.5 text-[11px] font-medium text-zinc-400 sm:text-xs">
              {florisaLinks.map(({ label, href }) => (
                <li key={label}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </section>
          </nav>
        </div>

        <div className="border-t border-white/5 pt-5 text-center text-[10px] font-medium text-zinc-500 lg:pt-8 lg:text-xs">
          <p>© {currentPersianYear} تمامی حقوق برای فلوریسا محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
