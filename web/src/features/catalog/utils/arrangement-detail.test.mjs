import test from "node:test";
import assert from "node:assert/strict";
import { arrangementComposition, arrangementSpecifications, getArrangementPurchase } from "./arrangement-detail.ts";
import { productToCartSnapshot, addCartSnapshot } from "../../cart/logic.ts";
import { mapCartToCheckoutItems } from "../../orders/utils/request.ts";

test("complete arrangements respect minimum, stock and current unit price", () => {
  assert.equal(getArrangementPurchase(1, 2, 4, true, 420000).quantity, 2);
  assert.equal(getArrangementPurchase(3, 2, 4, true, 420000).total, 1260000);
  assert.equal(getArrangementPurchase(99, 2, 4, true, 420000).quantity, 4);
  assert.equal(getArrangementPurchase(2, 2, 1, true, 420000).canBuy, false);
  assert.equal(getArrangementPurchase(2, 2, 4, false, 420000).canBuy, false);
});

test("optional specifications are omitted and composition retains supplied counts in stable order", () => {
  const details = { arrangement_type_display: "باکس گل", approximate_dimensions: "", dominant_color_theme: "  ", design_style: "کلاسیک", composition: [
    { id: 3, label: "رز", sort_order: 2, stem_count: 7 },
    { id: 2, label: "اکالیپتوس", sort_order: 1, stem_count: null },
    { id: 1, label: "لیسیانتوس", sort_order: 1, stem_count: 3 },
  ] };
  assert.deepEqual(arrangementSpecifications(details).map(row => row.value), ["باکس گل", "کلاسیک"]);
  assert.deepEqual(arrangementComposition(details).map(row => [row.id, row.stem_count]), [[1, 3], [2, null], [3, 7]]);
  assert.equal(details.composition[0].id, 3);
});

test("selected quantity is complete items in cart and identifier-only checkout payload", () => {
  const product = { id: 12, name: "گل‌آرایی", slug: "arrangement", product_type: "arrangement", price: 420000, stock_quantity: 4, minimum_order_quantity: 2, sale_unit: "item", sale_unit_display: "عدد", unit_size: 1, is_in_stock: true, cover_image: null, category: { name: "گل‌آرایی" }, details: { arrangement_type_display: "دسته‌گل" } };
  const cart = addCartSnapshot([], productToCartSnapshot(product), 3);
  assert.equal(cart[0].quantity, 3);
  assert.equal(cart[0].product.unit_size, 1);
  assert.equal(cart[0].product.sale_unit, "item");
  assert.deepEqual(mapCartToCheckoutItems(cart), [{ product_id: 12, quantity: 3 }]);
});
