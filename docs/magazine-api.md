# Florisa Magazine API

Magazine is a dedicated Django app. It follows the catalog's DRF generic views,
explicit public permissions, filter serializers, page-number pagination,
Persian admin labels, and storage configuration. No extra dependencies are required.

## Public endpoints

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/magazine/categories/` | Unpaginated active categories |
| GET | `/api/magazine/articles/` | Paginated article cards |
| GET | `/api/magazine/articles/<slug>/` | Article with content and related cards |

All endpoints are anonymous and read-only; HEAD/OPTIONS are supported by DRF.
POST/PUT/PATCH/DELETE return 405. They are also documented by the project's
existing OpenAPI schema when API documentation is enabled.

Article list query parameters:

- `category=plant-care`: exact category slug.
- `featured=true` or `featured=false`: filter featured status. Omission includes both.
- `page=2`: page number; defaults to the first page.
- `page_size=20`: defaults to 20, capped at 100, matching catalog pagination.

Category and featured filters can be combined. Invalid filter values return 400.
Unknown category slugs return an empty list. Unknown query parameters are ignored,
as in the catalog. Article ordering is always `-published_at`, then `-id`.
Category ordering is `sort_order`, then `id`.

## Publishing and editorial workflow

Create a category, then create an article in Django Admin. Set its title, stable
slug, category, content and reading time. Upload a cover if available. Add related
products/articles using autocomplete in the ordered inlines.

Set both `is_published=True` and a publication date to publish. A future date
schedules publication automatically: no background job is required. An article
is public only when all three conditions hold:

- `is_published=True`;
- `published_at <= timezone.now()`;
- its magazine category is active.

`Article.objects.public()` centralizes these conditions and evaluates the current
time on each request. List, detail and related-article lookups all use it.
Hidden or missing detail slugs return 404, including for authenticated staff.
Drafts can omit `published_at`; publishing without a date is rejected by both
model/admin validation and a database constraint. Featured status never overrides
the publishing rules.

Drafts are the default. `reading_time` defaults to 1 minute and must be at least 1
(model validator and database constraint). Excerpt, cover, and content may be
empty for the MVP. Editors are responsible for their completeness before publication.

Slugs are unique ASCII Django `SlugField` values, consistent with the catalog.
Admin offers prepopulation and manual editing. Saving a changed title/name does
not regenerate an existing slug. For Persian titles, editors should enter an
ASCII slug if the generated suggestion is empty. Changing an existing slug
changes the public URL; redirects are outside this MVP.

## Content format

`content` is a JSON array of block objects. MVP authoring uses plain-text
paragraphs and headings:

```json
[
  {"type": "heading", "text": "Check the soil", "level": 2},
  {"type": "paragraph", "text": "Let the top layer dry before watering."}
]
```

The intentionally small validation contract is:

- The top level must be an array; `[]` is valid.
- Each entry must be an object with a nonempty string `type`.
- If present, `text` must be a string.
- Additional properties and future block types are preserved, without per-type validation.

For example, future image, quote, list, tip or recommendation blocks can use the
same envelope without a model migration. Only the envelope is validated today;
the backend is not a block CMS or a rich-text renderer. Malformed JSON is rejected
by the admin form. Model `clean()` validates the envelope, including empty objects
that ordinary optional JSONField validators would skip.

As in the existing models, direct ORM `save()` does not automatically call
`full_clean()`. Imports or future write services must call `full_clean()` before
saving. Database constraints still protect relationship uniqueness, self-links,
positive reading time and publication-date requirements for all writes.

Frontend renderers should escape text as plain text, never inject it as HTML,
and skip unsupported block types. Image/link blocks need URL validation when a
renderer for them is implemented. Product recommendations are sourced from
`ArticleProduct` and returned as `related_products`; do not store product records
or related-product ID lists in content JSON.

## Relationships, deletion, and images

- `MagazineCategory` owns articles through a protected foreign key: categories
  containing articles cannot be deleted. Deactivate a category to hide its content.
- `ArticleProduct` connects an article to the existing `products.Product` with
  `sort_order`, timestamps and a unique `(article, product)` constraint.
- `ArticleRelation` connects source and target articles with `sort_order`,
  timestamps and a unique pair constraint. Self-links are rejected in admin/model
  validation and by the database. Links are directional; recommending B from A
  does not automatically recommend A from B.
- Both relation types are ordered by `sort_order`, then link `id`. Removing an
  article or product removes its relationship rows; other articles/products remain.
- Related articles are public article cards only, never recursive detail payloads.
- Related products must be active and in an active product category. Out-of-stock
  products remain visible with `is_in_stock=false`, matching catalog behavior.
  Prices and availability always come from the Product table. Checkout continues
  to validate current price and stock through the existing order workflow.
- The catalog list serializer contains subtype details and legacy aliases, so
  Magazine uses a smaller product card serializer with existing field names and
  price units (integer toman).
- Article covers use `ImageField(upload_to="magazine/covers/%Y/%m/")` and the
  project's default storage, like home slides. FileSystemStorage/S3 configuration
  is unchanged. DRF returns request-aware absolute storage URLs or `null` when
  there is no cover. Existing product `cover_image` values remain catalog
  filenames/paths and use the frontend's existing product-image resolver.

## Query behavior

The paginated list uses two queries: count and cards with joined categories.
It defers the article content column. Detail uses three queries: the article with
its category, ordered public product links joined to products, and ordered public
article links joined to target articles/categories. Related article content is
deferred. Query counts do not grow with the number of returned cards, and are
covered by regression tests. A publication-order index supports the public list.

`ArticleDetailSerializer` expects the detail view's filtered
`public_product_links` and `public_article_links` prefetch attributes. Keep those
prefetches when reusing the detail serializer so recommendations remain filtered.

## Response examples

Article list (`GET /api/magazine/articles/?category=plant-care&featured=true`):

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 10,
      "title": "Why Are My Pothos Leaves Turning Yellow?",
      "slug": "why-pothos-leaves-turn-yellow",
      "excerpt": "Common reasons and simple solutions.",
      "cover_image": "https://api.example.com/media/magazine/covers/2026/09/pothos.webp",
      "category": {"id": 1, "name": "Plant Care", "slug": "plant-care"},
      "published_at": "2026-09-01T12:00:00+03:30",
      "reading_time": 4,
      "is_featured": true
    }
  ]
}
```

Article detail (`GET /api/magazine/articles/why-pothos-leaves-turn-yellow/`):

```json
{
  "id": 10,
  "title": "Why Are My Pothos Leaves Turning Yellow?",
  "slug": "why-pothos-leaves-turn-yellow",
  "excerpt": "Common reasons and simple solutions.",
  "cover_image": "https://api.example.com/media/magazine/covers/2026/09/pothos.webp",
  "category": {"id": 1, "name": "Plant Care", "slug": "plant-care"},
  "published_at": "2026-09-01T12:00:00+03:30",
  "reading_time": 4,
  "is_featured": true,
  "content": [
    {"type": "heading", "text": "Check the soil", "level": 2},
    {"type": "paragraph", "text": "Let the top layer dry before watering."}
  ],
  "related_products": [
    {
      "id": 7,
      "name": "Golden Pothos",
      "slug": "golden-pothos",
      "product_type": "plant",
      "price": 450000,
      "cover_image": "golden-pothos.webp",
      "sale_unit": "pot",
      "sale_unit_display": "گلدان",
      "unit_size": 1,
      "minimum_order_quantity": 1,
      "is_in_stock": true
    }
  ],
  "related_articles": [
    {
      "id": 11,
      "title": "Watering Indoor Plants",
      "slug": "watering-indoor-plants",
      "excerpt": "A simple watering guide.",
      "cover_image": null,
      "category": {"id": 1, "name": "Plant Care", "slug": "plant-care"},
      "published_at": "2026-08-25T12:00:00+03:30",
      "reading_time": 3,
      "is_featured": false
    }
  ]
}
```

## Migration and verification

`magazine/migrations/0001_initial.py` creates four models, their relationships,
constraints and public-list index. It depends on `products.0012_product_featured_order`.
No existing migrations or product schema are changed. Apply it through the normal
deployment migration workflow with `python manage.py migrate`.

Backend checks from `api/`:

```powershell
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test magazine --noinput
.\.venv\Scripts\python.exe manage.py test --noinput
```

For isolated local verification without connecting to a configured Neon database,
set these process-local environment variables before running the commands:

```powershell
$env:DATABASE_URL = 'sqlite:///:memory:'
$env:DEBUG = 'True'
$env:MEDIA_STORAGE_BACKEND = 'filesystem'
$env:DEMO_OTP_ENABLED = 'False'
$env:DEMO_OTP_ONLY = 'False'
```

The test runner applies migrations to a temporary test database. This does not
apply the migration to development or production data. Run the same suite against
a dedicated PostgreSQL test database when validating the deployment environment.
Disable demo flags for the full suite because the ordinary authentication tests
expect normal OTP requests; demo-specific tests supply their own settings.
These overrides affect the command process only and do not edit `.env`.
