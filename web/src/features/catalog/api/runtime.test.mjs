import assert from "node:assert/strict";
import test from "node:test";

import { isProduct } from "./runtime.ts";

const shared = {
  id: 1,
  name: "محصول",
  slug: "product",
  product_type_display: "محصول",
  short_description: "",
  price: 100000,
  stock_quantity: 3,
  sale_unit: "item",
  sale_unit_display: "عدد",
  unit_size: 1,
  minimum_order_quantity: 1,
  cover_image: null,
  is_featured: false,
  is_in_stock: true,
  has_purchasable_variant: true,
  category: { id: 1, name: "گل", slug: "flowers" },
};

test("arrangement details and ordered descriptive composition parse", () => {
  assert.equal(isProduct({
    ...shared,
    product_type: "arrangement",
    details: {
      arrangement_type: "flower_box",
      arrangement_type_display: "باکس گل",
      approximate_dimensions: "۳۰ × ۲۰ سانتی‌متر",
      dominant_color_theme: "صورتی",
      design_style: "مدرن",
      care_notes: "",
      shipping_notes: "",
      composition: [
        { id: 1, label: "رز هلندی", stem_count: 8, sort_order: 0 },
        { id: 2, label: "اسفنج و باکس", stem_count: null, sort_order: 1 },
      ],
    },
  }), true);
});

test("cut-flower variants require stable ids, prices, stock and active flags", () => {
  const cutFlower = {
    ...shared,
    product_type: "cut_flower",
    sale_unit: "bunch",
    unit_size: 20,
    details: {
      flower_type: "رز",
      variants: [
        { id: 11, color: "قرمز", price: 120000, stock_quantity: 4, is_active: true, is_in_stock: true },
      ],
    },
  };
  assert.equal(isProduct(cutFlower), true);
  assert.equal(isProduct({
    ...cutFlower,
    details: { ...cutFlower.details, variants: [{ color: "قرمز" }] },
  }), false);
});
