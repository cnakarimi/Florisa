"use client";

import type { PlantPotOption } from "../../types";
import { CatalogImage } from "../CatalogImage";
import { getProductImageUrl } from "../../utils/images";
import { toPersianDigits } from "@/utils/persian";
import { POT_UNAVAILABLE_MESSAGE } from "../../utils/pot-options";
import { CheckIcon } from "@/components/icons/CheckIcon";

interface Props {
  options: PlantPotOption[];
  selected: PlantPotOption;
  available: boolean;
  productAvailable?: boolean;
  onSelect: (option: PlantPotOption) => void;
}

export function ProductPotSelector({
  options,
  selected,
  available,
  productAvailable = true,
  onSelect,
}: Props) {
  const visible = options.some((option) => option.id === selected.id)
    ? options
    : [...options, { ...selected, is_available: false }];

  return (
    <fieldset dir="rtl" className="min-w-0 border-0 py-8" data-pot-selector>
      <legend className="sr-only">انتخاب گلدان</legend>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-sm font-semibold leading-5 text-text-primary">
            انتخاب گلدان
          </span>

          <span className="truncate text-[11px] leading-4 text-text-secondary">
            {selected.name}
          </span>
        </div>

        <span className="shrink-0 rounded-full bg-action-primary px-2.5 py-1 text-[11px] font-medium leading-4 text-text-inverse">
          {toPersianDigits(String(options.length))} گزینه
        </span>
      </div>

      <div className="florisa-scrollbar flex items-stretch gap-3 overflow-x-auto pb-3">
        {visible.map((option) => {
          const isSelected = selected.id === option.id;
          const image = option.configuration_image ?? option.image;

          return (
            <button
              key={option.id ?? "plastic"}
              type="button"
              disabled={!option.is_available}
              aria-pressed={isSelected}
              aria-label={`${option.name}${
                !option.is_available ? "، ناموجود" : ""
              }`}
              onClick={() => onSelect(option)}
              data-pot-option={option.id ?? "baseline"}
              className="relative isolate flex w-[140px] shrink-0 flex-col gap-1 overflow-hidden rounded-2xl  bg-background-secondary text-right focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-action-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-background-primary [&_img]:object-cover">
                {image ? (
                  <CatalogImage
                    src={getProductImageUrl(image)}
                    alt={option.name}
                    sizes="138px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-[11px] leading-4 text-text-secondary">
                    {option.is_baseline ? "پلاستیکی" : "تصویر ثبت نشده"}
                  </span>
                )}
              </div>

              <span className="block w-full break-words px-3 pt-2 text-xs font-medium leading-4 text-text-primary">
                {option.name}
              </span>

              <span
                className={`mt-auto block w-full px-3 pb-3 text-[11px] leading-4 ${
                  isSelected ? "text-action-primary" : "text-text-tertiary"
                }`}
              >
                {option.additional_price === 0 ? (
                  "بدون هزینه اضافی"
                ) : (
                  <>
                    <bdi dir="ltr">
                      +
                      {toPersianDigits(
                        option.additional_price.toLocaleString("en-US"),
                      )}
                    </bdi>{" "}
                    تومان
                  </>
                )}
              </span>

              {isSelected && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-action-primary text-text-inverse"
                >
                  <CheckIcon size={14} />
                </span>
              )}

              {!option.is_available && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-2 rounded-md border border-white bg-background-tertiary px-2 py-[3px] text-[10px] leading-4 text-text-tertiary ${
                    isSelected ? "right-2" : "left-2"
                  }`}
                >
                  ناموجود
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!selected.configuration_image && (
        <p className="mt-2 text-xs leading-6 text-text-secondary">
          تصویر عمومی گیاه نمایش داده می‌شود؛ تصویر این گیاه در گلدان انتخاب‌شده
          هنوز ثبت نشده است.
        </p>
      )}

      {!available && (
        <p role="alert" className="mt-2 text-xs leading-6 text-red-400">
          {productAvailable
            ? POT_UNAVAILABLE_MESSAGE
            : "این گیاه در حال حاضر ناموجود است."}
        </p>
      )}
    </fieldset>
  );
}
