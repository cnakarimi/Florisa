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
    label: "شرایط ارسال",
    href: "/shop",
  },
  {
    label: "رویه‌های بازگرداندن",
    href: "/shop",
  },
  {
    label: "پرسش‌های متداول",
    href: "/shop",
  },
  {
    label: "پیگیری سفارش",
    href: "/orders",
  },
] as const;

const FLORISA_LINKS = [
  {
    label: "درباره ما",
    href: "/",
  },
  {
    label: "تماس با ما",
    href: "/",
  },
  {
    label: "فرصت‌های شغلی",
    href: "/",
  },
  {
    label: "مجله گیاهان",
    href: "/blog",
  },
] as const;

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="
        transition-colors
        duration-200

        hover:text-text-brand

        focus-visible:rounded-sm
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-action-primary
      "
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
        "site-footer",
        "relative",
        "mt-12",
        "w-full",
        "border-t",
        "border-border-subtle/20",
        "bg-background-secondary",
        "text-text-primary",

        "sm:mt-16",

        "lg:mt-0",

        pathname === "/" ? "" : "md:hidden",
      ].join(" ")}
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]
          px-4
          pb-6
          pt-8

          sm:px-6
          sm:pb-8
          sm:pt-10

          lg:px-8
          lg:pb-8
          lg:pt-14
        "
      >
        <div
          className="
            flex
            flex-col
            gap-7

            lg:grid
            lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr]
            lg:items-start
            lg:gap-12
          "
        >
          <div className="lg:order-1">
            <section aria-labelledby="footer-brand-heading">
              <h2
                id="footer-brand-heading"
                className="
                  text-xl
                  font-black
                  text-text-brand

                  lg:text-2xl
                "
              >
                فلوریسا
              </h2>

              <p
                className="
                  mt-3
                  max-w-md
                  text-xs
                  leading-6
                  text-text-secondary

                  sm:text-sm
                  sm:leading-7

                  lg:max-w-sm
                  lg:text-xs
                  lg:leading-6
                "
              >
                فلوریسا؛ همراه شما در انتخاب و نگهداری گیاهان آپارتمانی و گل‌های
                تازه. تجربه‌ای سبز و آرام برای فضای زندگی شما.
              </p>
            </section>

            <div
              aria-label="راه‌های ارتباط با فلوریسا؛ به‌زودی"
              className="
                mt-4
                flex
                items-center
                gap-4
              "
            >
              {SOCIAL_ITEMS.map(({ id, label, icon: Icon }) => (
                <span
                  key={id}
                  aria-label={`${label}؛ به‌زودی`}
                  role="img"
                  className="
                      grid
                      size-7
                      place-items-center
                      text-text-secondary

                      transition-colors
                      duration-200

                      hover:text-text-brand
                    "
                >
                  <Icon className="size-5 stroke-[1.8]" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          <section
            aria-labelledby="newsletter-heading"
            className="
              lg:order-4
              lg:max-w-sm
            "
          >
            <h3
              id="newsletter-heading"
              className="
                hidden
                text-sm
                font-bold
                text-text-primary

                lg:block
              "
            >
              خبرنامه
            </h3>

            <p
              className="
                text-sm
                font-bold
                leading-6
                text-text-primary

                lg:mt-4
                lg:text-xs
                lg:font-medium
                lg:text-text-secondary
              "
            >
              از جدیدترین تخفیف‌ها و آموزش‌ها باخبر شوید
            </p>

            <form
              onSubmit={handleSubscribe}
              className="
                mt-3
                flex
                w-full
                max-w-md
                items-center
                gap-2
              "
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
                className="
                  min-w-0
                  flex-1
                  rounded-lg
                  border
                  border-border-subtle/30
                  bg-background-tertiary
                  px-3.5
                  py-3
                  text-left
                  text-xs
                  text-text-primary

                  placeholder:text-right
                  placeholder:text-text-tertiary

                  transition-[border-color,box-shadow]
                  duration-200

                  focus:border-border-brand
                  focus:outline-none
                  focus:ring-2
                  focus:ring-action-primary/20
                "
              />

              <button
                type="submit"
                className="
                  inline-flex
                  min-h-10
                  shrink-0
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  bg-action-primary
                  px-5
                  text-xs
                  font-bold
                  text-background-primary

                  transition-[opacity,transform]
                  duration-200

                  hover:opacity-90
                  active:scale-[0.98]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-action-primary
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-background-secondary
                "
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
            className="
              grid
              grid-cols-2
              gap-8
              border-t
              border-border-subtle/20
              pt-6

              lg:contents
            "
          >
            <section
              aria-labelledby="customer-service-heading"
              className="lg:order-2"
            >
              <h3
                id="customer-service-heading"
                className="
                  text-xs
                  font-bold
                  text-text-primary

                  lg:text-sm
                "
              >
                خدمات مشتریان
              </h3>

              <ul
                className="
                  mt-3
                  space-y-2.5
                  text-[11px]
                  leading-6
                  text-text-secondary

                  sm:text-xs

                  lg:mt-4
                  lg:space-y-3
                "
              >
                {CUSTOMER_SERVICE_LINKS.map(({ label, href }) => (
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
                className="
                  text-xs
                  font-bold
                  text-text-primary

                  lg:text-sm
                "
              >
                فلوریسا
              </h3>

              <ul
                className="
                  mt-3
                  space-y-2.5
                  text-[11px]
                  leading-6
                  text-text-secondary

                  sm:text-xs

                  lg:mt-4
                  lg:space-y-3
                "
              >
                {FLORISA_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <FooterLink href={href}>{label}</FooterLink>
                  </li>
                ))}
              </ul>
            </section>
          </nav>
        </div>

        <div
          className="
            mt-7
            border-t
            border-border-subtle/20
            pt-5
            text-center
            text-[10px]
            text-text-tertiary

            lg:mt-12
            lg:pt-6
            lg:text-xs
          "
        >
          <p>© {currentPersianYear} تمامی حقوق برای فلوریسا محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
