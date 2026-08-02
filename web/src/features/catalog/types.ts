export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image: string | null;
  sort_order: number;
}

export type QualityGrade = "standard" | "premium" | "luxury";
export type CareDifficulty = "easy" | "medium" | "hard";

export interface ProductCategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  flower_type: string;
  color: string;
  short_description: string;
  plant_size?: string;
  plant_height_cm?: number | null;
  quality_grade?: QualityGrade | "";
  quality_grade_display?: string;
  is_pet_friendly?: boolean | null;
  pot_included?: boolean;
  pot_material?: string;
  pot_color?: string;
  pot_size_cm?: number | null;
  pot_has_drainage?: boolean | null;
  light_requirement?: string;
  watering_requirement?: string;
  care_difficulty?: CareDifficulty | "";
  care_difficulty_display?: string;
  ideal_temperature?: string;
  care_tips?: string;
  delivery_notes?: string;
  stems_per_bundle: number;
  price_per_bundle: number;
  stock_bundles: number;
  minimum_order_bundles: number;
  cover_image: string | null;
  is_featured: boolean;
  is_in_stock: boolean;
  category: ProductCategorySummary;
}

export interface CatalogProductImage {
  id: number;
  image: string;
  alt_text: string;
  sort_order: number;
}

export interface CatalogProductDetail extends CatalogProduct {
  description: string;
  images: CatalogProductImage[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedCatalogProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogProduct[];
}

export type ProductOrdering = "newest" | "price" | "-price";

export interface ProductQuery {
  category?: string | null;
  search?: string;
  featured?: boolean;
  ordering?: ProductOrdering;
  page?: number;
  page_size?: number;
}
