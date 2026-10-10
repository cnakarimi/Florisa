# Django authentication API

Local backend for the Sina Flower Next.js application.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

The development OTP provider prints generated codes to the Django console.

## Resume demo OTP

The deployment can expose the real authentication flow to recruiters without
depending on SMS delivery. Configure these values only in the deployment
environment (never commit the actual phone or code):

```dotenv
DEMO_OTP_ENABLED=true
DEMO_OTP_ONLY=true
DEMO_OTP_PHONE=<valid Iranian mobile number>
DEMO_OTP_CODE=<five-digit code>
```

`DEMO_OTP_PHONE` is normalized exactly like an authentication request. For
that exact normalized phone only, Django hashes and stores `DEMO_OTP_CODE` as
an ordinary expiring, attempt-limited, one-time OTP challenge and skips the
delivery provider. The existing verification, user lookup/creation, session
login, profile-completion, and CSRF flow stays active. The configured code is
never returned or logged by the demo path.

With `DEMO_OTP_ONLY=false`, every other phone continues through the configured
OTP delivery provider. With `DEMO_OTP_ONLY=true`, other phones receive the
standard `{"detail": "..."}` API error envelope.

This checkout does not yet implement real SMS delivery or production request
throttling. Both are deferred to Level 5. Production throttling must use an
atomic shared implementation, such as Redis or a correctly locked database
rate bucket; verification attempt limits are not request throttling.

The demo OTP flow never authenticates an account that is staff or superuser at
request or verification time. An administrator can still promote an account
after authentication, so the shared demo account must never contain private or
sensitive data.

When production SMS delivery is approved, set both `DEMO_OTP_ENABLED` and
`DEMO_OTP_ONLY` to `false` (or remove them), remove the demo phone/code from
the deployment environment, and configure the approved production delivery
backend. Demo mode is disabled by default.

## Endpoints

- `GET /api/auth/csrf/`
- `POST /api/auth/request-otp/`
- `POST /api/auth/verify-otp/`
- `GET /api/auth/me/`
- `POST /api/auth/complete-registration/`
- `POST /api/auth/logout/`

Authentication uses Django's HttpOnly session cookie. Unsafe authenticated
requests require the `X-CSRFToken` header using the readable `csrftoken`
cookie supplied by Django.

The development configuration explicitly allows credentialed requests from
`http://localhost:3000` and `http://127.0.0.1:3000`. Secure cookies remain
disabled for plain-HTTP local development and should be enabled in production.

## Related products

`GET /api/products/<slug>/related/` is public and read-only. It returns up to
eight products in the current product's category, excluding the current product.
Both the current product and every returned product must be active and belong
to an active category, matching the public catalog and detail endpoint. An
unknown or hidden current product returns HTTP 404 with the usual `{"detail": "..."}`
error. Out-of-stock products remain eligible; product type is not an additional
filter.

Results use the catalog's newest-first default, with descending ID as a stable
tie-breaker (`-created_at`, `-id`). Selection and ordering are separate in
`ProductRelatedListView.get_queryset()` so future ranking can be added before
the limit without changing visibility or serialization.

HTTP 200 returns a plain JSON array, or `[]` when there are no matches. Pagination
is disabled because this is a fixed maximum of eight, following the existing
unpaginated categories and home-slides endpoints. There is no `count`, `next`,
`previous`, or `results` wrapper. Query parameters (including catalog filters,
ordering, page, page_size, and limit) do not change this fixed selection.

Each array item uses the unchanged `ProductListSerializer`, exactly the same
representation as an item in `/api/products/`'s `results` array:

```json
[
  {
    "id": 42,
    "name": "Pothos",
    "slug": "pothos",
    "product_type": "plant",
    "product_type_display": "گیاه",
    "short_description": "",
    "price": 450000,
    "stock_quantity": 0,
    "sale_unit": "pot",
    "sale_unit_display": "گلدان",
    "unit_size": 1,
    "minimum_order_quantity": 1,
    "cover_image": "golden-pothos.webp",
    "is_featured": false,
    "is_in_stock": false,
    "category": {"id": 2, "name": "Indoor plants", "slug": "indoor-plants"},
    "details": null,
    "price_per_bundle": 450000,
    "stock_bundles": 0,
    "stems_per_bundle": 1,
    "minimum_order_bundles": 1
  }
]
```

`details` uses the existing plant/cut-flower detail representation, or is `null`
when those details are missing or inconsistent (as in this example). The four
legacy commercial aliases and existing image URL behavior are preserved. No
admin-only fields or detail-only images, description, or review aggregates are
added. Category and both detail relations are joined in the shared public
queryset, and arrangement composition plus cut-flower variants are prefetched;
the query count remains fixed regardless of result count.

## Uploaded media

Local development stores uploads on disk. Production uses the existing PostgreSQL
database as temporary small-image storage, with no additional paid infrastructure.
See [media storage](../docs/media-storage.md) for required deployment settings,
migrations, upload limits, recovery of missing images, and the later S3/R2 switch.

## Magazine

The dedicated `magazine` app provides public category, article list, and article
detail endpoints, with editorial management in Django Admin. See
[the Magazine API guide](../docs/magazine-api.md) for publishing rules, structured
content format, related products/articles, pagination, and response examples.

## Product type and checkout contracts

Reusable plant pots extend this contract with a separate `pot_option_id`.
Plants can use baseline plastic at zero surcharge or an assigned decorative
pot with a surcharge and shared inventory. See [plant pot selection](../docs/plant-pot-selection.md)
for the API, migration, inventory, snapshot and Admin workflow details.

All prices are integer toman. `quantity` always counts sale units: pots for a
plant, complete ready-made arrangements for an arrangement, and bundles for a
cut-flower color. A cut flower's `unit_size` is the shared number of stems in
one bundle.

Plant detail (unchanged):

```json
{"id": 10, "product_type": "plant", "price": 450000,
 "stock_quantity": 8, "sale_unit": "pot", "unit_size": 1,
 "minimum_order_quantity": 1,
 "details": {"plant_type": "پتوس", "pot_included": true}}
```

Arrangement detail:

```json
{"id": 20, "product_type": "arrangement", "price": 1500000,
 "stock_quantity": 4, "sale_unit": "item", "unit_size": 1,
 "minimum_order_quantity": 1,
 "details": {"arrangement_type": "flower_box",
   "arrangement_type_display": "باکس گل",
   "approximate_dimensions": "۳۰ × ۲۰ سانتی‌متر",
   "dominant_color_theme": "صورتی", "design_style": "مدرن",
   "composition": [
     {"id": 1, "label": "رز صورتی", "stem_count": 12, "sort_order": 1},
     {"id": 2, "label": "برگ اکالیپتوس", "stem_count": null, "sort_order": 2}
   ]}}
```

Cut-flower detail:

```json
{"id": 30, "product_type": "cut_flower", "price": 420000,
 "stock_quantity": 15, "sale_unit": "bunch", "unit_size": 20,
 "minimum_order_quantity": 1, "has_purchasable_variant": true,
 "details": {"flower_type": "رز", "flower_grade": "premium",
   "bloom_opening_stage": "semi_open", "stem_length_cm": 60,
   "variants": [
     {"id": 301, "color": "قرمز", "price": 420000,
      "stock_quantity": 10, "is_active": true, "is_in_stock": true},
     {"id": 302, "color": "سفید", "price": 460000,
      "stock_quantity": 5, "is_active": true, "is_in_stock": true}
   ]}}
```

For cut flowers, top-level `price` is the lowest active-variant price and
top-level `stock_quantity` is the sum of active-variant stock. With no active
variant they are `0`, and both `is_in_stock` and `has_purchasable_variant` are
false. The legacy bundle aliases remain and use these derived values.

Preview and order creation accept the same line shape:

```json
{"items": [
  {"product_id": 10, "quantity": 2},
  {"product_id": 20, "quantity": 1},
  {"product_id": 30, "variant_id": 301, "quantity": 3},
  {"product_id": 30, "variant_id": 302, "quantity": 1}
]}
```

`variant_id` is rejected for plants and arrangements and required for cut
flowers. For compatibility, an omitted cut-flower variant is resolved only
when exactly one active variant exists. Server-side current prices and stock
remain authoritative. Preview and order responses include `variant_id` and
`variant_color`; order items additionally preserve `variant_id_snapshot` and
the color after variant deletion.

Existing cut flowers receive one active variant from their previous color,
price, and stock during migration. The frontend now parses all three product
types and keys cart lines by `(product_id, variant_id)`. Its current color
selector adds one color at a time; selecting quantities for multiple colors in
one action remains a frontend follow-up.
