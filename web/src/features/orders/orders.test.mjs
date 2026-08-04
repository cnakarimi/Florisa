import assert from "node:assert/strict";
import test from "node:test";

import { isAddress, isCartPreview, isOrder } from "./api/runtime.ts";
import { cartFingerprint } from "./utils/checkoutAttempt.ts";
import { completeCheckout, mapCartToCheckoutItems } from "./utils/request.ts";

test("checkout request maps only product ids and quantities", () => {
  assert.deepEqual(mapCartToCheckoutItems([{ product: { id: 7, price: 999 }, quantity: 3 }]), [{ product_id: 7, quantity: 3 }]);
  assert.equal(cartFingerprint([{ product_id: 7, quantity: 3 }, { product_id: 2, quantity: 1 }]), "2:1|7:3");
});

test("cart clears only after a successful checkout", async () => {
  let clears = 0;
  await assert.rejects(() => completeCheckout(() => Promise.reject(new Error("failed")), () => { clears += 1; }));
  assert.equal(clears, 0);
  const result = await completeCheckout(() => Promise.resolve({ id: 1 }), () => { clears += 1; });
  assert.deepEqual(result, { id: 1 });
  assert.equal(clears, 1);
});

test("address, preview, and order runtime parsers reject malformed payloads", () => {
  assert.equal(isAddress({ id: 1 }), false);
  assert.equal(isCartPreview({ items: [], subtotal: 12 }), false);
  assert.equal(isOrder({ public_number: "guessable" }), false);
});
