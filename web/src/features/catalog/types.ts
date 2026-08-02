export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  sort_order: number;
}

export type ProductType = "plant" | "cut_flower";
export type SaleUnit = "item" | "pot" | "stem" | "bunch" | "bouquet";
export type QualityGrade = "standard" | "premium" | "luxury";
export type PlantSize = "small" | "medium" | "large";
export type LightRequirement = "low" | "indirect" | "bright" | "direct";
export type WateringRequirement = "low" | "medium" | "high";
export type CareDifficulty = "easy" | "medium" | "hard";
export type FragranceLevel = "none" | "light" | "medium" | "strong";
export type SeasonalAvailability =
  | "year_round"
  | "spring"
  | "summer"
  | "autumn"
  | "winter";

export interface ProductCategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface PlantProductDetails {
  plant_type: string;
  color: string;
  plant_size: PlantSize | "";
  plant_size_display: string;
  approximate_height_cm: number | null;
  quality_grade: QualityGrade | "";
  quality_grade_display: string;
  pet_friendly: boolean | null;
  pot_included: boolean;
  pot_material: string;
  pot_color: string;
  pot_size_cm: number | null;
  has_drainage: boolean | null;
  light_requirement: LightRequirement | "";
  light_requirement_display: string;
  watering_requirement: WateringRequirement | "";
  watering_requirement_display: string;
  care_difficulty: CareDifficulty | "";
  care_difficulty_display: string;
  ideal_temperature_min: number | null;
  ideal_temperature_max: number | null;
  care_notes: string;
  shipping_notes: string;
}

export interface CutFlowerProductDetails {
  flower_type: string;
  variety: string;
  color: string;
  stem_length_cm: number | null;
  flower_grade: QualityGrade | "";
  flower_grade_display: string;
  vase_life_days: number | null;
  origin: string;
  fragrance_level: FragranceLevel | "";
  fragrance_level_display: string;
  seasonal_availability: SeasonalAvailability | "";
  seasonal_availability_display: string;
  care_notes: string;
  shipping_notes: string;
}

interface ProductBase {
  id: number;
  name: string;
  slug: string;
  product_type_display: string;
  short_description: string;
  price: number;
  stock_quantity: number;
  sale_unit: SaleUnit;
  sale_unit_display: string;
  unit_size: number;
  minimum_order_quantity: number;
  cover_image: string | null;
  is_featured: boolean;
  is_in_stock: boolean;
  category: ProductCategorySummary;
}

export interface PlantProduct extends ProductBase {
  product_type: "plant";
  details: PlantProductDetails | null;
}

export interface CutFlowerProduct extends ProductBase {
  product_type: "cut_flower";
  details: CutFlowerProductDetails | null;
}

export type CatalogProduct = PlantProduct | CutFlowerProduct;

export interface CatalogProductImage {
  id: number;
  image: string;
  alt_text: string;
  sort_order: number;
}

export type CatalogProductDetail = CatalogProduct & {
  description: string;
  images: CatalogProductImage[];
  created_at: string;
  updated_at: string;
};

export interface PaginatedCatalogProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogProduct[];
}

export type ProductOrdering = "newest" | "price" | "-price" | "name" | "-name";

export interface ProductQuery {
  category?: string | null;
  search?: string;
  product_type?: ProductType;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sale_unit?: SaleUnit;
  featured?: boolean;
  ordering?: ProductOrdering;
  plant_size?: PlantSize;
  min_height?: number;
  max_height?: number;
  quality_grade?: QualityGrade;
  pet_friendly?: boolean;
  pot_included?: boolean;
  pot_material?: string;
  pot_color?: string;
  has_drainage?: boolean;
  light_requirement?: LightRequirement;
  watering_requirement?: WateringRequirement;
  care_difficulty?: CareDifficulty;
  flower_type?: string;
  variety?: string;
  color?: string;
  min_stem_length?: number;
  max_stem_length?: number;
  flower_grade?: QualityGrade;
  min_vase_life?: number;
  fragrance_level?: FragranceLevel;
  seasonal_availability?: SeasonalAvailability;
  page?: number;
  page_size?: number;
}

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
  for (const key of keysToClear) delete next[key];
  if (!productType) delete next.product_type;
  return next;
}
