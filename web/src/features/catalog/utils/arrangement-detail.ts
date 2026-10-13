import type { ArrangementProductDetails } from "../types";
import { getPlantPurchase } from "./plant-detail.ts";

// Complete arrangements use the same minimum/stock bounds as complete plants.
export const getArrangementPurchase = getPlantPurchase;

export function arrangementSpecifications(details: ArrangementProductDetails) {
  return [
    { label: "نوع طراحی", value: details.arrangement_type_display },
    { label: "ابعاد تقریبی", value: details.approximate_dimensions },
    { label: "تم رنگی غالب", value: details.dominant_color_theme },
    { label: "سبک دیزاین", value: details.design_style },
  ].filter(row => row.value.trim());
}

export function arrangementComposition(details: ArrangementProductDetails) {
  return [...details.composition].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}
