"use client";

import { useId } from "react";
import type { PlantProductDetails } from "@/features/catalog/types";
import { getPlantSpecificationGroups, type SpecificationGroup } from "@/features/catalog/utils/plant-detail";
import { toPersianDigits } from "@/utils/persian";

const ICON_DIMENSIONS: Record<string, [number, number]> = {
  expand: [24,24], favorite: [32,32], share: [21,22], star: [12,12],
  search: [40,40], back: [22,16], cart: [20,23],
  chevron: [16,16], light: [20,20], watering: [20,20], temperature: [20,20], soil: [20,20], care: [20,20],
  "description-arrow": [11,11],
};

export function ProductDesignIcon({ name }: { name: string }) {
  const [width, height] = ICON_DIMENSIONS[name];
  // SVGs are exported unchanged from the target Figma nodes, at their native dimensions.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/product-detail/${name}.svg`} width={width} height={height} alt="" aria-hidden="true" className="shrink-0" />;
}

export function SpecificationTable({ group }: { group: SpecificationGroup }) {
  return <div className="flex flex-col gap-3.5 pt-1">
    <h3 className="flex items-center gap-2 px-1 text-mobile-ui-button font-semibold text-text-brand">{group.title}<span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-action-primary/30 via-white/10 to-transparent" /></h3>
    <dl className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-background-secondary px-4 py-1">
      {group.rows.map(row => <div key={row.label} className="flex items-start justify-between gap-4 py-3.5 text-mobile-body-small">
        <dt className="min-w-0 flex-1 font-medium text-text-secondary">{row.label}</dt>
        <dd className="min-w-0 flex-1 break-words text-left">{typeof row.value === "boolean" ? row.value ? "بله" : "خیر" : toPersianDigits(String(row.value))}</dd>
      </div>)}
    </dl>
  </div>;
}

export function PlantSpecifications({ details }: { details: PlantProductDetails }) {
  const id = useId();
  const groups = getPlantSpecificationGroups(details);
  return <section className="flex flex-col gap-6 px-4 py-8" aria-labelledby={id}>
    <h2 id={id} className="pt-1 text-mobile-heading-h3 font-bold">مشخصات محصول</h2>
    {groups.map(group => <SpecificationTable key={group.title} group={group} />)}
  </section>;
}

export function PlantCareGuide({ details }: { details: PlantProductDetails }) {
  const id = useId();
  const temperature = [details.ideal_temperature_min, details.ideal_temperature_max].filter(value => value !== null).map(value => toPersianDigits(String(value))).join(" تا ");
  const rows = [
    { label: "نور", value: details.light_requirement_display, icon: "light" },
    { label: "آبیاری", value: details.watering_requirement_display, icon: "watering" },
    { label: "دما", value: temperature ? `${temperature} درجه سانتی‌گراد` : "", icon: "temperature" },
    { label: "نگهداری", value: details.care_difficulty_display, icon: "soil" },
  ].filter(row => row.value);
  if (!rows.length && !details.care_notes.trim()) return null;
  return <section className="px-4 py-8" aria-labelledby={id}>
    <h2 id={id} className="mb-6 text-mobile-heading-h3 font-bold">راهنمای شرایط و مراقبت</h2>
    <div className="flex flex-col gap-2.5">
      {rows.map(row => <div key={row.label} className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-white/10 bg-background-secondary p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-action-primary/12"><ProductDesignIcon name={row.icon} /></span>
        <div className="min-w-0"><h3 className="text-mobile-ui-button font-semibold text-text-brand">{row.label}</h3><p className="break-words text-mobile-body-small text-text-secondary">{row.value}</p></div>
      </div>)}
      {details.care_notes.trim() && <details open className="group rounded-2xl border border-action-primary bg-background-secondary">
        <summary className="flex min-h-[72px] cursor-pointer list-none items-center gap-3 p-3.5 [&::-webkit-details-marker]:hidden">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-action-primary bg-action-primary/12"><ProductDesignIcon name="care" /></span>
          <h3 className="flex-1 text-mobile-ui-button font-semibold text-text-brand">نکات نگهداری</h3>
          <span className="grid size-7 place-items-center rounded-full bg-background-primary transition-transform group-open:rotate-180"><ProductDesignIcon name="chevron" /></span>
        </summary>
        <p className="whitespace-pre-line break-words border-t border-white/5 px-4 pb-3.5 pt-2.5 text-mobile-body-small text-text-secondary">{details.care_notes}</p>
      </details>}
    </div>
  </section>;
}
