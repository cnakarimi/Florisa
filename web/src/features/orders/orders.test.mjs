import assert from "node:assert/strict";
import test from "node:test";

import {
  isAddress,
  isCartPreview,
  isOrder,
  parseOrderItemErrors,
} from "./api/runtime.ts";
import { cartFingerprint } from "./utils/checkoutAttempt.ts";
import { completeCheckout, mapCartToCheckoutItems } from "./utils/request.ts";
import {
  removeAddressAfterSuccess,
  upsertAddress,
} from "./utils/addressState.ts";

const address = (id, isDefault = false) => ({
  id,
  title: "خانه",
  recipient_name: "گیرنده",
  recipient_phone: "09123456789",
  province: "تهران",
  city: "تهران",
  district: "",
  address_line: "نشانی",
  plaque: "",
  unit: "",
  postal_code: "",
  delivery_note: "",
  is_default: isDefault,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
});

test("checkout request includes exact cut-flower variant identity", () => {
  assert.deepEqual(
    mapCartToCheckoutItems([
      {
        product: {
          id: 7,
          variant_id: 42,
          price: 999,
        },
        quantity: 3,
      },
    ]),
    [
      {
        product_id: 7,
        variant_id: 42,
        quantity: 3,
      },
    ],
  );

  assert.equal(
    cartFingerprint([
      {
        product_id: 7,
        variant_id: 42,
        quantity: 3,
      },
      {
        product_id: 2,
        quantity: 1,
      },
    ]),
    "2:base:1|7:42:3",
  );
});

test("cart clears only after a successful checkout", async () => {
  let clears = 0;

  await assert.rejects(() =>
    completeCheckout(
      () => Promise.reject(new Error("failed")),
      () => {
        clears += 1;
      },
    ),
  );

  assert.equal(clears, 0);

  const result = await completeCheckout(
    () => Promise.resolve({ id: 1 }),
    () => {
      clears += 1;
    },
  );

  assert.deepEqual(result, {
    id: 1,
  });

  assert.equal(clears, 1);
});

test("address, preview, and order runtime parsers reject malformed payloads", () => {
  assert.equal(
    isAddress({
      id: 1,
    }),
    false,
  );

  assert.equal(
    isCartPreview({
      items: [],
      subtotal: 12,
    }),
    false,
  );

  assert.equal(
    isOrder({
      public_number: "guessable",
    }),
    false,
  );
});

test("order item errors are parsed from backend error payloads", () => {
  const result = parseOrderItemErrors({
    item_errors: [
      {
        product_id: 7,
        message: "موجودی این محصول تغییر کرده است.",
      },
      {
        product_id: "12",
        message: "تعداد انتخاب‌شده معتبر نیست.",
      },
      {
        product_id: null,
        message: "ignored",
      },
      {
        product_id: 15,
        message: "",
      },
      {
        invalid: true,
      },
    ],
  });

  assert.deepEqual(result, {
    "7:base": "موجودی این محصول تغییر کرده است.",
    "12:base": "تعداد انتخاب‌شده معتبر نیست.",
  });

  assert.deepEqual(parseOrderItemErrors(null), {});

  assert.deepEqual(
    parseOrderItemErrors({
      item_errors: "invalid",
    }),
    {},
  );
});

const previewItem = (overrides = {}) => ({
  product_id: 7,
  variant_id: null,
  variant_color: "",
  product_name: "باکس گل",
  product_type: "arrangement",
  sale_unit: "item",
  sale_unit_display: "عدد",
  unit_size: 1,
  quantity: 1,
  unit_price: "350000",
  line_total: "350000",
  cover_image: "",
  stock_quantity: 3,
  minimum_order_quantity: 1,
  ...overrides,
});

test("arrangement previews and historical nullable variant snapshots parse", () => {
  assert.equal(isCartPreview({
    items: [previewItem()],
    subtotal: "350000",
    delivery_fee: "0",
    total: "350000",
    payment_method: "cash_on_delivery",
    payment_method_display: "پرداخت در محل",
  }), true);

  assert.equal(isOrder({
    public_number: "F-123",
    status: "pending",
    status_display: "در انتظار",
    payment_method: "cash_on_delivery",
    payment_method_display: "پرداخت در محل",
    payment_status: "unpaid",
    payment_status_display: "پرداخت‌نشده",
    subtotal: "350000",
    delivery_fee: "0",
    total: "350000",
    address_title: "خانه",
    recipient_name: "گیرنده",
    recipient_phone: "09123456789",
    province: "تهران",
    city: "تهران",
    district: "",
    address_line: "نشانی",
    plaque: "",
    unit: "",
    postal_code: "",
    delivery_note: "",
    customer_note: "",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    items: [{
      ...previewItem(),
      id: 1,
      product: null,
      variant: null,
      variant_id_snapshot: null,
      stock_quantity: undefined,
      minimum_order_quantity: undefined,
    }],
  }), true);
});

test("variant-specific backend errors map to the matching cart line", () => {
  assert.deepEqual(parseOrderItemErrors({
    item_errors: [{ product_id: "7", variant_id: "42", message: "موجودی رنگ تغییر کرده است." }],
  }), { "7:42": "موجودی رنگ تغییر کرده است." });
});

test("confirmed default updates keep a single visible default", () => {
  const next = upsertAddress([address(1, true), address(2)], address(2, true));

  assert.deepEqual(
    next.map((item) => [item.id, item.is_default]),
    [
      [2, true],
      [1, false],
    ],
  );
});

test("successful deletion removes the address only after the request succeeds", async () => {
  const current = [address(1, true), address(2)];

  let requested = false;

  const next = await removeAddressAfterSuccess(current, 2, async () => {
    requested = true;
  });

  assert.equal(requested, true);

  assert.deepEqual(
    next.map((item) => item.id),
    [1],
  );

  assert.deepEqual(
    current.map((item) => item.id),
    [1, 2],
  );
});

test("failed deletion leaves local address state unchanged", async () => {
  const current = [address(1, true), address(2)];

  await assert.rejects(() =>
    removeAddressAfterSuccess(current, 2, () =>
      Promise.reject(new Error("failed")),
    ),
  );

  assert.deepEqual(
    current.map((item) => item.id),
    [1, 2],
  );
});
