"use client";

import { useId } from "react";
import { Sprout } from "lucide-react";
import type { PlantProductDetails } from "@/features/catalog/types";
import {
  getPlantSpecificationGroups,
  type SpecificationGroup,
} from "@/features/catalog/utils/plant-detail";
import { toPersianDigits } from "@/utils/persian";

const ICON_DIMENSIONS: Record<string, [number, number]> = {
  expand: [24, 24],
  favorite: [32, 32],
  share: [21, 22],
  star: [12, 12],
  search: [40, 40],
  back: [22, 16],
  cart: [20, 23],
  chevron: [16, 16],
  "chevron-open": [16, 16],
  light: [20, 20],
  watering: [20, 20],
  temperature: [20, 20],
  soil: [20, 20],
  humidity: [20, 20],
  care: [20, 20],
  "description-arrow": [11, 11],
};

const ARRANGEMENT_ICON_DIMENSIONS: Record<string, [number, number]> = {
  expand: [24, 24],
  favorite: [32, 32],
  share: [20.5, 21.9253],
  star: [12, 11.9931],
  search: [40, 40],
  back: [21.1004, 15.5001],
  cart: [19.5, 22.2797],
  "description-arrow": [10.6667, 10.6667],
};

export function ProductDesignIcon({
  name,
  directory = "product-detail",
}: {
  name: string;
  directory?: string;
}) {
  const [width, height] = (
    directory === "arrangement-detail"
      ? ARRANGEMENT_ICON_DIMENSIONS
      : ICON_DIMENSIONS
  )[name];
  // SVGs are exported unchanged from the target Figma nodes, at their native dimensions.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/${directory}/${name}.svg`}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      className="shrink-0"
    />
  );
}

export function SpecificationTable({ group }: { group: SpecificationGroup }) {
  return (
    <div className="flex flex-col gap-3.5 pt-1">
      <h3 className="flex items-center gap-2 px-1 text-mobile-ui-button font-semibold text-text-brand">
        {group.title}
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-gradient-to-l from-action-primary/30 via-white/10 to-transparent"
        />
      </h3>
      <dl className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-background-secondary px-4 py-1">
        {group.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 py-3.5 text-mobile-body-small"
          >
            <dt className="min-w-0 flex-1 font-medium text-text-secondary">
              {row.label}
            </dt>
            <dd className="min-w-0 flex-1 break-words text-left">
              {typeof row.value === "boolean"
                ? row.value
                  ? "بله"
                  : "خیر"
                : toPersianDigits(String(row.value))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PlantSpecifications({
  details,
}: {
  details: PlantProductDetails;
}) {
  const id = useId();
  const groups = getPlantSpecificationGroups(details);
  return (
    <section className="flex flex-col gap-6 px-4 py-8" aria-labelledby={id}>
      <h2 id={id} className="pt-1 text-mobile-heading-h3 font-bold">
        مشخصات محصول
      </h2>
      {groups.map((group) => (
        <SpecificationTable key={group.title} group={group} />
      ))}
    </section>
  );
}

export function PlantCareGuide({ details }: { details: PlantProductDetails }) {
  const id = useId();

  const temperature = [
    details.ideal_temperature_min,
    details.ideal_temperature_max,
  ]
    .filter((value) => value != null)
    .map((value) => toPersianDigits(String(value)))
    .join(" تا ");

  const legacyRows = [
    {
      label: "نور",
      value: details.light_requirement_display,
      icon: "light",
    },
    {
      label: "آبیاری",
      value: details.watering_requirement_display,
      icon: "watering",
    },
    {
      label: "دما",
      value: temperature ? `${temperature} درجه سانتی‌گراد` : "",
      icon: "temperature",
    },
    {
      label: "نگهداری",
      value: details.care_difficulty_display,
      icon: "care-difficulty",
    },
  ]
    .filter((row) => row.value)
    .map((row) => ({ ...row, summary: "", explanation: "" }));
  const titles = {
    light: "نور",
    watering: "آبیاری",
    temperature: "دما",
    humidity: "رطوبت",
    soil: "خاک",
  };
  const rows = details.care_items?.length
    ? details.care_items.map((item) => ({
        ...item,
        label: titles[item.key],
        icon: item.key,
      }))
    : legacyRows;
  const notes = details.care_notes.trim();

  if (!rows.length && !notes) return null;

  return (
    <section className="px-4 py-8" aria-labelledby={id}>
      <h2 id={id} className="mb-6 text-mobile-heading-h3 font-bold">
        راهنمای شرایط و مراقبت
      </h2>

      <div className="flex flex-col gap-2.5">
        {rows.map((row) => {
          const expandable = Boolean(row.explanation.trim());
          const header = (
            <>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-action-primary bg-action-primary/12">
                {row.icon === "care-difficulty" ? (
                  <Sprout
                    size={20}
                    aria-hidden="true"
                    className="text-text-brand"
                  />
                ) : (
                  <ProductDesignIcon name={row.icon} />
                )}
              </span>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-mobile-ui-button font-semibold text-text-brand">
                    {row.label}
                  </span>
                  <span className="text-mobile-body-small text-text-primary group-open:font-semibold">
                    {row.value}
                  </span>
                </span>
                {row.summary.trim() && (
                  <span className="mt-px block text-mobile-ui-caption text-text-secondary">
                    {row.summary}
                  </span>
                )}
              </span>
              {expandable && (
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-background-primary transition-transform group-open:rotate-180 motion-reduce:transition-none"
                >
                  <span className="group-open:hidden">
                    <ProductDesignIcon name="chevron" />
                  </span>
                  <span className="hidden group-open:block">
                    <ProductDesignIcon name="chevron-open" />
                  </span>
                </span>
              )}
            </>
          );
          const headerClass = "flex min-h-[68px] items-center gap-3 p-3.5";
          const cardClass =
            "rounded-2xl border border-white/10 bg-background-secondary";
          return expandable ? (
            <details
              key={row.label}
              name={`plant-care-${id}`}
              className={`group ${cardClass} open:border-action-primary open:shadow-md`}
            >
              {" "}
              <summary
                className={`${headerClass} cursor-pointer list-none rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary [&::-webkit-details-marker]:hidden`}
              >
                {header}
              </summary>
              <p className="whitespace-pre-line [overflow-wrap:anywhere] border-t border-white/5 px-4 pb-3.5 pt-2.5 text-mobile-body-small text-text-secondary">
                {row.explanation}
              </p>
            </details>
          ) : (
            <div key={row.label} className={cardClass}>
              <div className={headerClass}>{header}</div>
            </div>
          );
        })}
      </div>
      {notes && (
        <div className="mt-6">
          <h3 className="mb-2 text-mobile-ui-button font-semibold text-text-brand">
            نکات عمومی نگهداری
          </h3>
          <p className="whitespace-pre-line [overflow-wrap:anywhere] text-mobile-body-small text-text-secondary">
            {notes}
          </p>
        </div>
      )}
    </section>
  );
}
