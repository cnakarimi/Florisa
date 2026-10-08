import type { PlantProductDetails } from "../types";

export function getPlantPurchase(quantity: number, minimum: number, stock: number, inStock: boolean, price: number) {
  const minimumQuantity = Math.max(1, Math.trunc(minimum));
  const availableStock = Math.max(0, Math.trunc(stock));
  const canBuy = inStock && availableStock >= minimumQuantity;
  const selectedQuantity = canBuy
    ? Math.min(availableStock, Math.max(minimumQuantity, Math.trunc(quantity)))
    : minimumQuantity;
  return { minimumQuantity, availableStock, canBuy, quantity: selectedQuantity, total: price * selectedQuantity };
}

export interface SpecificationRow { label: string; value: string | number | boolean | null }
export interface SpecificationGroup { title: string; rows: SpecificationRow[] }

export function getPlantSpecificationGroups(details: PlantProductDetails): SpecificationGroup[] {
  const groups: SpecificationGroup[] = [
    { title: "مشخصات گیاه", rows: [
      { label: "نوع گیاه", value: details.plant_type },
      { label: "ارتفاع تقریبی گیاه", value: details.approximate_height_cm === null ? null : `${details.approximate_height_cm} سانتی‌متر` },
      { label: "اندازه گیاه", value: details.plant_size_display },
      { label: "سطح نگهداری", value: details.care_difficulty_display },
      { label: "رنگ برگ", value: details.color },
      { label: "درجه کیفیت", value: details.quality_grade_display },
      { label: "سازگار با حیوانات خانگی", value: details.pet_friendly },
    ] },
    { title: "مشخصات گلدان", rows: [
      { label: "گلدان همراه محصول", value: details.pot_included },
      ...(details.pot_included ? [
        { label: "قطر دهانه گلدان", value: details.pot_size_cm === null ? null : `${details.pot_size_cm} سانتی‌متر` },
        { label: "جنس گلدان", value: details.pot_material },
        { label: "رنگ گلدان", value: details.pot_color },
        { label: "سوراخ زهکشی", value: details.has_drainage },
      ] : []),
    ] },
    { title: "شرایط سفارش و ارسال", rows: [{ label: "نکات ارسال", value: details.shipping_notes }] },
  ];
  return groups.map(group => ({ ...group, rows: group.rows.filter(row => row.value !== null && row.value !== "") })).filter(group => group.rows.length > 0);
}
