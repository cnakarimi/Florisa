# Mobile arrangement product detail

Visual reference: [Figma, DetailPageMobile - boquete (1099:1807)](https://www.figma.com/design/Q7JyYNkPdrzeaF8pKAe9Px/florisa.ir?node-id=1099-1807).

The shared `/products/[slug]` route renders `ArrangementMobileDetail` for arrangements below 768px. The desktop view keeps its existing presentation and purchasing behavior. Plant pot selection and cut-flower variants keep their existing paths.

## Presentation and API mapping

Section order: gallery, product summary, design specifications, ordered composition, one expandable description, reviews, related products, then the shared footer. The PurchaseBar remains fixed with safe-area and footer clearance.

- Product identity, images, rating, price, minimum, and stock come from the catalog API.
- `arrangement_type_display`, `approximate_dimensions`, `dominant_color_theme`, and `design_style` populate the specifications. Empty optional values are omitted.
- Composition is ordered by `sort_order`, then `id`. A stem count appears only when the API supplies one. Composition entries are descriptive; they are not individual purchasable flowers.
- Quantity counts complete arrangements (`sale_unit=item`, `unit_size=1`), is bounded by minimum/stock, and determines the displayed total and cart quantity. It is locked during the PurchaseBar action. Checkout continues to send identifiers and quantities for server-authoritative recalculation.
- Reviews initially show three loaded entries. The existing review controls reveal the remaining loaded entries and support backend pagination.
- Static SVGs in `web/public/images/arrangement-detail` are original exports from the linked frame, rendered at their native dimensions. Product imagery remains API-driven.

## Intentional differences from the frame

- The API has no composition image field: rows show actual labels and optional counts without sample flower thumbnails.
- Reviews support names, ratings, comments, and timestamps. Photo avatars, review photos, and submission forms are not supplied by the current contract; no sample photos or inactive submission button are rendered.
- There is no product-related article relationship. The mobile arrangement page does not show generic magazine cards as related articles.
- The frame's duplicate description is consolidated. Its plant-specific sample labels/content are replaced by arrangement data and appropriate headings.
- A compact quantity control occupies the unused left side of the specification heading so customers can order complete arrangements. Gallery dots reflect actual slides, rather than the frame's sample dot count.
- The existing shared footer is retained, including its current supported/placeholder functionality.

## Changed frontend files

New files: `ArrangementMobileDetail.tsx`, `ArrangementMobileDetail.module.css`, `utils/arrangement-detail.ts`, and its test file.

Integration and reuse: `ProductDetailView.tsx`, `ProductGallery.tsx`, `ProductInfo.tsx`, `ProductDescription.tsx`, `ProductReviews.tsx`, `RelatedProducts.tsx`, `PurchaseBar.tsx`, `PlantMobileSections.tsx` (shared icon renderer), and `app/globals.css` (arrangement gallery navigation takes precedence over the route navbar on mobile).

## Verification

Run from `web`:

```powershell
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Browser coverage uses a disposable copy of the local database when there is no suitable arrangement in the normal catalog. Do not insert demonstration records into the normal database. Use existing applied schema; no migrations are required by this frontend change.

Coverage at 375px, 390px, and 1440px includes gallery navigation/zoom, actual dot count and duplicate-cover removal, quantity minimum/stock limits, total, pending/duplicate-click protection, cart quantity, authoritative checkout preview, bouquet/box/basket types, unavailable and empty optional data, description expansion, review expansion, and footer clearance. Regression coverage uses saved plant-pot assignments and actual cut-flower variants.

Disposable fixture databases, session cookies, local harnesses, build caches, and fixture screenshots are excluded from Git. Screenshots contain fixture catalog data rather than personal customer data.

Completed verification: 54 frontend tests passed; TypeScript, lint, and `git diff --check` passed. The browser coverage above passed at all three widths with no page exceptions. The normal SQLite database's SHA-256 remained unchanged. Existing local frontend and backend responses returned HTTP 200 after verification.
