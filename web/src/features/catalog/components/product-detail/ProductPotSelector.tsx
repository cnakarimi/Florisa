"use client";

import type { PlantPotOption } from "../../types";
import { CatalogImage } from "../CatalogImage";
import { getProductImageUrl } from "../../utils/images";
import { toPersianDigits } from "@/utils/persian";
import { POT_UNAVAILABLE_MESSAGE } from "../../utils/pot-options";

interface Props {
  options: PlantPotOption[];
  selected: PlantPotOption;
  available: boolean;
  productAvailable?: boolean;
  onSelect: (option: PlantPotOption) => void;
}

export function ProductPotSelector({ options, selected, available, productAvailable = true, onSelect }: Props) {
  const visible = options.some(option => option.id === selected.id) ? options : [...options, { ...selected, is_available: false }];
  return <fieldset className="min-w-0 py-4" data-pot-selector>
    <legend className="text-sm font-semibold">انتخاب گلدان</legend>
    <div className="flex gap-3 overflow-x-auto py-3">
      {visible.map(option => <button key={option.id ?? "plastic"} type="button"
        disabled={!option.is_available} aria-pressed={selected.id === option.id}
        onClick={() => onSelect(option)} data-pot-option={option.id ?? "baseline"}
        className={`w-32 shrink-0 overflow-hidden rounded-xl border p-2 text-right text-xs focus-visible:outline-2 focus-visible:outline-action-primary disabled:opacity-50 ${selected.id === option.id ? "border-action-primary bg-background-secondary" : "border-border-subtle"}`}>
        <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-background-secondary">
          {option.configuration_image || option.image ? <CatalogImage src={getProductImageUrl(option.configuration_image ?? option.image)} alt={option.name} sizes="112px" /> : <span className="flex h-full items-center justify-center text-text-secondary">{option.is_baseline ? "پلاستیکی" : "تصویر ثبت نشده"}</span>}
        </div>
        <span className="block break-words font-semibold">{option.name}</span>
        {option.image && !option.configuration_image && <span className="mt-1 block text-text-secondary">تصویر خود گلدان</span>}
        <span className="mt-2 block text-text-brand">{option.additional_price === 0 ? "بدون هزینه اضافی" : `+ ${toPersianDigits(option.additional_price.toLocaleString("en-US"))} تومان`}</span>
        {!option.is_available && <span className="mt-1 block">ناموجود</span>}
      </button>)}
    </div>
    <p className="text-xs text-text-secondary">گلدان انتخاب‌شده: {selected.name}</p>
    <p className="mt-2 text-sm text-text-brand">قیمت هر گلدان: {toPersianDigits(selected.unit_price.toLocaleString("en-US"))} تومان</p>
    {(typeof selected.attributes.diameter_cm === "number" || typeof selected.attributes.height_cm === "number") && <p className="mt-1 text-xs text-text-secondary">{typeof selected.attributes.diameter_cm === "number" ? `قطر ${toPersianDigits(selected.attributes.diameter_cm)} سانتی‌متر` : ""} {typeof selected.attributes.height_cm === "number" ? `ارتفاع ${toPersianDigits(selected.attributes.height_cm)} سانتی‌متر` : ""}</p>}
    {!selected.configuration_image && <p className="mt-2 text-xs leading-6 text-text-secondary">تصویر عمومی گیاه نمایش داده می‌شود؛ تصویر این گیاه در گلدان انتخاب‌شده هنوز ثبت نشده است.</p>}
    {!available && <p role="alert" className="mt-2 text-xs leading-6 text-red-400">{productAvailable ? POT_UNAVAILABLE_MESSAGE : "این گیاه در حال حاضر ناموجود است."}</p>}
  </fieldset>;
}
