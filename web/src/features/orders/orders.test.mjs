import assert from "node:assert/strict";
import test from "node:test";

import { isAddress, isCartPreview, isOrder } from "./api/runtime.ts";
import { cartFingerprint } from "./utils/checkoutAttempt.ts";
import { completeCheckout, mapCartToCheckoutItems } from "./utils/request.ts";
import { removeAddressAfterSuccess, upsertAddress } from "./utils/addressState.ts";

const address = (id, isDefault = false) => ({ id, title: "خانه", recipient_name: "گیرنده", recipient_phone: "09123456789", province: "تهران", city: "تهران", district: "", address_line: "نشانی", plaque: "", unit: "", postal_code: "", delivery_note: "", is_default: isDefault, created_at: "2026-01-01", updated_at: "2026-01-01" });

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

test("confirmed default updates keep a single visible default", () => {
  const next = upsertAddress([address(1, true), address(2)], address(2, true));
  assert.deepEqual(next.map((item) => [item.id, item.is_default]), [[2, true], [1, false]]);
});

test("failed deletion leaves local address state unchanged", async () => {
  const current = [address(1, true), address(2)];
  await assert.rejects(() => removeAddressAfterSuccess(current, 2, () => Promise.reject(new Error("failed"))));
  assert.deepEqual(current.map((item) => item.id), [1, 2]);
});
