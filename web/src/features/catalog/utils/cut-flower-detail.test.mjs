import test from "node:test";
import assert from "node:assert/strict";
import { stepBundleQuantity, getCutFlowerPurchase, cutFlowerAttributes } from "./cut-flower-detail.ts";

const product = { product_type: "cut_flower", minimum_order_quantity: 2, unit_size: 7, is_in_stock: true, details: { variants: [
  { id: 11, color: "قرمز", price: 130, stock_quantity: 5, is_active: true, is_in_stock: true },
  { id: 12, color: "سفید", price: 175, stock_quantity: 3, is_active: true, is_in_stock: true },
] } };

test("each color starts at minimum, decreases from minimum to zero, and stops at stock", () => {
  assert.equal(stepBundleQuantity(0, 1, 2, 5), 2);
  assert.equal(stepBundleQuantity(2, -1, 2, 5), 0);
  assert.equal(stepBundleQuantity(3, -1, 2, 5), 2);
  assert.equal(stepBundleQuantity(5, 1, 2, 5), 5);
  assert.equal(stepBundleQuantity(0, 1, 2, 1), 0);
  assert.equal(stepBundleQuantity(0, -1, 2, 5), 0);
});

test("independent color quantities derive bundles, stems and mixed-price line totals", () => {
  const quantities = { 11: 2, 12: 3 };
  const purchase = getCutFlowerPurchase(product, quantities);
  assert.equal(purchase.bundles, 5);
  assert.equal(purchase.stems, 35);
  assert.equal(purchase.total, 785);
  assert.deepEqual(purchase.lines.map(line => line.total), [260, 525]);
  assert.equal(purchase.canAdd, true);
  assert.deepEqual(quantities, { 11: 2, 12: 3 });
  assert.equal(getCutFlowerPurchase(product, { 11: 0 }).canAdd, false);
});

test("missing, inactive, unavailable and invalid selected lines remain visible and block add-all", () => {
  for (const quantities of [{ 11: 1 }, { 11: 6 }, { 11: 2.5 }, { 99: 2 }]) {
    const purchase = getCutFlowerPurchase(product, quantities);
    assert.equal(purchase.canAdd, false);
    assert(purchase.lines.some(line => line.error));
  }
  const stale = structuredClone(product);
  stale.details.variants[0].is_active = false;
  assert.equal(getCutFlowerPurchase(stale, { 11: 2, 12: 2 }).canAdd, false);
  stale.details.variants[0].is_active = true;
  stale.details.variants[0].is_in_stock = false;
  assert.equal(getCutFlowerPurchase(stale, { 11: 2 }).canAdd, false);
  assert.equal(getCutFlowerPurchase({ ...product, is_in_stock: false }, { 12: 2 }).canAdd, false);
});

test("technical attributes use the real bundle size and omit absent optional facts", () => {
  assert.deepEqual(cutFlowerAttributes(product), [{ label: "بسته‌بندی", value: "7 شاخه" }]);
  const rows = cutFlowerAttributes({ ...product, details: { ...product.details, stem_length_cm: 60, bloom_opening_stage_display: "نیمه‌باز", flower_grade_display: "ممتاز" } });
  assert.deepEqual(rows.map(row => row.value), ["60 سانت", "نیمه‌باز", "7 شاخه", "ممتاز"]);
});
