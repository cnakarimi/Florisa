"use client";

import { Check, MessageSquare, Send, Volume2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const SOCIAL_ITEMS = [
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
] as const;

const CUSTOMER_SERVICE_LINKS = [
  {
    label: "فروشگاه",
    href: "/shop",
  },
  {
    label: "پیگیری سفارش",
    href: "/orders",
  },
  {
    label: "وبلاگ",
    href: "/blog",
  },
] as const;

const FLORISA_LINKS = [
  {
    label: "خانه",
    href: "/",
  },
  {
    label: "علاقه‌مندی‌ها",
    href: "/favorites",
  },
  {
    label: "حساب کاربری",
    href: "/profile",
  },
] as const;

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

export function Footer() {
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [showDemoConfirmation, setShowDemoConfirmation] = useState(false);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
                فلوریسا؛ همراه شما در انتخاب و نگهداری گیاهان آپارتمانی و گل‌های
                تازه. تجربه‌ای سبز و آرام برای فضای زندگی شما.
              </p>
            </section>

            <div
              aria-label="راه‌های ارتباط با فلوریسا؛ به‌زودی"
              className="flex items-center justify-start gap-3"
            >
              {SOCIAL_ITEMS.map(({ id, label, icon: Icon }) => (
                <span
                  key={id}
                  aria-label={`${label}؛ به‌زودی`}
                  role="img"
                  className="grid size-10 place-items-center rounded-xl border border-white/10 bg-[#141620] text-zinc-400"
                >
                  <Icon className="size-4 stroke-[2]" aria-hidden="true" />
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
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#141620] px-3.5 py-3 text-left text-xs text-white placeholder:text-right placeholder:text-zinc-500 transition-colors focus:border-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />

              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-black text-black shadow-md transition-all hover:bg-amber-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a0f]"
              >
                {showDemoConfirmation ? (
                  <>
                    <Check className="size-3.5" aria-hidden="true" />
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
                {CUSTOMER_SERVICE_LINKS.map(({ label, href }) => (
                  <li key={href}>
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
                {FLORISA_LINKS.map(({ label, href }) => (
                  <li key={href}>
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
