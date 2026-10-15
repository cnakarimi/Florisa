# Mobile cut-flower product detail

Visual reference: [Figma, DetailPageMobile - branch (1106:2101)](https://www.figma.com/design/Q7JyYNkPdrzeaF8pKAe9Px/florisa.ir?node-id=1106-2101). The reference width is 375px; the implementation is responsive.

The shared `/products/[slug]` route renders `CutFlowerMobileDetail` below 768px for `product_type=cut_flower`. Existing desktop presentation and its single-variant purchase control remain in place. Plant and arrangement pages keep their existing paths.

## Presentation and purchasing

Section order: product gallery/navigation/zoom, identity/actions/rating, independent color quantities and selection summary, technical attributes, one product description, optional supplied care/shipping notes, reviews with pagination, related products, shared footer. The fixed PurchaseBar supports no selection, ready, pending, success, error, and unavailable states.

- Each row uses a stable API variant ID, price per bundle, stock, and availability. Zero means unselected. Increasing from zero starts at the product minimum; decreasing from the minimum returns to zero.
- Stems are bundle quantities multiplied by the API `unit_size`. Line totals use each variant's current price; the purchase total sums the lines. Gallery navigation does not change quantities.
- Add-all first refreshes existing cart lines and the product. Every selected increment, including existing same-variant cart quantities, is validated before one cart state update. No color is silently clamped, replaced, or partially added.
- A cart mutation during refresh aborts that refresh and asks for a retry, preserving the newer edit. Pending additions are locked against duplicate clicks and quantity changes.
- Cart v3 identities and checkout mapping stay unchanged: colors remain separate product/variant lines. Checkout still recalculates authoritative prices and availability on the backend. No batch endpoint or schema change is needed.
- Technical attributes use supplied stem length, opening stage, bundle size, and grade. Other supplied specifications and care/shipping notes are optional. Missing facts are omitted.
- Existing original Figma SVG assets are reused from `web/public/images/arrangement-detail`; their native dimensions and rendered geometry are preserved. Product images come from the API.
- Safe-area padding and footer clearance follow the shared PurchaseBar. If shared mobile bottom navigation is mounted, the bar moves above it and footer clearance increases.

## API and design differences

- `CutFlowerVariant` currently supplies ID, color label, price, stock, active status, and availability. It has no image field, product-image association, or color code. The page therefore omits sample per-color thumbnails, color dots, and color-image preview controls. The real product gallery remains independent of purchasing selections. No photo is guessed from a color label.
- The frame mixes zero row quantities with a selected badge and nonzero sample summary. The implementation starts at zero and derives badges, bundle/stem totals, price, and button state from the actual quantities.
- The frame's plant-oriented sample copy and duplicate descriptions are adapted to the cut-flower API data. No sample scientific name, price, bundle size, claim, or review is copied.
- Review submission, review photos, and product-linked articles are omitted. Existing API-backed review reading and pagination remain supported. The shared footer is retained.
- The normal local catalog currently contains only one variant per cut-flower product. Mixed-color coverage requires an isolated fixture database; demonstration records must never be inserted into the normal database.

## Files

New presentation: `CutFlowerMobileDetail.tsx` and its CSS module.

New purchasing/attribute utility and tests: `utils/cut-flower-detail.ts`, `utils/cut-flower-detail.test.mjs`, and `cart/cut-flower-selection.test.mjs`.

Integration: `ProductDetailView.tsx`, `ProductDetailExperience.tsx`, `catalog/types.ts`, `cart/logic.ts`, and `CartProvider.tsx`. Shared presentation support: `PurchaseBar.tsx`, `ProductDescription.tsx`, and `app/globals.css`. Plant/arrangement prop types exclude the cut-flower-specific action; their behavior is unchanged.

## Verification

From `web`:

```powershell
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Completed: 61 frontend tests passed; TypeScript, lint, and diff checks passed. Browser verification at 375px, 390px, and 1440px covers independent quantities, minimum/stock limits, seven-stem bundles, mixed prices, exact cart merges, all-or-nothing rejection, pending duplicate protection, unavailable/removed variants, stale stored cart identities, gallery navigation/zoom/swipe, long Persian text, review expansion, and real backend checkout preview. Plant pot selection/cart, arrangement quantity/cart, and existing desktop purchasing were regression-checked. A separate cross-tab mutation check verifies that pending refresh cannot overwrite a newer cart edit.

Screenshots were compared against the Figma reference. Native asset geometry, horizontal overflow, fixed-bar/footer clearance, and coordination with a mounted 48px bottom navigation were checked. Browser safe-area insets were zero; nonzero device insets are handled in CSS and were not measured on physical hardware.

Verification uses a separate SQLite copy and disposable test records when suitable multi-color cut-flower products are unavailable in the normal catalog. Local harnesses, fixture databases, cookies, logs, and screenshots remain ignored test artifacts. The normal database is checked unchanged before and after verification. No migrations are needed for this frontend feature.

Suggested commit: `feat(product-detail): implement mobile cut-flower selection`, including the atomic cart support, shared presentation changes, focused tests, and this document together. Keep unrelated navigation edits and older verification artifacts outside that commit.
