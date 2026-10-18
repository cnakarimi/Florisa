import assert from "node:assert/strict";
import test from "node:test";

import { isProduct, isProductDetail, isProductList, isPaginatedProducts } from "./runtime.ts";

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

test("plant care normalizes missing entries across product response parsers", () => {
  const plant = () => ({ ...shared, product_type: "plant", details: { plant_type: "Plant", care_notes: "Legacy notes" } });
  const product = plant();
  assert.equal(isProduct(product), true);
  assert.deepEqual(product.details.care_items, []);
  const list = [plant()];
  assert.equal(isProductList(list), true);
  assert.deepEqual(list[0].details.care_items, []);
  const page = { count: 1, next: null, previous: null, results: [plant()] };
  assert.equal(isPaginatedProducts(page), true);
  assert.deepEqual(page.results[0].details.care_items, []);
  const detail = { ...plant(), description: "", created_at: "", updated_at: "", rating_average: null, review_count: 0, images: [] };
  assert.equal(isProductDetail(detail), true);
  assert.deepEqual(detail.details.care_items, []);
});

test("plant care preserves populated and empty entries and rejects malformed content", () => {
  const entry = { key: "humidity", value: "Draft", summary: "", explanation: "First line\nSecond line" };
  const product = (care_items) => ({ ...shared, product_type: "plant", details: { plant_type: "Plant", care_items } });
  for (const items of [[], [entry]]) {
    const data = product(items);
    assert.equal(isProduct(data), true);
    assert.deepEqual(data.details.care_items, items);
  }
  for (const invalid of [null, {}, "", [{ ...entry, key: "care" }], [{ ...entry, summary: null }], [{ key: "soil", value: "Draft" }], [{ ...entry, explanation: 1 }]]) {
    assert.equal(isProduct(product(invalid)), false);
  }
});

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
