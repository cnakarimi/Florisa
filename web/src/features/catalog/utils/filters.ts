import type { ProductQuery, ProductType } from "../types";

export const PLANT_FILTER_KEYS = [
  "plant_size",
  "min_height",
  "max_height",
  "quality_grade",
  "pet_friendly",
  "pot_included",
  "pot_material",
  "pot_color",
  "has_drainage",
  "light_requirement",
  "watering_requirement",
  "care_difficulty",
] as const satisfies readonly (keyof ProductQuery)[];

export const CUT_FLOWER_FILTER_KEYS = [
  "flower_type",
  "variety",
  "color",
  "min_stem_length",
  "max_stem_length",
  "flower_grade",
  "min_vase_life",
  "fragrance_level",
  "seasonal_availability",
] as const satisfies readonly (keyof ProductQuery)[];

export function clearIncompatibleFilters(
  query: ProductQuery,
  productType?: ProductType,
): ProductQuery {
  const next = { ...query, product_type: productType };

  const keysToClear =
    productType === "plant"
      ? CUT_FLOWER_FILTER_KEYS
      : productType === "cut_flower"
        ? PLANT_FILTER_KEYS
        : [...PLANT_FILTER_KEYS, ...CUT_FLOWER_FILTER_KEYS];

  for (const key of keysToClear) {
    delete next[key];
  }

  if (!productType) {
    delete next.product_type;
  }

  return next;
}
