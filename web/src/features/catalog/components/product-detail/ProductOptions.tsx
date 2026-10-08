import type { PlantProductDetails } from "@/features/catalog/types";
import { toPersianDigits } from "@/utils/persian";

export function ProductOptions({ details }: { details: PlantProductDetails }) {
  if (!details.pot_included) return null;
  const rows = [
    { label: "اندازه گلدان", value: details.pot_size_cm === null ? "" : toPersianDigits(details.pot_size_cm) + " سانتی‌متر" },
    { label: "رنگ گلدان", value: details.pot_color },
  ].filter(row => row.value);
  return <dl className="mt-5 flex flex-col gap-6" aria-label="مشخصات گلدان همراه محصول">
    {rows.map(row => <div key={row.label} className="flex flex-col gap-3">
      <dt className="text-right text-sm font-medium text-text-secondary">{row.label}</dt>
      <dd className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary">{row.value}</dd>
    </div>)}
  </dl>;
}
