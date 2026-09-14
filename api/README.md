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
queryset: a populated response takes two queries regardless of result count.

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
