import { Flower2, Sun, Truck } from "lucide-react";

import type { ReactNode } from "react";

import {
  LightIcon,
  ShovelIcon,
  TemperatureIcon,
  WateringIcon,
} from "@/components/icons";

import type {
  CutFlowerProductDetails,
  PlantProductDetails,
} from "@/features/catalog/types";

import { toPersianDigits } from "@/utils/persian";

interface SpecificationItem {
  label: string;
  value: string;
}

interface CareTipItem {
  label: string;
  value: string;
  icon: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                               Plant care tips                              */
/* -------------------------------------------------------------------------- */

export function ProductCareTips({ details }: { details: PlantProductDetails }) {
  const temperature =
    details.ideal_temperature_min !== null ||
    details.ideal_temperature_max !== null
      ? [details.ideal_temperature_min, details.ideal_temperature_max]
          .filter((value): value is number => value !== null)
          .map(toPersianDigits)
          .join(" تا ") + " درجه"
      : null;

  const items: CareTipItem[] = [];

  if (details.watering_requirement_display) {
    items.push({
      label: "آبیاری",
      value: details.watering_requirement_display,
      icon: <WateringIcon size={24} />,
    });
  }

  if (details.light_requirement_display) {
    items.push({
      label: "نور",
      value: details.light_requirement_display,
      icon: <LightIcon size={24} />,
    });
  }

  if (temperature) {
    items.push({
      label: "دما",
      value: temperature,
      icon: <TemperatureIcon size={24} />,
    });
  }

  if (details.care_difficulty_display) {
    items.push({
      label: "نگهداری",
      value: details.care_difficulty_display,
      icon: <ShovelIcon size={24} />,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="grid grid-cols-4 gap-3 bg-background-primary px-4 py-4"
      aria-label="راهنمای سریع نگهداری گیاه"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex h-[116px] min-w-0 flex-col items-center bg-background-secondary px-1 py-3 text-center"
        >
          <span className="relative grid size-10 shrink-0 place-items-center">
            {/* Icon background */}
            <span
              className="absolute inset-0 rounded-[12px] bg-text-brand opacity-10"
              aria-hidden="true"
            />

            <span className="relative z-10 grid place-items-center text-text-brand">
              {item.icon}
            </span>
          </span>

          <p className="mt-2 text-xs font-medium leading-5 text-text-primary">
            {item.label}
          </p>

          <p className="mt-1 line-clamp-2 text-[10px] font-normal leading-4 text-text-secondary">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Plant details                                */
/* -------------------------------------------------------------------------- */

export function PlantDetails({ details }: { details: PlantProductDetails }) {
  const items: SpecificationItem[] = [
    details.plant_type
      ? {
          label: "نوع گیاه",
          value: details.plant_type,
        }
      : null,

    details.approximate_height_cm !== null
      ? {
          label: "ارتفاع گیاه",
          value: `${toPersianDigits(details.approximate_height_cm)} سانتی‌متر`,
        }
      : null,

    details.pot_included && details.pot_size_cm !== null
      ? {
          label: "قطر گلدان",
          value: `${toPersianDigits(details.pot_size_cm)} سانتی‌متر`,
        }
      : null,

    details.pot_included && details.pot_material
      ? {
          label: "جنس گلدان",
          value: details.pot_material,
        }
      : null,

    details.care_difficulty_display
      ? {
          label: "سطح نگهداری",
          value: details.care_difficulty_display,
        }
      : null,

    details.color
      ? {
          label: "رنگ برگ",
          value: details.color,
        }
      : null,

    {
      label: "مناسب برای",
      value: "داخل خانه",
    },

    details.pet_friendly !== null
      ? {
          label: "حیوانات خانگی",
          value: details.pet_friendly ? "مناسب" : "احتیاط",
        }
      : null,
  ].filter((item): item is SpecificationItem => item !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-background-primary px-4 py-4"
      aria-labelledby="plant-details-title"
    >
      <h2
        id="plant-details-title"
        className="text-base font-bold leading-6 text-text-primary"
      >
        جزئیات گیاه
      </h2>

      <dl className="mt-3 overflow-hidden rounded-xl bg-background-secondary px-3 py-1">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`flex min-h-12 items-center justify-between gap-4 ${
              index < items.length - 1 ? "border-b border-border-subtle/60" : ""
            }`}
          >
            <dt className="shrink-0 text-[13px] font-normal leading-5 text-text-secondary">
              {item.label}
            </dt>

            <dd className="min-w-0 text-left text-[13px] font-medium leading-5 text-text-primary">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Backward compatibility                             */
/* -------------------------------------------------------------------------- */

export function PlantSpecifications({
  details,
}: {
  details: PlantProductDetails;
}) {
  return (
    <>
      <ProductCareTips details={details} />
      <PlantDetails details={details} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                        Existing cut-flower details                         */
/* -------------------------------------------------------------------------- */

function SpecificationsSection({
  title,
  items,
  body,
  icon,
}: {
  title: string;
  items: SpecificationItem[];
  body?: string;
  icon: ReactNode;
}) {
  if (items.length === 0 && !body) {
    return null;
  }

  return (
    <section className="mx-4 mt-8 rounded-[22px] border border-border-subtle bg-surface-muted p-4 sm:mx-6 sm:p-5 md:mx-8">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-text-primary">
        <span className="text-text-brand">{icon}</span>

        {title}
      </h2>

      {items.length > 0 ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border-subtle bg-background-primary/30 px-3 py-2.5"
            >
              <dt className="text-[10px] text-text-secondary">{item.label}</dt>

              <dd className="mt-1 text-xs font-semibold leading-6 text-text-primary">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {body ? (
        <p className="mt-4 text-xs leading-7 text-text-secondary">{body}</p>
      ) : null}
    </section>
  );
}

export function CutFlowerSpecifications({
  details,
}: {
  details: CutFlowerProductDetails;
}) {
  const items: SpecificationItem[] = [
    details.flower_type
      ? {
          label: "نوع گل",
          value: details.flower_type,
        }
      : null,

    details.variety
      ? {
          label: "رقم",
          value: details.variety,
        }
      : null,

    details.color
      ? {
          label: "رنگ",
          value: details.color,
        }
      : null,

    details.stem_length_cm !== null
      ? {
          label: "طول ساقه",
          value: `${toPersianDigits(details.stem_length_cm)} سانتی‌متر`,
        }
      : null,

    details.flower_grade_display
      ? {
          label: "درجه گل",
          value: details.flower_grade_display,
        }
      : null,

    details.vase_life_days !== null
      ? {
          label: "ماندگاری در گلدان",
          value: `${toPersianDigits(details.vase_life_days)} روز`,
        }
      : null,

    details.origin
      ? {
          label: "مبدأ",
          value: details.origin,
        }
      : null,

    details.fragrance_level_display
      ? {
          label: "میزان رایحه",
          value: details.fragrance_level_display,
        }
      : null,

    details.seasonal_availability_display
      ? {
          label: "فصل عرضه",
          value: details.seasonal_availability_display,
        }
      : null,
  ].filter((item): item is SpecificationItem => item !== null);

  return (
    <>
      <SpecificationsSection
        title="مشخصات گل شاخه‌ای"
        items={items}
        icon={<Flower2 className="size-5" aria-hidden="true" />}
      />

      <SpecificationsSection
        title="راهنمای نگهداری"
        items={[]}
        body={details.care_notes}
        icon={<Sun className="size-5" aria-hidden="true" />}
      />

      <SpecificationsSection
        title="نکات ارسال"
        items={[]}
        body={details.shipping_notes}
        icon={<Truck className="size-5" aria-hidden="true" />}
      />
    </>
  );
}
