import type { Metadata } from "next";

import { HomeExperience } from "@/features/home/components/HomeExperience";
import type { ProductQuery } from "@/features/catalog/types";

export const metadata: Metadata = {
  title: "فروشگاه | فلوریسا",
  description: "مشاهده و خرید گل‌ها و گیاهان فلوریسا",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const numberValue = (key: string) => {
    const raw = value(key);
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };
  const booleanValue = (key: string) => {
    const raw = value(key);
    return raw === "true" ? true : raw === "false" ? false : undefined;
  };
  const initialQuery: ProductQuery = {};
  const search = value("search");
  const category = value("category");
  const productType = value("product_type");
  const ordering = value("ordering");
  const saleUnit = value("sale_unit");
  if (search) initialQuery.search = search;
  if (category) initialQuery.category = category;
  if (productType === "plant" || productType === "cut_flower") initialQuery.product_type = productType;
  if (ordering === "newest" || ordering === "price" || ordering === "-price" || ordering === "name" || ordering === "-name") initialQuery.ordering = ordering;
  if (saleUnit === "item" || saleUnit === "pot" || saleUnit === "stem" || saleUnit === "bunch" || saleUnit === "bouquet") initialQuery.sale_unit = saleUnit;
  initialQuery.min_price = numberValue("min_price");
  initialQuery.max_price = numberValue("max_price");
  initialQuery.in_stock = booleanValue("in_stock");
  initialQuery.min_height = numberValue("min_height");
  initialQuery.max_height = numberValue("max_height");
  initialQuery.min_stem_length = numberValue("min_stem_length");
  initialQuery.max_stem_length = numberValue("max_stem_length");
  initialQuery.min_vase_life = numberValue("min_vase_life");
  const plantSize = value("plant_size");
  if (plantSize === "small" || plantSize === "medium" || plantSize === "large") initialQuery.plant_size = plantSize;
  const grade = value("quality_grade");
  if (grade === "standard" || grade === "premium" || grade === "luxury") initialQuery.quality_grade = grade;
  const flowerGrade = value("flower_grade");
  if (flowerGrade === "standard" || flowerGrade === "premium" || flowerGrade === "luxury") initialQuery.flower_grade = flowerGrade;
  const care = value("care_difficulty");
  if (care === "easy" || care === "medium" || care === "hard") initialQuery.care_difficulty = care;
  const light = value("light_requirement");
  if (light === "low" || light === "indirect" || light === "bright" || light === "direct") initialQuery.light_requirement = light;
  const watering = value("watering_requirement");
  if (watering === "low" || watering === "medium" || watering === "high") initialQuery.watering_requirement = watering;
  for (const key of ["pet_friendly", "pot_included", "has_drainage"] as const) initialQuery[key] = booleanValue(key);
  for (const key of ["pot_material", "pot_color", "flower_type", "variety", "color"] as const) initialQuery[key] = value(key);
  const fragrance = value("fragrance_level");
  if (fragrance === "none" || fragrance === "light" || fragrance === "medium" || fragrance === "strong") initialQuery.fragrance_level = fragrance;
  const season = value("seasonal_availability");
  if (season === "year_round" || season === "spring" || season === "summer" || season === "autumn" || season === "winter") initialQuery.seasonal_availability = season;

  return <HomeExperience view="shop" initialQuery={initialQuery} />;
}
