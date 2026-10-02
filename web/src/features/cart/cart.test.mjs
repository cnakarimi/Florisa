import assert from "node:assert/strict";
import test from "node:test";

import {
  addCartSnapshot,
  calculateCartTotals,
  isCartItemValid,
  normalizeCartQuantity,
  productToCartSnapshot,
  makeCartLineId,
  resolveCutFlowerVariant,
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
    variant_id: 11,
    requires_variant_selection: false,
    validation_message: "",

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
      variants: [
        { id: 11, color: "قرمز", price: 120, stock_quantity: 4, is_active: true, is_in_stock: true },
        { id: 12, color: "سفید", price: 140, stock_quantity: 3, is_active: true, is_in_stock: true },
      ],
    },

    is_in_stock: true,

    ...overrides,
  };
}

const line = (snapshot = product(), quantity = 2) => ({
  line_id: makeCartLineId(snapshot.id, snapshot.variant_id),
  product: snapshot,
  quantity,
});

test("same variant merges while two colors remain separate", () => {
  const first = addCartSnapshot([], product(), 2);
  const merged = addCartSnapshot(first, product(), 2);
  const twoColors = addCartSnapshot(
    merged,
    product({ variant_id: 12, color: "سفید", price: 140, stock_quantity: 3 }),
    2,
  );
  assert.equal(twoColors.length, 2);
  assert.equal(twoColors[0].quantity, 4);
  assert.equal(twoColors[1].quantity, 2);
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
  const items = [line()];

  const increased = setCartItemQuantity(items, "1:11", 4);

  assert.equal(increased[0].quantity, 4);

  const capped = setCartItemQuantity(items, "1:11", 99);

  assert.equal(capped[0].quantity, 5);
});

test("setting quantity below minimum removes the cart item", () => {
  const items = [line()];

  const result = setCartItemQuantity(items, "1:11", 1);

  assert.deepEqual(result, []);
});

test("setting quantity for an unknown product leaves cart unchanged", () => {
  const items = [line()];

  const result = setCartItemQuantity(items, "999:base", 4);

  assert.deepEqual(result, items);
});

test("cart item validation checks availability, quantity, and stock", () => {
  assert.equal(
    isCartItemValid(line()),
    true,
  );

  assert.equal(
    isCartItemValid({
      ...line(),
      quantity: 1,
    }),
    false,
  );

  assert.equal(
    isCartItemValid({
      ...line(),
      quantity: 6,
    }),
    false,
  );

  assert.equal(
    isCartItemValid({
      ...line(product({
        is_available: false,
      })),
    }),
    false,
  );

  assert.equal(
    isCartItemValid({
      ...line(),
      quantity: 2.5,
    }),
    false,
  );
});

test("catalog products are converted into cart snapshots", () => {
  const snapshot = productToCartSnapshot(
    catalogProduct(),
    catalogProduct().details.variants[1],
  );

  assert.deepEqual(snapshot, {
    id: 1,
    slug: "rose",
    name: "رز",
    cover_image: null,

    price: 140,
    unit_size: 10,

    stock_quantity: 3,
    minimum_order_quantity: 2,

    sale_unit: "bunch",
    sale_unit_display: "دسته",

    product_type: "cut_flower",
    product_identity: "رز",
    color: "سفید",
    variant_id: 12,
    requires_variant_selection: false,
    validation_message: "",

    is_in_stock: true,
    is_available: true,
  });
});

test("refresh resolution never substitutes removed colors and uses current variant price and stock", () => {
  const current = catalogProduct();
  const removed = resolveCutFlowerVariant(current, 999);
  assert.equal(removed.variant, null);
  assert.match(removed.message, /حذف یا غیرفعال/);

  const selected = resolveCutFlowerVariant(current, 12);
  const refreshed = productToCartSnapshot(current, selected.variant);
  assert.equal(refreshed.variant_id, 12);
  assert.equal(refreshed.price, 140);
  assert.equal(refreshed.stock_quantity, 3);
});

test("legacy cut flowers resolve only with exactly one active variant", () => {
  assert.equal(resolveCutFlowerVariant(catalogProduct(), null).variant, null);
  const single = catalogProduct({
    details: {
      flower_type: "رز",
      color: "قرمز",
      variants: [catalogProduct().details.variants[0]],
    },
  });
  assert.equal(resolveCutFlowerVariant(single, null).variant.id, 11);
});

test("stock errors can be corrected and hydration preserves excessive quantities visibly", () => {
  const stale = line(product({
    stock_quantity: 1,
    minimum_order_quantity: 1,
    validation_message: "موجودی فعلی 1 دسته است.",
  }), 3);
  const hydrated = parseStoredCart(JSON.stringify({ version: 2, items: [stale] }));
  assert.equal(hydrated[0].quantity, 3);
  assert.equal(isCartItemValid(hydrated[0]), false);
  const corrected = setCartItemQuantity(hydrated, stale.line_id, 1);
  assert.equal(corrected[0].quantity, 1);
  assert.equal(corrected[0].product.validation_message, "");
  assert.equal(isCartItemValid(corrected[0]), true);
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
      ...line(),
    },
    {
      ...line(product({
        id: 2,
        variant_id: 21,
        price: 75,
      }), 3),
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

  const items = [line()];

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

test("legacy cut-flower cart is preserved and requires color reselection", () => {
  const legacyProduct = { ...product() };
  delete legacyProduct.variant_id;
  delete legacyProduct.requires_variant_selection;
  delete legacyProduct.validation_message;
  const parsed = parseStoredCart(JSON.stringify({
    version: 1,
    items: [{ product: legacyProduct, quantity: 3 }],
  }));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].line_id, "1:base");
  assert.equal(parsed[0].quantity, 3);
  assert.equal(parsed[0].product.requires_variant_selection, true);
  assert.match(parsed[0].product.validation_message, /رنگ/);
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
