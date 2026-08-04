import assert from "node:assert/strict";
import test from "node:test";

import { addCartSnapshot, calculateCartTotals, normalizeCartQuantity } from "./logic.ts";
import { CART_STORAGE_KEY } from "./types.ts";
import { parseStoredCart, readStoredCart, writeStoredCart } from "./storage.ts";

function product(overrides = {}) {
  return {
    id: 1, slug: "rose", name: "رز", cover_image: null, price: 100,
    unit_size: 10, stock_quantity: 5, minimum_order_quantity: 2,
    sale_unit: "bunch", sale_unit_display: "دسته", product_type: "cut_flower",
    product_identity: "رز", color: "قرمز", is_in_stock: true, is_available: true,
    ...overrides,
  };
}

test("duplicate adds merge by product id and respect stock", () => {
  const first = addCartSnapshot([], product(), 2);
  const second = addCartSnapshot(first, product(), 2);
  const capped = addCartSnapshot(second, product(), 2);
  assert.equal(capped.length, 1);
  assert.equal(capped[0].quantity, 5);
});

test("quantity normalization respects minimum, stock, and availability", () => {
  assert.equal(normalizeCartQuantity(product(), 1), 2);
  assert.equal(normalizeCartQuantity(product(), 99), 5);
  assert.equal(normalizeCartQuantity(product({ is_available: false }), 2), null);
  assert.equal(normalizeCartQuantity(product({ stock_quantity: 1 }), 2), null);
});

test("display totals are calculated from quantity and snapshots", () => {
  const totals = calculateCartTotals([
    { product: product(), quantity: 2 },
    { product: product({ id: 2, price: 75 }), quantity: 3 },
  ]);
  assert.deepEqual(totals, { totalQuantity: 5, subtotal: 425 });
});

test("storage serialization hydrates a valid cart and deduplicates ids", () => {
  const memory = new Map();
  globalThis.window = { localStorage: { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) } };
  const items = [{ product: product(), quantity: 2 }];
  writeStoredCart(items);
  assert.equal(memory.has(CART_STORAGE_KEY), true);
  assert.deepEqual(readStoredCart(), items);
  const duplicated = JSON.stringify({ version: 1, items: [...items, { product: product(), quantity: 3 }] });
  assert.equal(parseStoredCart(duplicated)[0].quantity, 3);
  delete globalThis.window;
});
