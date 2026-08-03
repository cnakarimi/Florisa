import type { CatalogProduct } from "@/features/catalog/types";
import { toPersianDigits } from "@/features/home/utils/persian";

export function getProductIdentity(product: CatalogProduct): string {
  if (product.product_type === "plant") {
    return product.details?.plant_type ?? "";
  }
  return product.details?.flower_type ?? "";
}

export function getProductColor(product: CatalogProduct): string {
  return product.details?.color ?? "";
}

export function getSaleUnitLabel(product: CatalogProduct): string {
  if (product.sale_unit === "bunch" && product.unit_size > 1) {
    return `دسته ${toPersianDigits(product.unit_size)} شاخه‌ای`;
  }
  return product.sale_unit_display;
}

export function getPriceUnitLabel(product: CatalogProduct): string {
  return `${getSaleUnitLabel(product)}`;
}
