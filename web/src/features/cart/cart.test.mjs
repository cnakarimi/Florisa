import assert from "node:assert/strict";
import test from "node:test";

import {
  addCartSnapshot,
  calculateCartTotals,
  isCartItemValid,
  normalizeCartQuantity,
  productToCartSnapshot,
  setCartItemQuantity,
} from "./logic.ts";
import { parseStoredCart, readStoredCart, writeStoredCart } from "./storage.ts";
import { CART_STORAGE_KEY } from "./types.ts";

function product(overrides = {}) {
  return {
    id: 1,
    slug: "rose",
    name: "رز",
    cover_image: null,

    price: 100,
    unit_size: 10,

    stock_quantity: 5,
    minimum_order_quantity: 2,

    sale_unit: "bunch",
    sale_unit_display: "دسته",

    product_type: "cut_flower",
    product_identity: "رز",
    color: "قرمز",

    is_in_stock: true,
    is_available: true,

    ...overrides,
  };
}

function catalogProduct(overrides = {}) {
  return {
    id: 1,
    slug: "rose",
    name: "رز",
    cover_image: null,

    price: 100,
    unit_size: 10,

    stock_quantity: 5,
    minimum_order_quantity: 2,

    sale_unit: "bunch",
    sale_unit_display: "دسته",

    product_type: "cut_flower",

    details: {
      flower_type: "رز",
      color: "قرمز",
    },

    is_in_stock: true,

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

  assert.equal(
    normalizeCartQuantity(
      product({
        is_available: false,
      }),
      2,
    ),
    null,
  );

  assert.equal(
    normalizeCartQuantity(
      product({
        stock_quantity: 1,
      }),
      2,
    ),
    null,
  );
});

test("setting cart quantity respects minimum and stock", () => {
  const items = [
    {
      product: product(),
      quantity: 2,
    },
  ];

  const increased = setCartItemQuantity(items, 1, 4);

  assert.equal(increased[0].quantity, 4);

  const capped = setCartItemQuantity(items, 1, 99);

  assert.equal(capped[0].quantity, 5);
});

test("setting quantity below minimum removes the cart item", () => {
  const items = [
    {
      product: product(),
      quantity: 2,
    },
  ];

  const result = setCartItemQuantity(items, 1, 1);

  assert.deepEqual(result, []);
});

test("setting quantity for an unknown product leaves cart unchanged", () => {
  const items = [
    {
      product: product(),
      quantity: 2,
    },
  ];

  const result = setCartItemQuantity(items, 999, 4);

  assert.deepEqual(result, items);
});

test("cart item validation checks availability, quantity, and stock", () => {
  assert.equal(
    isCartItemValid({
      product: product(),
      quantity: 2,
    }),
    true,
  );

  assert.equal(
    isCartItemValid({
      product: product(),
      quantity: 1,
    }),
    false,
  );

  assert.equal(
    isCartItemValid({
      product: product(),
      quantity: 6,
    }),
    false,
  );

  assert.equal(
    isCartItemValid({
      product: product({
        is_available: false,
      }),
      quantity: 2,
    }),
    false,
  );

  assert.equal(
    isCartItemValid({
      product: product(),
      quantity: 2.5,
    }),
    false,
  );
});

test("catalog products are converted into cart snapshots", () => {
  const snapshot = productToCartSnapshot(catalogProduct());

  assert.deepEqual(snapshot, {
    id: 1,
    slug: "rose",
    name: "رز",
    cover_image: null,

    price: 100,
    unit_size: 10,

    stock_quantity: 5,
    minimum_order_quantity: 2,

    sale_unit: "bunch",
    sale_unit_display: "دسته",

    product_type: "cut_flower",
    product_identity: "رز",
    color: "قرمز",

    is_in_stock: true,
    is_available: true,
  });
});

test("plant catalog products use plant identity", () => {
  const snapshot = productToCartSnapshot(
    catalogProduct({
      product_type: "plant",
      details: {
        plant_type: "مونسترا",
        color: "سبز",
      },
    }),
  );

  assert.equal(snapshot.product_identity, "مونسترا");

  assert.equal(snapshot.color, "سبز");
});

test("display totals are calculated from quantity and snapshots", () => {
  const totals = calculateCartTotals([
    {
      product: product(),
      quantity: 2,
    },
    {
      product: product({
        id: 2,
        price: 75,
      }),
      quantity: 3,
    },
  ]);

  assert.deepEqual(totals, {
    totalQuantity: 5,
    subtotal: 425,
  });
});

test("storage serialization hydrates a valid cart and deduplicates ids", () => {
  const memory = new Map();

  globalThis.window = {
    localStorage: {
      getItem: (key) => memory.get(key) ?? null,

      setItem: (key, value) => memory.set(key, value),
    },
  };

  const items = [
    {
      product: product(),
      quantity: 2,
    },
  ];

  writeStoredCart(items);

  assert.equal(memory.has(CART_STORAGE_KEY), true);

  assert.deepEqual(readStoredCart(), items);

  const duplicated = JSON.stringify({
    version: 1,
    items: [
      ...items,
      {
        product: product(),
        quantity: 3,
      },
    ],
  });

  assert.equal(parseStoredCart(duplicated)[0].quantity, 3);

  delete globalThis.window;
});

test("invalid stored cart data is ignored safely", () => {
  assert.deepEqual(parseStoredCart("not-json"), []);

  assert.deepEqual(
    parseStoredCart(
      JSON.stringify({
        version: 999,
        items: [],
      }),
    ),
    [],
  );

  assert.deepEqual(
    parseStoredCart(
      JSON.stringify({
        version: 1,
        items: [
          {
            invalid: true,
          },
        ],
      }),
    ),
    [],
  );
});
