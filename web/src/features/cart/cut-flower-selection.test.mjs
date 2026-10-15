import test from "node:test";
import assert from "node:assert/strict";
import { addCutFlowerSelectionToCart, calculateCartTotals, resolveCutFlowerVariant, productToCartSnapshot } from "./logic.ts";
import { mapCartToCheckoutItems } from "../orders/utils/request.ts";

const product = { id: 9, name: "گل", slug: "flower", product_type: "cut_flower", price: 1, stock_quantity: 0, is_in_stock: true, unit_size: 7, minimum_order_quantity: 2, sale_unit: "bunch", sale_unit_display: "دسته", cover_image: "flower.webp", details: { flower_type: "رز", variants: [
  { id: 11, color: "قرمز", price: 130, stock_quantity: 8, is_active: true, is_in_stock: true },
  { id: 12, color: "سفید", price: 175, stock_quantity: 4, is_active: true, is_in_stock: true },
] } };
const selection = [{ variantId: 11, quantity: 2 }, { variantId: 12, quantity: 2 }];

test("add-all preserves separate color lines, exact increments, totals and checkout identity", () => {
  const first = addCutFlowerSelectionToCart([], product, selection);
  assert.deepEqual(first.map(line => [line.line_id, line.quantity, line.product.price, line.product.unit_size]), [["9:11", 2, 130, 7], ["9:12", 2, 175, 7]]);
  const second = addCutFlowerSelectionToCart(first, product, selection);
  assert.deepEqual(second.map(line => line.quantity), [4, 4]);
  assert.deepEqual(first.map(line => line.quantity), [2, 2]);
  assert.equal(calculateCartTotals(second).subtotal, 1220);
  assert.deepEqual(mapCartToCheckoutItems(second), [{ product_id: 9, variant_id: 11, quantity: 4 }, { product_id: 9, variant_id: 12, quantity: 4 }]);
});

test("one invalid or overstock merged line rejects the whole action without clamping or partial additions", () => {
  const current = addCutFlowerSelectionToCart([], product, [{ variantId: 12, quantity: 3 }]);
  const before = structuredClone(current);
  assert.throws(() => addCutFlowerSelectionToCart(current, product, selection), /سبد خرید/);
  assert.deepEqual(current, before);
  for (const invalid of [[], [{ variantId: 99, quantity: 2 }], [{ variantId: 11, quantity: 0 }], [{ variantId: 11, quantity: 9 }], [{ variantId: 11, quantity: 2 }, { variantId: 11, quantity: 2 }]]) {
    assert.throws(() => addCutFlowerSelectionToCart(current, product, invalid));
    assert.deepEqual(current, before);
  }
});

test("fresh prices replace old snapshots and a removed color is never substituted", () => {
  const current = addCutFlowerSelectionToCart([], product, selection);
  const fresh = structuredClone(product);
  fresh.details.variants[0].price = 200;
  const merged = addCutFlowerSelectionToCart(current, fresh, [{ variantId: 11, quantity: 2 }]);
  assert.equal(merged[0].product.price, 200);
  fresh.details.variants = fresh.details.variants.filter(variant => variant.id !== 11);
  assert.throws(() => addCutFlowerSelectionToCart(current, fresh, selection), /حذف/);
  const resolution = resolveCutFlowerVariant(fresh, current[0].product.variant_id);
  assert.equal(resolution.variant, null);
  assert.equal(productToCartSnapshot(fresh, fresh.details.variants[0]).variant_id, 12);
});
