import { Flower2, Leaf, Package, Sun, Truck } from "lucide-react";
import type { ReactNode } from "react";

import type {
  CutFlowerProductDetails,
  PlantProductDetails,
} from "@/features/catalog/types";
import { toPersianDigits } from "@/features/home/utils/persian";

interface SpecificationItem {
  label: string;
  value: string;
}

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
  if (items.length === 0 && !body) return null;
  return (
    <section className="mx-4 mt-8 rounded-[22px] border border-white/[0.06] bg-[#181a18] p-4 sm:mx-6 sm:p-5 md:mx-8">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#e8e5df]">
        <span className="text-[#c7a23c]">{icon}</span>
        {title}
      </h2>
      {items.length > 0 ? (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/[0.05] bg-black/10 px-3 py-2.5">
              <dt className="text-[10px] text-white/35">{item.label}</dt>
              <dd className="mt-1 text-xs font-semibold leading-6 text-white/75">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {body ? <p className="mt-4 text-xs leading-7 text-white/55">{body}</p> : null}
    </section>
  );
}

const yesNo = (value: boolean) => (value ? "دارد" : "ندارد");

export function PlantSpecifications({ details }: { details: PlantProductDetails }) {
  const identity: SpecificationItem[] = [
    details.plant_type ? { label: "نوع گیاه", value: details.plant_type } : null,
    details.color ? { label: "رنگ", value: details.color } : null,
    details.plant_size_display ? { label: "اندازه گیاه", value: details.plant_size_display } : null,
    details.approximate_height_cm !== null
      ? { label: "ارتفاع تقریبی", value: `${toPersianDigits(details.approximate_height_cm)} سانتی‌متر` }
      : null,
    details.quality_grade_display ? { label: "درجه کیفیت", value: details.quality_grade_display } : null,
    details.pet_friendly !== null
      ? { label: "سازگاری با حیوانات خانگی", value: details.pet_friendly ? "سازگار" : "سازگار نیست" }
      : null,
  ].filter((item): item is SpecificationItem => item !== null);

  const pot: SpecificationItem[] = [
    { label: "گلدان همراه", value: yesNo(details.pot_included) },
    details.pot_included && details.pot_material ? { label: "جنس گلدان", value: details.pot_material } : null,
    details.pot_included && details.pot_color ? { label: "رنگ گلدان", value: details.pot_color } : null,
    details.pot_included && details.pot_size_cm !== null
      ? { label: "اندازه گلدان", value: `${toPersianDigits(details.pot_size_cm)} سانتی‌متر` }
      : null,
    details.pot_included && details.has_drainage !== null
      ? { label: "زهکشی", value: yesNo(details.has_drainage) }
      : null,
  ].filter((item): item is SpecificationItem => item !== null);

  const care: SpecificationItem[] = [
    details.light_requirement_display ? { label: "نور", value: details.light_requirement_display } : null,
    details.watering_requirement_display ? { label: "آبیاری", value: details.watering_requirement_display } : null,
    details.care_difficulty_display ? { label: "سختی نگهداری", value: details.care_difficulty_display } : null,
    details.ideal_temperature_min !== null || details.ideal_temperature_max !== null
      ? {
          label: "دمای مناسب",
          value: [details.ideal_temperature_min, details.ideal_temperature_max]
            .filter((value): value is number => value !== null)
            .map(toPersianDigits)
            .join(" تا ") + " درجه سانتی‌گراد",
        }
      : null,
  ].filter((item): item is SpecificationItem => item !== null);

  return (
    <>
      <SpecificationsSection title="مشخصات گیاه" items={identity} icon={<Leaf className="size-5" />} />
      <SpecificationsSection title="گلدان همراه" items={pot} icon={<Package className="size-5" />} />
      <SpecificationsSection title="راهنمای نگهداری" items={care} body={details.care_notes} icon={<Sun className="size-5" />} />
      <SpecificationsSection title="نکات ارسال" items={[]} body={details.shipping_notes} icon={<Truck className="size-5" />} />
    </>
  );
}

export function CutFlowerSpecifications({ details }: { details: CutFlowerProductDetails }) {
  const items: SpecificationItem[] = [
    details.flower_type ? { label: "نوع گل", value: details.flower_type } : null,
    details.variety ? { label: "رقم", value: details.variety } : null,
    details.color ? { label: "رنگ", value: details.color } : null,
    details.stem_length_cm !== null
      ? { label: "طول ساقه", value: `${toPersianDigits(details.stem_length_cm)} سانتی‌متر` }
      : null,
    details.flower_grade_display ? { label: "درجه گل", value: details.flower_grade_display } : null,
    details.vase_life_days !== null
      ? { label: "ماندگاری در گلدان", value: `${toPersianDigits(details.vase_life_days)} روز` }
      : null,
    details.origin ? { label: "مبدأ", value: details.origin } : null,
    details.fragrance_level_display ? { label: "میزان رایحه", value: details.fragrance_level_display } : null,
    details.seasonal_availability_display ? { label: "فصل عرضه", value: details.seasonal_availability_display } : null,
  ].filter((item): item is SpecificationItem => item !== null);

  return (
    <>
      <SpecificationsSection title="مشخصات گل شاخه‌ای" items={items} icon={<Flower2 className="size-5" />} />
      <SpecificationsSection title="راهنمای نگهداری" items={[]} body={details.care_notes} icon={<Sun className="size-5" />} />
      <SpecificationsSection title="نکات ارسال" items={[]} body={details.shipping_notes} icon={<Truck className="size-5" />} />
    </>
  );
}
