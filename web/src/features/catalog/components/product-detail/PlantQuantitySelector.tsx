import { toPersianDigits } from "@/utils/persian";

interface Props {
  quantity: number;
  minimum: number;
  maximum: number;
  available: boolean;
  onChange: (quantity: number) => void;
}

export function PlantQuantitySelector({ quantity, minimum, maximum, available, onChange }: Props) {
  return <section className="py-4" aria-label="تعداد گیاه">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-mobile-ui-button font-semibold">تعداد گیاه</h2>
        <p className="mt-1 text-mobile-ui-caption text-text-secondary">{available ? `حداقل سفارش ${toPersianDigits(minimum)} گیاه` : "در حال حاضر ناموجود"}</p>
      </div>
      <div className="flex h-10 items-center rounded-xl border border-white/10 bg-background-secondary" role="group" aria-label="تعداد گیاه">
        <button type="button" aria-label="افزایش تعداد گیاه" disabled={!available || quantity >= maximum} onClick={() => onChange(quantity + 1)} className="h-10 w-10 text-xl text-text-brand disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-action-primary">+</button>
        <output data-plant-quantity aria-live="polite" className="numeric-ltr min-w-10 text-center text-sm font-semibold">{toPersianDigits(quantity)}</output>
        <button type="button" aria-label="کاهش تعداد گیاه" disabled={!available || quantity <= minimum} onClick={() => onChange(quantity - 1)} className="h-10 w-10 text-xl text-text-brand disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-action-primary">−</button>
      </div>
    </div>
    <p className="mt-2 text-xs leading-6 text-text-secondary">هر واحد شامل یک گیاه همراه با یک گلدان انتخاب‌شده است.</p>
  </section>;
}
