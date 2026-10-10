import test from "node:test";
import assert from "node:assert/strict";
import { addCartSnapshot, makeCartLineId, productToCartSnapshot, resolvePlantPotOption } from "./logic.ts";
import { parseStoredCart } from "./storage.ts";
import { initialPlantPot } from "../catalog/utils/pot-options.ts";
import { cartFingerprint } from "../orders/utils/checkoutAttempt.ts";
import { mapCartToCheckoutItems } from "../orders/utils/request.ts";
import { parseOrderItemErrors } from "../orders/api/runtime.ts";

const baseline = { id: null, pot_id: null, name: "گلدان پلاستیکی پایه", is_baseline: true, additional_price: 0, unit_price: 1000, image: null, configuration_image: null, attributes: { material: "پلاستیک" }, is_available: true, max_quantity: 8 };
const paid = { ...baseline, id: 7, pot_id: 3, name: "سفید", is_baseline: false, additional_price: 200, unit_price: 1200, configuration_image: "/media/combination.webp", max_quantity: 4 };
const second = { ...paid, id: 8, pot_id: 4, name: "آبی", additional_price: 300, unit_price: 1300 };
const plant = { id: 10, name: "گیاه", slug: "plant", product_type: "plant", cover_image: "plant.webp", price: 1000, stock_quantity: 8, minimum_order_quantity: 1, sale_unit: "pot", sale_unit_display: "گلدان", unit_size: 1, is_in_stock: true, details: { plant_type: "آزمایش", color: "سبز" }, pot_options: [baseline, paid, second], initial_pot_option_id: 8 };

test("initial preference, ordered decorative fallback, and baseline fallback agree with availability", () => {
  assert.equal(initialPlantPot(plant).id, 8);
  assert.equal(initialPlantPot({ ...plant, pot_options: [baseline, paid] }).id, 7);
  assert.equal(initialPlantPot({ ...plant, pot_options: [baseline] }).id, null);
});

test("baseline and paid configurations have separate prices, images, quantities, and cart identities", () => {
  const basic = productToCartSnapshot(plant);
  const decorated = productToCartSnapshot(plant, null, paid);
  assert.equal(basic.price, 1000);
  assert.equal(basic.pot_option_id, null);
  assert.equal(decorated.price, 1200);
  assert.equal(decorated.cover_image, paid.configuration_image);
  let cart = addCartSnapshot([], basic, 2);
  cart = addCartSnapshot(cart, decorated, 2);
  cart = addCartSnapshot(cart, productToCartSnapshot(plant, null, second), 1);
  assert.equal(cart.length, 3);
  assert.equal(makeCartLineId(10, null, 7), "10:pot:7");
  cart = addCartSnapshot(cart, decorated, 5);
  assert.equal(cart.find(item => item.product.pot_option_id === 7).quantity, 4);
});

test("removed or unavailable selected pots require reselection and are never replaced by the initial option", () => {
  const refreshed = { ...plant, pot_options: [baseline, second] };
  const result = resolvePlantPotOption(refreshed, 7);
  assert.equal(result.option, null);
  assert.match(result.message, /گلدان دیگری/);
  assert.equal(resolvePlantPotOption(refreshed, null).option.id, null);
  const unavailablePlant = resolvePlantPotOption({ ...plant, is_in_stock: false, pot_options: [{ ...baseline, is_available: false }] }, null);
  assert.equal(unavailablePlant.option, null);
  assert.match(unavailablePlant.message, /گیاه/);
});

test("refresh keeps pot identity while adopting current surcharge and availability limit", () => {
  const current = { ...paid, additional_price: 500, unit_price: 1500, max_quantity: 2 };
  const resolution = resolvePlantPotOption({ ...plant, pot_options: [baseline, current] }, 7);
  const snapshot = productToCartSnapshot(plant, null, resolution.option);
  assert.equal(snapshot.pot_option_id, 7);
  assert.equal(snapshot.price, 1500);
  assert.equal(snapshot.stock_quantity, 2);
});

test("v2 plant carts migrate to baseline while v3 preserves paid identity and reselection state", () => {
  const snapshot = productToCartSnapshot(plant, null, paid);
  const old = parseStoredCart(JSON.stringify({ version: 2, items: [{ product: snapshot, quantity: 2 }] }))[0];
  assert.equal(old.product.pot_option_id, null);
  assert.equal(old.product.pot_surcharge, 0);
  assert.equal(old.line_id, "10:base");
  const current = parseStoredCart(JSON.stringify({ version: 3, items: [{ product: { ...snapshot, requires_pot_selection: true }, quantity: 2 }] }))[0];
  assert.equal(current.product.pot_option_id, 7);
  assert.equal(current.product.requires_pot_selection, true);
  assert.equal(current.line_id, "10:pot:7");
});

test("checkout mapping, errors and idempotency distinguish two pot configurations", () => {
  const items = [baseline, paid].map(option => ({ product: productToCartSnapshot(plant, null, option), quantity: 2 }));
  const request = mapCartToCheckoutItems(items);
  assert.deepEqual(request.map(item => item.pot_option_id), [null, 7]);
  assert.notEqual(cartFingerprint([request[0]]), cartFingerprint([request[1]]));
  assert.equal(cartFingerprint(request), cartFingerprint([...request].reverse()));
  assert.deepEqual(parseOrderItemErrors({ item_errors: [{ product_id: 10, pot_option_id: 7, message: "ناموجود" }, { product_id: 10, pot_option_id: null, message: "تعداد" }] }), { "10:pot:7": "ناموجود", "10:base": "تعداد" });
});
