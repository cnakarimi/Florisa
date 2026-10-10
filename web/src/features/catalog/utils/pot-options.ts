import type { CatalogProduct, PlantPotOption, PlantProductDetails } from "../types";

export const BASELINE_POT_NAME = "گلدان پلاستیکی پایه";
export const POT_UNAVAILABLE_MESSAGE = "گلدان انتخاب‌شده ناموجود است؛ لطفاً گلدان دیگری انتخاب کنید.";

export function getPlantPotOptions(product: CatalogProduct): PlantPotOption[] {
  if (product.product_type !== "plant") return [];
  return product.pot_options ?? [{ id: null, pot_id: null, name: BASELINE_POT_NAME,
    is_baseline: true, additional_price: 0, unit_price: product.price, image: null,
    configuration_image: null, attributes: { material: "پلاستیک" },
    is_available: product.is_in_stock, max_quantity: product.stock_quantity }];
}

export function initialPlantPot(product: CatalogProduct): PlantPotOption | null {
  const options = getPlantPotOptions(product);
  return options.find(option => option.id === product.initial_pot_option_id && option.is_available)
    ?? options.find(option => !option.is_baseline && option.is_available)
    ?? options.find(option => option.is_baseline) ?? null;
}

export function selectedPotDetails(details: PlantProductDetails, pot: PlantPotOption | null): PlantProductDetails {
  return { ...details, pot_included: true, pot_material: String(pot?.attributes.material ?? ""),
    pot_color: String(pot?.attributes.color ?? ""),
    pot_size_cm: typeof pot?.attributes.diameter_cm === "number" ? pot.attributes.diameter_cm : null,
    has_drainage: null };
}
