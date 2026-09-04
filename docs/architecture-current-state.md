# Florisa Current-State Architecture

**Snapshot date:** 2026-09-03  
**Scope:** the current working tree, including pre-existing uncommitted frontend changes  
**Method:** static inspection of repository files; no application code was changed and no packages were installed

This document describes what exists now. Recommendations are confined to the clearly labeled risk, review-order, and final-summary sections.

## 1. Repository Overview

Florisa is a two-project monorepo. `web/` is the Next.js application and `api/` is the Django project. There is no root package manager, workspace manifest, Docker configuration, CI configuration, `render.yaml`, or `vercel.json`; deployment behavior is driven by platform settings, environment variables, `web/next.config.ts`, and `api/build.sh`.

```text
flower-platform/
├── README.md
├── docs/
│   └── architecture-current-state.md
├── web/                              # Next.js 15 / React 19 frontend
│   ├── public/images/                # repository-owned product/category/brand assets
│   ├── src/
│   │   ├── app/                      # App Router pages and Next route handlers
│   │   ├── components/
│   │   │   ├── icons/                # custom currentColor SVG icons
│   │   │   └── ui/PrimaryButton.tsx
│   │   ├── design/design-tokens.css
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── catalog/
│   │   │   ├── favorites/
│   │   │   ├── home/
│   │   │   ├── orders/
│   │   │   └── profile/
│   │   └── lib/                      # class-name and shared API helpers
│   ├── .env.example
│   ├── package.json
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   └── tsconfig.json
└── api/                              # Django 5.2 / DRF backend
    ├── accounts/                     # users, OTP, session authentication
    ├── products/                     # catalog, typed products, HomeSlide
    ├── orders/                       # addresses, checkout, orders
    ├── config/                       # settings, root URLs, health, ASGI/WSGI
    ├── .env.example
    ├── .python-version
    ├── build.sh
    ├── manage.py
    └── requirements.txt
```

### Important configuration and scripts

| File | Current responsibility |
| --- | --- |
| `web/package.json` | Next dev/build/start, ESLint, and a Node test command for six `.test.mjs` files. Runtime dependencies are Next, React, React Hook Form, Zod, Framer Motion, and Lucide. |
| `web/next.config.ts` | Validates backend/media origins, permits backend media and Unsplash images, rewrites `/media/*` to Django, disables API caching, enables strict mode, and requires `BACKEND_URL` on Vercel. |
| `web/tsconfig.json` | Strict TypeScript, bundler resolution, `@/* -> src/*`, no emit. |
| `web/postcss.config.mjs` | Tailwind CSS 4 PostCSS plugin. There is no `tailwind.config.*`; CSS-first Tailwind configuration is used. |
| `web/eslint.config.mjs` | Next core-web-vitals/TypeScript presets; permits raw `<img>` under `src/features/home/**/*.tsx`. |
| `api/config/settings.py` | Installed apps/middleware, database, REST defaults, sessions/CSRF/CORS, storage, security headers, OpenAPI, logging, and OTP configuration. |
| `api/config/environment.py` | Strict parsing and validation of demo-OTP environment values. |
| `api/build.sh` | Installs requirements, runs Django checks/migrations, and collects static files for deployment. |
| `api/products/management/commands/seed_catalog.py` | Idempotently creates built-in categories and indoor-plant seed products through `products/seeding.py`. |

### Environment handling

- Frontend server-side variables are `BACKEND_URL` and optional `MEDIA_HOST`, documented in `web/.env.example`. Browser code does not read a `NEXT_PUBLIC_*` backend URL.
- `web/src/app/api/[...path]/route.ts` keeps browser requests same-origin and reads `BACKEND_URL` only on the Next server.
- Django loads `api/.env` with `python-dotenv`; the file is ignored. `api/.env.example` documents secrets, database, allowed origins, cookie/security flags, OTP, logging, API-doc, and optional S3 settings.
- `DATABASE_URL` selects PostgreSQL (Neon in deployment); absence falls back to `api/db.sqlite3` locally.
- `RENDER=true` affects the default for `DEBUG`; production also defaults to secure cookies, SSL redirect, and HSTS.
- The root `README.md` contains older examples using `NEXT_PUBLIC_API_BASE_URL` and names technologies/folders that are not in the current frontend. Treat the executable configuration as authoritative.

### Static and media

- Repository-owned images live in `web/public/images/` and are served by Next.js.
- Django static assets use `STATIC_ROOT=api/staticfiles` and WhiteNoise `CompressedManifestStaticFilesStorage`.
- Django uploaded media uses `api/media` with `FileSystemStorage` by default or `storages.backends.s3.S3Storage` when `MEDIA_STORAGE_BACKEND=s3`.
- Django only adds a development media URL pattern when `DEBUG=True`. Production uploaded media therefore depends on correctly configured external/S3 storage or platform serving.

## 2. Frontend Architecture

### App Router and layouts

`web/src/app/layout.tsx` is the only root layout. It is a Server Component that loads Vazirmatn with `next/font`, declares global metadata/viewport, sets Persian RTL HTML, installs `CartProvider -> FavoritesProvider -> AuthProvider`, and renders the global `Footer`. `web/src/app/auth/layout.tsx` only adds auth metadata and returns its children.

All 17 `page.tsx` files are Server Components. They are deliberately thin except `web/src/app/shop/page.tsx`, which parses and narrows URL query values into `ProductQuery`. Actual application data fetching is client-side after hydration. There are route-level loading files only for `/cart` and `/products/[slug]`; no `error.tsx`, `not-found.tsx`, or Suspense-based server-data layer exists.

### Feature and shared layers

- `src/features/*` is the main organization boundary. Each substantial domain owns some combination of `api`, `components`, `hooks`, `types`, `utils`, and tests.
- `src/components/ui` contains one reusable primitive, `PrimaryButton`.
- `src/components/icons` contains six SVG icon components plus the shared `IconProps` type.
- `src/lib/api` is the cross-feature network boundary. `apiRequest` handles credentials, CSRF, JSON parsing, redirects, and normalized `ApiError` objects.
- `src/design/design-tokens.css` is the token bridge into Tailwind 4; `globals.css` adds global spacing variables and a small set of utilities.

### Actual dependency flow

```text
Server page/layout
  -> client feature experience
     -> presentation components + feature/context hooks
        -> feature API function
           -> shared apiRequest()
              -> same-origin /api/*
                 -> Next catch-all proxy route
                    -> Django REST endpoint
                       -> PostgreSQL / storage
```

Exceptions:

- `/care` calls the local Next route `/api/plant-care` directly from `PlantAICare`; that route returns a fixed response and does not call Django or an AI provider.
- Magazine cards use static `ARTICLES` from `web/src/features/home/data/products.ts`.
- Favorites are browser-only `localStorage`; there is no Django favorites model or endpoint.
- Cart is also persisted locally, but product snapshots are refreshed from Django before checkout and checkout totals are recomputed by Django.

### Server/client boundary

- Server: layouts, all pages, loading files, route handlers, and pure modules.
- Explicit client entry points: 39 files with `"use client"`, covering providers, stateful screens, navigation hooks, browser storage, gestures, forms, and API effects.
- Files such as `ArticleModal.tsx`, `FavoritesView.tsx`, and `PlantAICare.tsx` have no directive but are imported only beneath `HomeExperience`, so they execute in its client module graph.
- There is no server-side catalog, product, auth, address, or order fetch. Consequently the initial server HTML delegates nearly every feature screen to a client component.

### Images and responsive behavior

The app uses `next/image` through `CatalogImage`, direct `Image` components, and `getImageProps` plus `<picture>` in `HomeHero`. Tailwind responsive utilities primarily use `sm`, `md`, `lg`, and `xl`. `HomeDesktop` is now a single CSS-responsive presentation tree; desktop-only and mobile-only sections are controlled with utilities. Mobile bottom navigation is fixed and global CSS adjusts footer padding using `:has()` and `data-footer-overlay` attributes.

## 3. Frontend Route Map

There are **17 user-facing page routes** and two internal route-handler paths.

| Route | Page/file | Main responsibility | Major components | Data source |
| --- | --- | --- | --- | --- |
| `/` | `web/src/app/page.tsx` | Home storefront | `HomeExperience`, `HomeDesktop`, `HomeHero`, `ProductCard`, `ArticleModal` | Categories/products/HomeSlide APIs; static articles |
| `/shop` | `web/src/app/shop/page.tsx` | Searchable/filterable catalog | `HomeExperience`, `ScrollNavbar`, `ShopCatalog`, `ProductCard` | URL search params + categories/products APIs |
| `/products/[slug]` | `web/src/app/products/[slug]/page.tsx` | Product gallery, specs, cart action | `ShopNavigationScrollNavbar`, `ProductDetailExperience`, `ProductDetailView`, `CartDrawer` | Product-detail API |
| `/favorites` | `web/src/app/favorites/page.tsx` | Saved products | `HomeExperience`, `FavoritesView`, `BottomNav` | `FavoritesProvider` localStorage snapshot |
| `/care` | `web/src/app/care/page.tsx` | Plant-care chat prototype | `HomeExperience`, `PlantAICare`, `BottomNav` | Local `/api/plant-care` fixed response + client fallback |
| `/cart` | `web/src/app/cart/page.tsx` | Persistent cart review/edit | `CartPageExperience`, `CatalogImage`, `BottomNav` | `CartProvider` localStorage + product-detail refresh |
| `/checkout` | `web/src/app/checkout/page.tsx` | Auth/cart gate and COD checkout | `CheckoutGate`, `CheckoutExperience`, `AddressForm` | Auth/cart contexts + address/preview/order APIs |
| `/auth` | `web/src/app/auth/page.tsx` | Phone entry and OTP request | `PhoneAuthForm`, `PhoneInput`, `AuthDemoHint` | Auth context -> request-OTP API |
| `/auth/verify` | `web/src/app/auth/verify/page.tsx` | OTP entry/verification/resend | `OtpVerifyForm`, `OtpInput`, `ResendTimer` | sessionStorage phone + auth APIs |
| `/auth/register` | `web/src/app/auth/register/page.tsx` | Complete required profile | `RegisterExperience`, `RegisterView` | Auth context -> complete-registration API |
| `/auth/registration-success` | `web/src/app/auth/registration-success/page.tsx` | One-time welcome screen | `WelcomeExperience`, `WelcomeView` | Auth context + sessionStorage flow token |
| `/profile` | `web/src/app/profile/page.tsx` | Account hub and logout | `ProfileExperience`, `ProfileView`, `AccountNavigation` | Auth/cart contexts; logout API |
| `/profile/edit` | `web/src/app/profile/edit/page.tsx` | Persist name/email edits | `AccountEditExperience`, `AccountRouteGuard`, `AccountPageShell` | Auth context -> `PATCH /api/auth/me/` |
| `/profile/addresses` | `web/src/app/profile/addresses/page.tsx` | Address CRUD/default management | `AddressesExperience`, `AddressForm`, account shell/guard | Address APIs |
| `/orders` | `web/src/app/orders/page.tsx` | Order history | `OrdersExperience`, `BottomNav` | Orders list API |
| `/orders/[publicNumber]` | `web/src/app/orders/[publicNumber]/page.tsx` | Order detail | `OrderDetailExperience`, `CatalogImage` | Order-detail API |
| `/orders/[publicNumber]/success` | `web/src/app/orders/[publicNumber]/success/page.tsx` | Post-checkout confirmation and order detail | `OrderDetailExperience` with `success` | Order-detail API |

Internal handlers:

| Route | File | Responsibility |
| --- | --- | --- |
| `/api/plant-care` | `web/src/app/api/plant-care/route.ts` | Validates a non-empty prompt and returns a hard-coded Persian care reply. |
| `/api/[...path]` | `web/src/app/api/[...path]/route.ts` | Dynamic, no-cache reverse proxy for GET/POST/PUT/PATCH/DELETE/HEAD to the Django origin, forwarding cookies and CSRF headers. |

The global `Footer` is mounted by the root layout on every route; it hides at `md` and above on non-home routes based on `usePathname`.

## 4. Page Dependency Map

```text
Global RootLayout — web/src/app/layout.tsx
├── CartProvider — web/src/features/cart/hooks/CartProvider.tsx
│   └── FavoritesProvider — web/src/features/favorites/hooks/FavoritesProvider.tsx
│       └── AuthProvider — web/src/features/auth/hooks/AuthProvider.tsx
│           └── current page
└── Footer — web/src/features/home/components/Footer.tsx
```

```text
Home / — web/src/app/page.tsx
└── HomeExperience(view="home")
    ├── useCatalog -> getCategories/getProducts
    ├── useHomeSlides -> getHomeSlides
    ├── CartProvider + FavoritesProvider
    ├── HomeDesktop
    │   ├── DesktopHeader / ScrollNavbar
    │   ├── HomeHero
    │   ├── Categories -> CatalogImage
    │   ├── ProductsSlider -> ProductCard -> CatalogImage
    │   ├── FeaturesGrid
    │   ├── static ARTICLES cards
    │   └── BottomNav
    └── ArticleModal
```

```text
Shop /shop — web/src/app/shop/page.tsx
└── query parsing -> HomeExperience(view="shop", initialQuery)
    ├── useCatalog -> catalog API
    ├── URL synchronization through router.replace
    ├── ScrollNavbar
    ├── ShopCatalog
    │   ├── search/order/category controls
    │   ├── plant and cut-flower filter fields
    │   ├── CatalogFeedback
    │   └── ProductCard -> CatalogImage
    └── BottomNav
```

```text
Product /products/[slug] — web/src/app/products/[slug]/page.tsx
├── ShopNavigationScrollNavbar -> ScrollNavbar
└── ProductDetailExperience -> getProductDetail
    ├── ProductDetailLoading / CatalogFeedback
    ├── ProductDetailView
    │   ├── CatalogImage gallery and zoom
    │   ├── PlantSpecifications or CutFlowerSpecifications
    │   └── quantity/share/favorite/cart controls
    └── CartDrawer -> CartProvider -> CatalogImage
```

```text
Favorites /favorites
└── HomeExperience(view="favorites")
    ├── FavoritesProvider
    ├── FavoritesView -> CatalogImage
    └── BottomNav

Care /care
└── HomeExperience(view="care")
    ├── PlantAICare -> fetch('/api/plant-care')
    └── BottomNav
```

```text
Cart /cart
└── CartPageExperience
    ├── AuthProvider + CartProvider
    ├── refreshCartItems -> product-detail API per line
    ├── CartPageLoading
    ├── CatalogImage
    └── BottomNav

Checkout /checkout
└── CheckoutGate
    ├── AuthProvider + CartProvider refresh/redirect checks
    └── CheckoutExperience
        ├── listAddresses + previewCart
        ├── AddressForm -> createAddress
        ├── CatalogImage order summary
        └── submitOrder -> success route
```

```text
Auth /auth
└── PhoneAuthForm
    ├── AuthStateScreen
    ├── AuthShell + AuthHeader + AuthDemoHint
    ├── React Hook Form + Zod phoneFormSchema
    ├── PhoneInput + InlineError + PrimaryButton
    └── AuthProvider.requestOtp -> /auth/verify

Verify /auth/verify
└── OtpVerifyForm
    ├── sessionStorage pending phone
    ├── AuthShell/Header/StateScreen/DemoHint
    ├── OtpInput + ResendTimer + InlineError + PrimaryButton
    └── AuthProvider.verifyOtp/requestOtp

Register /auth/register
└── RegisterExperience
    ├── Account state/redirect guard
    └── RegisterView -> AuthShell + PrimaryButton

Registration success /auth/registration-success
└── WelcomeExperience
    └── WelcomeView -> AuthShell
```

```text
Profile /profile
└── ProfileExperience
    ├── AuthProvider guard/logout + CartProvider count
    ├── AuthStateScreen
    ├── AccountNavigation
    ├── ProfileView
    └── BottomNav

Profile edit /profile/edit
└── AccountEditExperience
    └── AccountRouteGuard
        └── AccountPageShell
            ├── AccountNavigation
            ├── edit form + PrimaryButton -> AuthProvider.updateProfile
            └── BottomNav

Addresses /profile/addresses
└── AddressesExperience
    └── AccountRouteGuard
        └── AccountPageShell
            ├── AccountNavigation
            ├── AddressForm + AddressCard/DeleteAddressDialog
            └── address CRUD API
```

```text
Orders /orders
└── OrdersExperience
    ├── AuthProvider redirect checks
    ├── listOrders
    └── BottomNav

Order detail /orders/[publicNumber]
└── OrderDetailExperience(success=false)
    ├── AuthProvider redirect checks
    ├── getOrder
    └── CatalogImage

Order success /orders/[publicNumber]/success
└── OrderDetailExperience(success=true)
    ├── getOrder
    ├── success panel
    └── the same address/items/totals UI
```

## 5. Major Frontend Component Inventory

Boundary labels mean **Client** for an explicit directive, **client graph** for a module pulled under a client entry point, and **server-compatible** for a pure module that can render on either side. The 53 entries below are the architecturally relevant components/providers; tiny icon wrappers and one-line helpers are intentionally aggregated or omitted.

| # | Category / component | Exact path | Boundary | Responsibility and important props | Used by | Logic / network / state |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Layout `RootLayout` | `web/src/app/layout.tsx` | Server | RTL document, font, metadata, providers, footer; `children` | Every page | Composition only; no network/state |
| 2 | Layout `Footer` | `web/src/features/home/components/Footer.tsx` | Client | Global links/features/newsletter demo | Root layout | Pathname and newsletter timer state; no network |
| 3 | Layout `FeaturesGrid` | `web/src/features/home/components/Footer.tsx` | client graph | Four service-value cards | `HomeDesktop`, `Footer` | Static presentation |
| 4 | Navigation `BottomNav` | `web/src/features/home/components/BottomNav.tsx` | Client | Five mobile tabs with cart/favorite badges | Home variants, cart, profile/account, orders | Pathname, contexts, Framer Motion; no network |
| 5 | Navigation `ScrollNavbar` | `web/src/features/home/components/ScrollNavbar.tsx` | Client | Scroll-faded logo/search; `searchQuery`, `onSearch`, `onLogoClick` | Home/shop/product navigation | Local draft/scroll state and browser events |
| 6 | Navigation `ShopNavigationScrollNavbar` | `web/src/features/home/components/ShopNavigationScrollNavbar.tsx` | Client | Product-page adapter to shop search | Product page | Router/window; no network |
| 7 | Account layout `AccountPageShell` | `web/src/features/profile/components/AccountPageShell.tsx` | Client | Shared account header/sidebar/mobile nav; `title`, `description`, `children` | Profile edit, addresses | Router event; no network |
| 8 | Navigation `AccountNavigation` | `web/src/features/profile/components/AccountNavigation.tsx` | Client | Account section links | Profile/account screens | `usePathname`; no network |
| 9 | Home `HomeExperience` | `web/src/features/home/components/HomeExperience.tsx` | Client | Orchestrates `home/shop/care/favorites`; `view`, `initialSearch`, `initialQuery` | `/`, `/shop`, `/care`, `/favorites` | Business/UI orchestration, URL effects, hooks; indirect network |
| 10 | Home `HomeDesktop` | `web/src/features/home/components/HomeDesktop.tsx` | Client | Full responsive home presentation; 21 callback/data props | `HomeExperience` | Slider/header DOM state; no direct network |
| 11 | Home `HomeHero` | `web/src/features/home/components/HomeHero.tsx` | Client | API slide/fallback hero; `slides`, `status` | `HomeDesktop` | Index, swipe, keyboard, image error state; no network |
| 12 | Content `ArticleModal` | `web/src/features/home/components/ArticleModal.tsx` | client graph | Article overlay; `article`, `onClose` | `HomeExperience` | Event callbacks; no state/network |
| 13 | Care `PlantAICare` | `web/src/features/home/components/PlantAICare.tsx` | client graph | Care chat prototype | `/care` through `HomeExperience` | Local messages/loading; direct `fetch('/api/plant-care')` and fallback generator |
| 14 | Catalog `ShopCatalog` | `web/src/features/home/components/ShopCatalog.tsx` | Client | Search, ordering, category and subtype filters, product grid, pagination | `HomeExperience(view="shop")` | Significant local draft/UI state; callbacks only, no direct network |
| 15 | Catalog `ProductCard` | `web/src/features/home/components/ProductCard.tsx` | Client | Product image, availability, favorite/cart actions; product plus callbacks | Home and shop sliders/grids | Availability/business display, transient added state; no network |
| 16 | Image `CatalogImage` | `web/src/features/catalog/components/CatalogImage.tsx` | Client | `next/image` wrapper with icon fallback; `src`, `alt`, `sizes`, quality/class/priority | Catalog, cart, order, favorites | Failed-source state; no network API call |
| 17 | Shared feedback `CatalogFeedback` | `web/src/features/catalog/components/CatalogFeedback.tsx` | server-compatible | Loading/error/empty panel; `kind`, optional message/retry | Home/shop/product | Retry event when in client graph; no state/network |
| 18 | Product `ProductDetailExperience` | `web/src/features/catalog/components/ProductDetailExperience.tsx` | Client | Fetch/status/cart-drawer container; `slug` | Product page | Calls `getProductDetail`; local loading/error/cart/favorite state and document title effect |
| 19 | Product `ProductDetailView` | `web/src/features/catalog/components/ProductDetailView.tsx` | Client | Gallery, zoom, price/specs, quantity, share, favorite/cart callbacks | `ProductDetailExperience` | Dense UI/business logic; state/effects/browser share API; no direct network |
| 20 | Product `PlantSpecifications` | `web/src/features/catalog/components/ProductSpecifications.tsx` | server-compatible | Plant-specific grouped details; `details` | `ProductDetailView` | Pure presentation |
| 21 | Product `CutFlowerSpecifications` | `web/src/features/catalog/components/ProductSpecifications.tsx` | server-compatible | Cut-flower grouped details; `details` | `ProductDetailView` | Pure presentation |
| 22 | Auth `AuthProvider` | `web/src/features/auth/hooks/AuthProvider.tsx` | Client | Session-backed user state and auth operations | Root layout and all protected/auth screens | Context/state/effects; calls auth API functions |
| 23 | Auth `PhoneAuthForm` | `web/src/features/auth/components/PhoneAuthForm.tsx` | Client | Phone form; `nextPath` | `/auth` | React Hook Form/Zod, status/error, sessionStorage; indirect request-OTP call |
| 24 | Auth `OtpVerifyForm` | `web/src/features/auth/components/OtpVerifyForm.tsx` | Client | OTP verify/resend; `nextPath` | `/auth/verify` | Multiple states/effects, sessionStorage; indirect verify/request calls |
| 25 | Auth `RegisterExperience` | `web/src/features/auth/components/RegisterExperience.tsx` | Client | Guard, registration submission, redirect; `nextPath` | `/auth/register` | Local errors/pending, auth API through context |
| 26 | Auth `RegisterView` | `web/src/features/auth/components/RegisterView.tsx` | Client | Name/email form and callbacks | `RegisterExperience` | Local values/validation; no direct network |
| 27 | Auth `WelcomeExperience` | `web/src/features/auth/components/WelcomeExperience.tsx` | Client | Validates one-time flow and routes onward; `flowToken` | Registration-success page | Auth/sessionStorage/router effects |
| 28 | Auth `WelcomeView` | `web/src/features/auth/components/WelcomeView.tsx` | server-compatible | Welcome presentation; user name and continue/close callbacks | `WelcomeExperience` | Client events only through props |
| 29 | Auth `AuthShell` | `web/src/features/auth/components/AuthShell.tsx` | server-compatible | Common auth viewport; `children`, `className` | Auth forms/screens | Pure layout |
| 30 | Auth `AuthHeader` | `web/src/features/auth/components/AuthHeader.tsx` | client graph | Logo/title/back action; `title`, `onBack` | Phone/OTP forms | Event callback; no state/network |
| 31 | Auth `AuthStateScreen` | `web/src/features/auth/components/AuthStateScreen.tsx` | Client | Initialization/error/retry screen | Auth and profile guards | Retry event; no local state/network |
| 32 | Auth `AuthDemoHint` | `web/src/features/auth/components/AuthDemoHint.tsx` | server-compatible | Demo OTP explanatory block | Phone/OTP forms | Pure presentation |
| 33 | Auth `InlineError` | `web/src/features/auth/components/InlineError.tsx` | server-compatible | Accessible field/general error | Phone/OTP forms | Pure presentation |
| 34 | Form `PhoneInput` | `web/src/features/auth/components/PhoneInput.tsx` | client graph | Normalized Persian phone input props | `PhoneAuthForm` | Controlled event; no local state/network |
| 35 | Form `OtpInput` | `web/src/features/auth/components/OtpInput.tsx` | Client | Five-digit segmented OTP input | `OtpVerifyForm` | Refs, keyboard/paste/focus behavior |
| 36 | Form `ResendTimer` | `web/src/features/auth/components/ResendTimer.tsx` | Client | Countdown and resend callback | `OtpVerifyForm` | Timer/resending state; indirect network through callback |
| 37 | UI `PrimaryButton` | `web/src/components/ui/PrimaryButton.tsx` | server-compatible | Shared loading button | Auth and profile edit forms | Pure rendering of supplied events |
| 38 | Cart `CartProvider` | `web/src/features/cart/hooks/CartProvider.tsx` | Client | Persistent cart API and totals | Root layout and cart consumers | Context/localStorage/cross-tab sync; product-detail refresh network |
| 39 | Cart `CartPageExperience` | `web/src/features/cart/components/CartPageExperience.tsx` | Client | Cart lines, quantity/removal, checkout routing; `initialMessage` | `/cart` | Significant UI/business state/effects; provider methods, no direct fetch |
| 40 | Cart `CartPageLoading` | `web/src/features/cart/components/CartPageLoading.tsx` | server-compatible | Cart skeleton | Route loading and cart screen | Pure presentation |
| 41 | Checkout `CheckoutGate` | `web/src/features/cart/components/CheckoutGate.tsx` | Client | Hydration, cart refresh, auth/profile redirects | `/checkout` | Effect/ref/state; provider calls, no direct API module call |
| 42 | Cart `CartDrawer` | `web/src/features/home/components/CartDrawer.tsx` | Client | Three-item cart preview; `isOpen`, `onClose` | Product detail | Effect refreshes cart through provider |
| 43 | Favorites `FavoritesProvider` | `web/src/features/favorites/hooks/FavoritesProvider.tsx` | Client | Browser-only saved product snapshots | Root layout, home, navigation | Context/localStorage state; no backend/network |
| 44 | Favorites `FavoritesView` | `web/src/features/home/components/FavoritesView.tsx` | client graph | Favorite list and actions | `HomeExperience` | Props/callbacks; no local state/network |
| 45 | Profile `ProfileExperience` | `web/src/features/profile/components/ProfileExperience.tsx` | Client | Profile guard, account composition, logout | `/profile` | Auth/cart context, redirect/logout effects/state |
| 46 | Profile `ProfileView` | `web/src/features/home/components/ProfileView.tsx` | Client | Account hub, links, informational/demo modals | `ProfileExperience` | Large local modal and mock profile/address state; no direct network |
| 47 | Profile `AccountEditExperience` | `web/src/features/profile/components/AccountEditExperience.tsx` | Client | Real name/email edit screen | `/profile/edit` | Local validation/status; auth context update API |
| 48 | Profile `AccountRouteGuard` | `web/src/features/profile/components/AccountRouteGuard.tsx` | Client | Reusable auth/profile-completion redirect; `nextPath`, `children` | Profile edit and addresses | Auth/router effect |
| 49 | Address `AddressesExperience` | `web/src/features/profile/components/AddressesExperience.tsx` | Client | Address list/create/edit/delete/default dialogs | `/profile/addresses` | Many local states/effects; direct address API functions |
| 50 | Form `AddressForm` | `web/src/features/orders/components/AddressForm.tsx` | Client | Shared validated create/edit form and server errors | Addresses and checkout | Local validation through helpers; callback submission |
| 51 | Order `CheckoutExperience` | `web/src/features/orders/components/CheckoutExperience.tsx` | Client | Addresses, authoritative preview, COD order creation | `CheckoutGate` | Many local states/effect; direct order/address API functions |
| 52 | Order `OrdersExperience` | `web/src/features/orders/components/OrdersExperience.tsx` | Client | Order history and status cards | `/orders` | Auth redirect effect; direct list API function |
| 53 | Order `OrderDetailExperience` | `web/src/features/orders/components/OrderDetailExperience.tsx` | Client | Shared detail/success display; `publicNumber`, `success` | Both order-detail routes | Auth redirect effect; direct detail API function |

## 6. Data Fetching Architecture

### Shared request path

`web/src/lib/api/client.ts` uses native `fetch`; Axios is not installed or used. Every normal Django call goes through `apiRequest()` with `credentials: "include"`, `cache: "no-store"`, `redirect: "manual"`, JSON parsing, and normalized errors. Unsafe methods first call `/api/auth/csrf/` when the readable `csrftoken` cookie is absent, then send `X-CSRFToken`.

`web/src/lib/api/config.ts` enforces `/api/` paths and adds a trailing slash before query/hash suffixes. This is significant because Django endpoints are slash-terminated.

The Next server route `web/src/app/api/[...path]/route.ts` forwards selected request headers and the body to `BACKEND_URL` at the same path, returns response headers and `Set-Cookie`, rewrites same-backend redirects to relative locations, and applies `private, no-store`.

There are no React Server Component fetches. Server pages only parse params/search params.

### Feature traces

```text
HomeExperience
  -> useHomeSlides
  -> getHomeSlides
  -> apiRequest('/api/home/slides/')
  -> Next proxy
  -> products.views.HomeSlideListView
```

```text
HomeExperience / ShopCatalog
  -> useCatalog
  -> getCategories + getProducts(ProductQuery)
  -> /api/categories/ + /api/products/?...
  -> Next proxy
  -> CategoryListView + ProductListView
```

```text
ProductDetailExperience / CartProvider refresh
  -> getProductDetail(slug, force?)
  -> /api/products/<slug>/
  -> ProductDetailView
```

`web/src/features/catalog/api/catalog.ts` adds a module-level `Map<string, Promise<unknown>>`. Failures are evicted; successful promises remain cached until the exact path is force-refetched. `useCatalog` manually owns loading/error/retry/load-more state and uses a deferred search string. It requests eight products per page.

```text
AuthProvider
  -> requestOtp / verifyOtp / getCurrentUser /
     completeRegistration / updateProfile / logout
  -> /api/auth/*
  -> accounts APIViews
```

```text
AddressesExperience or CheckoutExperience
  -> orders/api/orders.ts address functions
  -> /api/addresses/ or /api/addresses/<id>/
  -> AddressListCreateView / AddressDetailView
```

```text
CheckoutExperience
  -> previewCart -> POST /api/orders/preview/
  -> submitOrder -> POST /api/orders/
  -> CartPreviewView / OrderListCreateView

OrdersExperience -> listOrders -> GET /api/orders/
OrderDetailExperience -> getOrder -> GET /api/orders/<uuid>/
```

Favorites have no API trace. Magazine/content has no API trace. The care screen bypasses `apiRequest` and calls a local Next handler with raw native `fetch`.

## 7. API Contracts and Runtime Validation

The frontend intentionally keeps backend `snake_case` names. There is no general snake-to-camel mapper.

| Feature | Type definition | Runtime validation | Mapping/fallback before UI |
| --- | --- | --- | --- |
| Auth | `web/src/features/auth/types/index.ts` | `auth/api/runtime.ts`: `isUser`, `isUserResponse`, `isDetailResponse` | No case mapping; `AuthProvider` maps response to authentication state |
| Phone form | Zod inferred `PhoneFormValues` | `auth/schemas/auth.ts` with Iranian mobile regex | `normalizeIranianPhone` and digit normalization before request |
| HomeSlide | `home/slider/types.ts` | `parseHomeSlides`, `isHomeSlide`, safe image and internal CTA checks in `slider/logic.ts` | `getHomeHeroPresentation` and responsive source selection; local fallback hero on empty/error/image failure |
| Catalog | `catalog/types.ts` discriminated unions | `catalog/api/runtime.ts` validates category, shared fields, product discriminator, detail images, pagination | Raw API field names retained; `productToCartSnapshot` creates a smaller cart model |
| Images | strings in catalog/slide DTOs | Slide URL safety; catalog helper rejects empty/traversal-style repository paths | `getProductImageUrl`, `getCategoryImageUrl`, `resolveCatalogImageUrl`; `CatalogImage` fallback |
| Addresses/orders | `orders/types.ts` | `orders/api/runtime.ts` validates Tehran addresses, integer-money strings, preview and order shapes | `normalizeAddressInput`, `addressToInput`, `upsertAddress`, cart-to-checkout mapping |
| Profile edit | auth `ProfileUpdatePayload`; profile-local form types | Regex/manual form validation in `profile/logic.ts` | `mapProfileUpdatePayload` trims and sends only full name/email |
| Cart storage | `cart/types.ts` | `cart/storage.ts` checks stored version/items/snapshot fields | Legacy commercial aliases are normalized; duplicate IDs collapse; invalid items are dropped |
| Favorites storage | `CatalogProduct[]` | **No real runtime validation**; parsed arrays are cast | Raw saved product objects go directly to `FavoritesView` |
| Plant care | local request interface only | Server checks `prompt` is a non-empty string | Client trusts `data.reply` if truthy, otherwise local fixed fallback |

Catalog products and order DTOs are not transformed into separate camelCase UI models; validated raw DTOs reach product/order components. The exceptions are cart snapshots, profile payloads, checkout item payloads, and UI-specific HomeSlide presentation values.

## 8. Backend Architecture

`api/config` is the Django project package; `accounts`, `products`, and `orders` are the three first-party domain apps. DRF defaults to `SessionAuthentication` and `IsAuthenticated`; public catalog/auth views explicitly override those defaults.

```text
api/
├── config/
│   ├── settings.py                 # environment, DB, REST, security, storage
│   ├── urls.py                     # root endpoint composition
│   ├── views.py                    # health endpoint
│   ├── environment.py              # demo OTP config validation
│   ├── exception_filters.py        # secret redaction
│   ├── asgi.py / wsgi.py
│   └── tests/
├── accounts/
│   ├── models.py                   # User, OTPRequest
│   ├── serializers.py
│   ├── views.py / urls.py
│   ├── services/otp.py             # OTP domain workflow
│   ├── services/providers.py       # console-only delivery implementation
│   ├── csrf.py / exceptions.py
│   ├── admin.py / managers.py / utils.py
│   ├── migrations/
│   └── tests/
├── products/
│   ├── models.py                   # catalog, subtype details, images, slides
│   ├── serializers.py
│   ├── views.py / urls.py
│   ├── pagination.py / validators.py
│   ├── seeding.py
│   ├── management/commands/seed_catalog.py
│   ├── admin.py / migrations/
│   └── tests/
└── orders/
    ├── models.py                   # addresses and order snapshots
    ├── serializers.py
    ├── services.py                 # pricing/validation/atomic creation
    ├── views.py / urls.py
    ├── admin.py / migrations/
    └── tests/
```

### Models and services

- `accounts.User` is a custom phone-keyed user model. `full_name` determines `is_profile_complete`; `email` is optional.
- `accounts.OTPRequest` stores a password-hashed code, expiry, attempts, used/demo flags, and an indexed phone/challenge lookup.
- `accounts.services.otp` invalidates previous challenges, creates/verifies OTPs transactionally, enforces attempt/expiry/single-use rules, and blocks privileged demo accounts.
- `products.Product` owns shared commercial fields. One-to-one `PlantDetails` and `CutFlowerDetails` own type-specific attributes. Proxy models `Plant` and `CutFlower` support typed admin workflows.
- `products.ProductImage` stores repository-style image strings; `HomeSlide` uniquely uses uploaded `ImageField`s for mobile and desktop media.
- `orders.UserAddress` is user-owned and constrained to one default address.
- `orders.Order` owns status/payment and immutable address/financial snapshots. `OrderItem` stores immutable product/name/unit/price/image snapshots and retains a nullable product FK.
- `orders.services` is the clearest backend service layer: it validates current products/prices/stock, previews totals, creates an idempotent order atomically, decrements locked stock, and bulk-creates items.

### Views, permissions, filtering, and ordering

- Accounts uses DRF `APIView` classes with explicit schemas. OTP request/verification are `AllowAny` but wrapped in `ensure_csrf_cookie` and `csrf_protect`. Current-user, registration, and logout use session authentication.
- Products uses `ListAPIView`/`RetrieveAPIView`, explicitly public. `ProductFilterSerializer` validates query parameters before `ProductListView.get_queryset()` applies common and subtype filters, multi-field search, and a fixed ordering map.
- Orders uses generic address CRUD views and explicit APIViews for preview/list/create/detail. Every order/address view requires authentication and scopes querysets by `request.user`.
- Pagination is page-number pagination, default 20, client-overridable to a maximum of 100. The frontend asks for 8.

### Database, static, and media

- PostgreSQL is selected by `DATABASE_URL` through `dj_database_url` with 60-second persistent connections, health checks, and required SSL outside debug. SQLite is the local fallback.
- Static files are collected into `api/staticfiles` and served with WhiteNoise.
- Uploaded media defaults to local filesystem or can switch to S3-compatible storage through environment variables.
- Product/category repository images are not uploaded media; their stored string values point into the frontend's `public/images` convention.

## 9. Django App Ownership

| Django app | Main models | Current responsibility |
| --- | --- | --- |
| `accounts` | `User`, `OTPRequest` | Phone identity, profile fields, OTP challenge lifecycle, session login/logout, CSRF/error localization, demo authentication, admin users/challenges |
| `products` | `Category`, `Product`, `PlantDetails`, `CutFlowerDetails`, `Plant` proxy, `CutFlower` proxy, `ProductImage`, `HomeSlide` | The complete public merchandising/catalog domain plus homepage banners, repository image metadata, filters, seed data, and catalog admin |
| `orders` | `UserAddress`, `Order`, `OrderItem` | Delivery addresses, cart validation/preview, COD order creation, inventory decrement, idempotency, order history/detail, snapshot admin |

`config` is not a domain app; it is the project/configuration package and owns health, root URL assembly, deployment/security settings, and exception secret filtering.

`HomeSlide` lives in `products` because the current implementation treats homepage merchandising as catalog-owned content and exposes it from `products.views`/`products.urls`. There is no independent CMS/content app. Magazine articles are not Django-owned at all; they remain static frontend data. `Product`, both subtype detail models, both proxy models, `ProductImage`, `Category`, and `HomeSlide` therefore share one app despite representing product commerce, media metadata, admin segmentation, and homepage content.

Addresses live in `orders`, not `accounts`, because they are modeled as delivery inputs and are reused directly by checkout. The frontend similarly imports the order feature's `AddressForm`, API, and address types from the profile feature.

## 10. Backend Endpoint Map

All paths below are mounted by `api/config/urls.py`. Unless stated otherwise, browser calls first pass through the same-path Next proxy.

| Method | Endpoint | View | Serializer | Main models | Auth required |
| --- | --- | --- | --- | --- | --- |
| GET, HEAD | `/api/health/` | `config.views.health` | Raw `JsonResponse` | None | No |
| GET | `/api/auth/csrf/` | `accounts.views.CSRFView` | Schema-only response | None | No; sets CSRF cookie |
| POST | `/api/auth/request-otp/` | `RequestOTPView` | `PhoneSerializer` | `OTPRequest`, possibly `User` lookup | No session; CSRF required |
| POST | `/api/auth/verify-otp/` | `VerifyOTPView` | `VerifyOTPSerializer`, `UserSerializer` response | `OTPRequest`, `User`, session | No prior session; CSRF required |
| GET | `/api/auth/me/` | `CurrentUserView.get` | `UserSerializer` under `user` | `User` | Yes |
| PATCH | `/api/auth/me/` | `CurrentUserView.patch` | `ProfileUpdateSerializer` | `User` | Yes + CSRF |
| POST | `/api/auth/complete-registration/` | `CompleteRegistrationView` | `CompleteRegistrationSerializer` | `User` | Yes + CSRF |
| POST | `/api/auth/logout/` | `LogoutView` | No body | Session | Yes + CSRF |
| GET | `/api/home/slides/` | `products.views.HomeSlideListView` | `HomeSlideSerializer` | `HomeSlide` | No |
| GET | `/api/categories/` | `CategoryListView` | `CategorySerializer` | `Category` | No |
| GET | `/api/products/` | `ProductListView` | `ProductFilterSerializer` input, `ProductListSerializer` output | `Product`, `Category`, subtype details | No |
| GET | `/api/products/<slug>/` | `ProductDetailView` | `ProductDetailSerializer` | Product/category/details/images | No |
| GET, POST | `/api/addresses/` | `AddressListCreateView` | `UserAddressSerializer` | `UserAddress`, `User` locking | Yes; POST needs CSRF |
| GET, PUT, PATCH, DELETE | `/api/addresses/<id>/` | `AddressDetailView` | `UserAddressSerializer` | `UserAddress` | Yes; unsafe methods need CSRF |
| POST | `/api/orders/preview/` | `CartPreviewView` | `CartPreviewRequestSerializer`, `CartPreviewResponseSerializer` | Current `Product`/`Category` | Yes + CSRF |
| GET | `/api/orders/` | `OrderListCreateView.get` | `OrderSerializer(many=True)` | `Order`, `OrderItem` | Yes |
| POST | `/api/orders/` | `OrderListCreateView.post` | `OrderCreateRequestSerializer`, `OrderSerializer` | `UserAddress`, `Product`, `Order`, `OrderItem` | Yes + CSRF |
| GET | `/api/orders/<uuid>/` | `OrderDetailView` | `OrderSerializer` | `Order`, `OrderItem` | Yes, owner-scoped |

Conditional development/docs endpoints are `/api/schema/` and `/api/schema/swagger-ui/` when `ENABLE_API_DOCS=True`; `/admin/` is the Django admin. There is no backend favorites or magazine endpoint.

## 11. End-to-End Feature Flows

### Home banner / HomeSlide

```text
Django admin: products.admin.HomeSlideAdmin
  -> products.models.HomeSlide
     (uploaded mobile_image + desktop_image, safe internal CTA validation)
  -> products.serializers.HomeSlideSerializer
     (absolute mobile_image_url / desktop_image_url)
  -> GET /api/home/slides/ via HomeSlideListView
  -> Next /api/[...path] proxy
  -> home/slider/api.getHomeSlides
  -> home/slider/logic.parseHomeSlides
     (shape, safe URL, paired CTA validation)
  -> useHomeSlides {slides,status}
  -> HomeExperience -> HomeDesktop -> HomeHero
  -> getImageProps mobile/desktop -> <picture>
  -> fallback /images/hero_1.png on loading/empty/error/image error
```

Slides are manual (buttons, keyboard, pointer swipe). There is no autoplay. Backend tests and frontend slider tests cover the public contract, safety, responsive mapping, and navigation behavior.

### Product catalog

```text
/shop searchParams
  -> server-side narrowing in app/shop/page.tsx
  -> HomeExperience catalogQuery state
  -> ShopCatalog draft controls
  -> HomeExperience updates ProductQuery + URL
  -> useCatalog (deferred search, page_size=8)
  -> catalog.api.getProducts
  -> GET /api/products/?filters
  -> ProductFilterSerializer validates query
  -> ProductListView applies filters/search/ordering
  -> ProductListSerializer emits discriminated details
  -> frontend runtime.isPaginatedProducts/isProduct
  -> raw CatalogProduct DTO
  -> ProductCard
```

The backend is authoritative for filter validation and availability. Filter enum values are duplicated in TypeScript and Python rather than generated from OpenAPI.

### Authentication

```text
PhoneAuthForm
  -> normalize digits/phone + Zod regex
  -> AuthProvider.requestOtp
  -> apiRequest ensures CSRF cookie
  -> POST /api/auth/request-otp/
  -> PhoneSerializer
  -> services.otp.create_otp
     -> invalidate old challenge
     -> generate/configured demo code
     -> password hash + expiry + attempt state
     -> providers.send_otp (console implementation for debug only)
  -> pending phone in sessionStorage
  -> /auth/verify
  -> OtpVerifyForm + ResendTimer/OtpInput
  -> POST /api/auth/verify-otp/
  -> services.otp.verify_otp with transaction/row lock
  -> get/create non-privileged User + django.contrib.auth.login
  -> HttpOnly session cookie
  -> AuthProvider refreshes GET /api/auth/me/
  -> complete profile at /auth/register when full_name is blank
  -> POST /api/auth/complete-registration/
  -> one-time welcome flow token in sessionStorage
```

The readable CSRF cookie is intentionally not HttpOnly; the session cookie is HttpOnly. All unsafe browser requests use the shared client to add `X-CSRFToken` and include cookies.

### Favorites

```text
ProductCard
  -> HomeExperience.onToggleFavorite
  -> FavoritesProvider.toggleFavorite
  -> in-memory CatalogProduct[] + localStorage florisa_favorites_v1
  -> FavoritesView and BottomNav badge
```

This is entirely frontend-local. Stored product objects are not refreshed from the catalog and are not runtime-validated. Product detail currently uses a separate local `isFavorite` boolean and does not call `FavoritesProvider`, so its heart state does not feed `/favorites`.

### Address management

```text
/profile/addresses
  -> AccountRouteGuard
  -> AddressesExperience.load
  -> GET /api/addresses/
  -> owner-scoped AddressListCreateView
  -> UserAddressSerializer
     (phone/postal normalization, Tehran-only validation,
      transactionally maintains one default during save)
  -> runtime.isAddress
  -> AddressCard UI

AddressForm
  -> frontend normalize/validateAddressInput
  -> POST or PATCH address API
  -> upsertAddress local reconciliation

Delete dialog
  -> DELETE /api/addresses/<id>/
  -> backend selects replacement default when needed
  -> removeAddressAfterSuccess local reconciliation
```

Checkout reuses `AddressForm` and create-only address API behavior.

### Order creation

```text
CartProvider local cart snapshots
  -> CheckoutGate force-refreshes each product detail
  -> mapCartToCheckoutItems sends only product_id + quantity
  -> CheckoutExperience POST /api/orders/preview/
  -> CartPreviewRequestSerializer
  -> orders.services.validate_products(current DB state)
  -> server-calculated unit price/stock/subtotal/fee/total
  -> validated CartPreview -> checkout summary
  -> selected owned address + note + sessionStorage idempotency UUID
  -> POST /api/orders/
  -> OrderCreateRequestSerializer
  -> services.create_order @transaction.atomic
     -> user/address/product row locks
     -> idempotency lookup
     -> repeat current product validation
     -> Order immutable address/financial snapshot
     -> bulk OrderItem product snapshots
     -> decrement stock
  -> OrderSerializer -> frontend runtime.isOrder
  -> clear cart only after success
  -> /orders/<public_number>/success
```

Delivery fee is currently always zero and payment method is fixed to cash on delivery.

## 12. Image Architecture

### Product and category images

`Category.image`, `Product.cover_image`, and `ProductImage.image` are strings, not Django uploaded files. Seeded values are filenames such as `snake-plant.webp`. Category paths are validated with `validate_repository_image_path`; product cover/gallery model fields currently do not attach that validator.

```text
Django filename string
  -> serializer preserves raw string
  -> frontend runtime guard preserves raw string
  -> getProductImageUrl or getCategoryImageUrl
  -> traversal/empty check + per-segment URL encoding
  -> /images/products/<filename> or /images/categories/<filename>
  -> resolveCatalogImageUrl
  -> CatalogImage -> next/image
  -> Flower2 placeholder after missing/failed source
```

Product detail combines the cover image with deduplicated `ProductImage` records. Cart and order snapshots retain the cover filename so historical lines continue pointing at the frontend asset convention.

### HomeSlide images

HomeSlide images are true Django `ImageField`s uploaded under dated `home/slides/mobile/...` and `home/slides/desktop/...` media paths. The serializer uses `request.build_absolute_uri(image.url)`. The frontend validates these as safe HTTP(S) or internal URLs. `HomeHero` calls `getImageProps` twice and uses a `<picture>` source at `(min-width: 1024px)`; mobile dimensions are 900x1200 and desktop dimensions are 1275x400. The static `/images/hero_1.png` is used for all failure/empty/loading states.

`next.config.ts` permits `/media/**` on the backend origin, all paths on optional `MEDIA_HOST`, and Unsplash. It also rewrites same-origin `/media/*` to Django. Absolute serializer URLs normally cause the optimizer/browser to target the configured remote backend/media host rather than that rewrite.

### Other images

- Brand: `/images/brand/florisa-logo.svg`, used by headers/auth.
- Static article imagery: imported/local WebP plus one Unsplash URL in `ARTICLES`.
- `ProfileView` uses a fixed Unsplash avatar unrelated to the authenticated user.
- `products.ts` contains unused legacy category/product Unsplash data and one stale `.jpg` reference for an existing `.webp` asset.
- `ScrollNavbar` uses a raw `<img>` for the logo; ESLint explicitly disables `no-img-element` for the entire home feature. Most other imagery uses `next/image`.

## 13. Styling and Design System

Tailwind CSS 4 is imported in `web/src/app/globals.css`; there is no JavaScript Tailwind config. `web/src/design/design-tokens.css` defines:

- primitive neutral, brand, success/error, and surface colors;
- font family, weights, 10 font sizes, and matching line heights;
- semantic background/text/border/action/feedback aliases;
- display, heading, body, caption, label, button, desktop/mobile, and card typography tokens;
- small/medium/large/brand/navbar shadows;
- `@theme inline` mappings that expose semantic values as Tailwind utilities.

`globals.css` adds a spacing scale, page/card/section aliases, global dark foundation, account input styling, numeric LTR behavior, scrollbar styling, glass/glow helpers, a spinner, and responsive page/footer spacing.

Current token flow:

```text
design-tokens.css primitives
  -> semantic CSS custom properties
  -> Tailwind 4 @theme aliases
  -> utilities such as bg-background-secondary / text-text-brand
  -> component className strings
```

This is a real token foundation, but adoption is partial. Static inspection found hundreds of literal hex-color occurrences and extensive arbitrary Tailwind values across feature components. Spacing and radii are mostly feature-local; there is only one shared UI primitive. Responsive rules are a mix of Tailwind breakpoints, `HomeHero`'s explicit 1024px media source, `next/image` `sizes`, and global CSS media queries.

## 14. Server vs Client Components

There are 39 explicit `"use client"` modules.

| Reason | Important explicit client modules |
| --- | --- |
| Global/browser state | `AuthProvider.tsx`, `CartProvider.tsx`, `FavoritesProvider.tsx` |
| Fetch/effects | `HomeExperience.tsx`, `useCatalog.ts`, `useHomeSlides.ts`, `ProductDetailExperience.tsx`, `AddressesExperience.tsx`, `CheckoutExperience.tsx`, `OrdersExperience.tsx`, `OrderDetailExperience.tsx` |
| Forms/local state | `PhoneAuthForm.tsx`, `OtpVerifyForm.tsx`, `OtpInput.tsx`, `ResendTimer.tsx`, `RegisterView.tsx`, `AccountEditExperience.tsx`, `AddressForm.tsx`, `ShopCatalog.tsx` |
| Navigation/browser APIs | `BottomNav.tsx`, `ScrollNavbar.tsx`, `ShopNavigationScrollNavbar.tsx`, `AccountNavigation.tsx`, `AccountPageShell.tsx`, `AccountRouteGuard.tsx`, `CheckoutGate.tsx`, `ProfileExperience.tsx` |
| Interactive product/cart UI | `ProductCard.tsx`, `ProductDetailView.tsx`, `CatalogImage.tsx`, `CartPageExperience.tsx`, `CartDrawer.tsx` |
| Animation/complex UI | `HomeDesktop.tsx`, `HomeHero.tsx`, `ProfileView.tsx`, `Footer.tsx`, `AuthStateScreen.tsx`, `RegisterExperience.tsx`, `WelcomeExperience.tsx` |

Some modules without a directive become client code because their importer is a client entry point: `PlantAICare` uses hooks, while `ArticleModal`, `FavoritesView`, `AuthHeader`, `PhoneInput`, and `WelcomeView` receive event callbacks.

No explicit client component is obviously invalid in its present form: each uses state/effects, event handlers, a client-only hook, or browser API. The broader architectural concern is that all business data is fetched from client effects, so otherwise static page shells and large presentation trees inherit client execution. Candidate extraction must be evaluated page-by-page rather than deleting directives mechanically.

## 15. State Management

There is no Redux, Redux Toolkit, TanStack Query, Axios, Swiper, or Recharts in the current package or imports, despite older README text naming them.

| State mechanism | Current owners/features |
| --- | --- |
| React Context | Auth session (`AuthProvider`), cart (`CartProvider`), favorites (`FavoritesProvider`) |
| React local state | All forms, filters, product gallery/quantity, menus/modals, loading/errors, checkout/address/order screens, slider and transient confirmations |
| Manual server state | `useCatalog`, `useHomeSlides`, product detail, addresses, checkout preview, orders and current user use `useEffect` + `useState` + API functions |
| Module cache | `catalog/api/catalog.ts` caches request promises by full path; successful entries have no TTL |
| URL state | `/shop` search/filter/order query parameters; initially parsed by the Server Component and then synchronized from `HomeExperience` with `router.replace` |
| Session/auth state | Django HttpOnly `sessionid`; readable `csrftoken`; frontend user state refreshed through `/api/auth/me/` |
| `localStorage` | Versioned cart `florisa_cart_v1`; favorites `florisa_favorites_v1`; cart listens for cross-tab storage changes, favorites does not |
| `sessionStorage` | Pending phone, registration-success flow token, and checkout fingerprint/idempotency key |
| Server/database state | Users, OTP challenges, categories/products/slides, addresses, stock and orders in Django/PostgreSQL |

The cart uses browser snapshots for display, then refreshes product details before checkout. Django recalculates and revalidates everything again at preview and creation time. Favorites remain stale snapshots until toggled and have no server identity.

## 16. Error, Loading, and Empty States

### Shared handling

- `ApiError` carries status, flat field errors, and raw response data. `getApiErrorMessage` selects preferred field errors or a standard Persian network message.
- Non-JSON and malformed JSON are detected centrally. Feature runtime guards reject well-formed JSON with invalid shapes as a synthetic 502 error.
- `AuthStateScreen` provides initialization/error/retry UI for auth and account guards.
- `CatalogFeedback` provides reusable loading/error/empty UI for catalog contexts.
- `CatalogImage` replaces missing or failed images with a `Flower2` placeholder.

### Feature behavior

- HomeSlide loading, empty, malformed response, request error, and image error all resolve to the static hero.
- Catalog keeps categories and product errors separately and exposes retries. Product detail distinguishes 404 from other errors.
- Cart has a route skeleton, hydration state, refresh error, invalid/unavailable line messaging, and empty state.
- Checkout has a gate spinner/error, preview/create errors, mapped per-product `item_errors`, address field errors, and disabled submit conditions.
- Favorites and orders have explicit empty states. Favorites briefly appear empty before localStorage hydration because the provider exposes no hydration flag.
- Order list/detail screens have local loading/error UI but no visible retry action.
- Unauthorized/profile-incomplete states redirect from client effects; a loading screen remains while redirecting.
- Plant care catches all errors and presents a delayed locally generated response, making backend failure visually indistinguishable from a successful care answer.

There are no App Router `error.tsx`, `global-error.tsx`, or `not-found.tsx` boundaries. Unexpected render errors use Next.js defaults. Only cart and product detail have route `loading.tsx` files; because their fetches occur after hydration, most loading UI is feature-local rather than route-streamed.

## 17. Tests

Static inspection found **127 backend test methods** and **25 frontend Node test cases**. Tests were inventoried but not run during this documentation-only task.

### Backend unit/integration tests

| Area | Files | Protected behavior |
| --- | --- | --- |
| Authentication/API | `api/accounts/tests/test_auth_api.py` | Phone/OTP normalization, hashing, invalidation, expiry, attempts, login/session, current user, logout, CSRF, CORS |
| Demo OTP/security | `test_demo_otp.py`, `test_otp_delivery.py`, `api/config/tests/test_environment.py`, `test_exception_filters.py` | Demo isolation, no code exposure, privileged-account blocks, provider restrictions, env validation, secret redaction |
| Profile | `api/accounts/tests/test_profile_api.py`, `test_utils.py` | Completion/update validation, allowed fields, CSRF/session preservation, normalization |
| Catalog models/admin/seeds | `api/products/tests/test_models.py`, `test_admin.py`, `test_seed.py`, `test_seed_command.py` | Product/detail invariants, constraints, proxy-admin separation, deletion behavior, idempotent seed data |
| Catalog API | `api/products/tests/test_api.py` | Discriminated subtype DTOs, filters/search/order, invalid query handling, visibility, query counts, schema |
| HomeSlide | `api/products/tests/test_home_slides.py` | Active ordering, absolute image URLs, read-only endpoint, CTA/image validation, schema/admin rendering |
| Orders/addresses | `api/orders/tests/test_api.py` | Authentication/CSRF, ownership, Tehran/default invariants, authoritative preview, validation, snapshots, rollback, stock and idempotency |
| Health | `api/config/tests/test_health.py` | Exact response, anonymous/HEAD support, zero DB queries |

### Frontend tests

| Area | File | Protected behavior |
| --- | --- | --- |
| Slider/HomeSlide | `web/src/features/home/slider/slider.test.mjs` | Parser, CTA safety, navigation, responsive source mapping, fallback precedence, one/multiple slide behavior, no autoplay |
| Responsive home structure | `web/src/features/home/home-responsive.test.mjs` | Single CSS-first presentation tree |
| Catalog images | `web/src/features/catalog/catalog-images.test.mjs` | Raw filename contract, public path mapping, missing-image fallback path |
| Cart | `web/src/features/cart/cart.test.mjs` | Merge/quantity rules, totals, storage hydration/deduplication |
| Orders | `web/src/features/orders/orders.test.mjs` | Minimal checkout payload, clear-after-success, runtime parsers, address reconciliation |
| Profile/auth utility | `web/src/features/profile/account.test.mjs` | Current-user runtime parsing, safe profile mapping, redirect sanitization |

### Major gaps

There are no component-rendering tests, browser/E2E tests, accessibility tests, visual regression tests, frontend proxy tests, favorites-storage tests, full auth UI-flow tests, filter UI/URL synchronization tests, product-detail favorite integration tests, care route tests, or frontend checkout component tests. Backend coverage is substantially stronger than frontend integration coverage.

## 18. Architecture Risks / Technical Debt

This section is analysis, not an instruction to change the code.

| Severity | Exact file(s) | Current risk and why it matters |
| --- | --- | --- |
| **High** | `web/src/features/home/components/ShopCatalog.tsx` | At 1,011 lines, one component owns search, ordering, category filtering, mobile filter modal, subtype-specific filter forms, empty/loading/error states, product grid, and pagination. Changes have a broad regression surface. |
| **High** | `web/src/features/home/components/ProfileView.tsx`, `web/src/features/profile/components/AccountEditExperience.tsx`, `AddressesExperience.tsx` | `ProfileView` is 639 lines and contains an in-memory edit modal, fixed mock address, fixed Unsplash avatar, and informational modals alongside links to the real profile/address screens. Two representations of the same account responsibilities can diverge and mislead users. |
| **High** | `web/src/features/catalog/components/ProductDetailExperience.tsx`, `web/src/features/favorites/hooks/FavoritesProvider.tsx` | Product detail maintains a local favorite boolean instead of reading/toggling the global provider. A heart selected on detail does not persist or appear in `/favorites`. |
| **High** | `api/accounts/services/providers.py`, `api/config/settings.py`, `api/README.md` | Only the console delivery backend is implemented, while non-debug defaults to `sms`, which raises `ImproperlyConfigured`. Real SMS authentication is not production-capable; request throttling is also explicitly absent. Demo OTP is the only deployable workaround. |
| **High** | `api/config/settings.py`, `api/config/urls.py`, `api/products/models.py`, `web/next.config.ts` | HomeSlide uses uploaded media, but default production storage is filesystem and Django only serves media in debug. On an ephemeral Render filesystem or without S3/media serving, slide images can disappear or be unreachable. |
| **Medium** | `web/src/features/favorites/hooks/FavoritesProvider.tsx` | Any parsed array is cast to `CatalogProduct[]` without item validation/version envelope. Malformed or old snapshots can flow into rendering, and stored price/availability never refresh. |
| **Medium** | `web/src/features/catalog/api/catalog.ts` | Successful request promises remain in the module cache indefinitely. Catalog, stock, and prices can stay stale for the lifetime of the browser bundle unless a code path explicitly uses `force=true`. |
| **Medium** | `web/src/features/catalog/components/ProductDetailView.tsx`, `HomeDesktop.tsx`, `ProfileView.tsx`, `CartPageExperience.tsx`, `Footer.tsx`, `CartProvider.tsx` | Several 300–640 line modules combine presentation, browser effects, transient state, and domain decisions, making isolated review and tests difficult. |
| **Medium** | `web/src/features/orders/components/CheckoutExperience.tsx`, `AddressesExperience.tsx`, `OrdersExperience.tsx`, `OrderDetailExperience.tsx`, `ProductDetailExperience.tsx` | Screens call API modules and manage request lifecycles directly with repeated `useEffect/useState` patterns. Cancellation is boolean-only and retry/loading conventions differ across features. |
| **Medium** | `web/src/features/home/components/PlantAICare.tsx`, `web/src/app/api/plant-care/route.ts` | UI says “Gemini Powered,” but the server returns a fixed response and the client silently fabricates fallback advice after failures. This is an implementation/product-contract mismatch and masks outages. |
| **Medium** | `web/src/design/design-tokens.css`, `web/src/app/globals.css`, most feature `.tsx` files | A substantial semantic token system coexists with hundreds of literal hex colors and many arbitrary sizes/shadows/radii. Visual changes require editing many feature-local values. |
| **Medium** | `web/src/app/shop/page.tsx`, `web/src/features/home/components/ShopCatalog.tsx`, `web/src/features/catalog/types.ts`, `api/products/views.py` | Filter enums/ranges and query parsing are duplicated across server page, client form, TypeScript types, and DRF serializer. Contract drift can produce rejected URLs or hidden filters. |
| **Medium** | `web/src/lib/api/client.ts`, `web/src/features/orders/components/CheckoutExperience.tsx` | Shared field-error extraction supports only flat strings/arrays. Checkout separately inspects `rawData.item_errors`; other nested error shapes would degrade to a generic message. |
| **Medium** | `api/orders/views.py` | Default replacement after address deletion is not wrapped in the same explicit user/address row-lock transaction used by serializer saves. Concurrent address operations have weaker invariant protection than create/update. |
| **Low** | `web/src/features/home/data/products.ts`, `web/src/features/home/types.ts` | Large legacy `CATEGORIES` and `PRODUCTS` fixtures are unused. One points to a non-existent `.jpg`; only `ARTICLES` is live. Dead concepts obscure actual API ownership. |
| **Low** | `README.md` | The architecture/stack section mentions Axios, Redux, TanStack Query, Swiper, Recharts, `api/catalog`, `src/styles`, and `src/utils`, none of which match the current tree/package. Onboarding documentation can send reviewers to nonexistent layers. |
| **Low** | `web/src/features/home/components/HomeDesktop.tsx` | Desktop header renders separate account and search actions with both account and search links targeting `/profile`; the search icon does not initiate search. This may be intentional placeholder UI, but current responsibility is unclear. |
| **Low** | `web/src/features/orders/components/OrdersExperience.tsx`, `OrderDetailExperience.tsx` | Errors have no retry action and order detail/success share dense one-line JSX, reducing maintainability and consistent recovery behavior. |
| **Low** | `web/src/features/home/components/Footer.tsx` | Newsletter “subscription” is only a timed local confirmation and explicitly stores nothing; the component also carries global navigation, feature grid, path visibility, and form behavior. |
| **Low** | `web/src/features/home/components/ScrollNavbar.tsx`, `web/eslint.config.mjs` | One raw `<img>` is used while the whole home feature disables Next's image lint rule, widening the exception beyond the single deliberate logo use. |

## 19. Component Complexity Candidates

Priority reflects manual review urgency, not an instruction to refactor immediately.

| Priority | Component | Path | Why it needs review |
| --- | --- | --- | --- |
| P0 | `ShopCatalog` | `web/src/features/home/components/ShopCatalog.tsx` | 1,011 lines; filter domain, modal/form UI, query callbacks and product rendering in one file |
| P0 | `ProfileView` | `web/src/features/home/components/ProfileView.tsx` | 639 lines; mock/in-memory account data and many modal responsibilities overlap real account pages |
| P0 | `ProductDetailExperience` | `web/src/features/catalog/components/ProductDetailExperience.tsx` | Separate non-persistent favorite state breaks the global favorites architecture |
| P1 | `ProductDetailView` | `web/src/features/catalog/components/ProductDetailView.tsx` | 639 lines; gallery/zoom/share/quantity/pricing/specs/fixed action bar mixed together |
| P1 | `HomeDesktop` | `web/src/features/home/components/HomeDesktop.tsx` | 636 lines; header, category UI, product slider, magazine and responsive composition |
| P1 | `CartPageExperience` | `web/src/features/cart/components/CartPageExperience.tsx` | 458 lines; refresh, routing, destructive confirmations, quantities and dense layout |
| P1 | `CartProvider` | `web/src/features/cart/hooks/CartProvider.tsx` | 325 lines; persistence, cross-tab sync, business rules, refresh caching and server reconciliation |
| P1 | `Footer` | `web/src/features/home/components/Footer.tsx` | 327 lines; global layout, feature cards, navigation and fake newsletter state |
| P1 | `HomeHero` | `web/src/features/home/components/HomeHero.tsx` | 279 lines; responsive image generation, fallback, gesture/keyboard slider and presentation |
| P1 | `BottomNav` | `web/src/features/home/components/BottomNav.tsx` | 262 lines; navigation, two contexts, badge logic and three animation configurations |
| P1 | `OtpVerifyForm` | `web/src/features/auth/components/OtpVerifyForm.tsx` | 254 lines; redirect guards, session storage, OTP state, verification and resend |
| P1 | `RegisterView` | `web/src/features/auth/components/RegisterView.tsx` | 250 lines; duplicated profile validation and substantial feature-local styling |
| P1 | `AuthProvider` | `web/src/features/auth/hooks/AuthProvider.tsx` | 220 lines; initialization, request dedupe, all auth mutations and state transitions |
| P1 | `HomeExperience` | `web/src/features/home/components/HomeExperience.tsx` | 217 lines; four routes, catalog/slide/cart/favorite orchestration and URL synchronization |
| P1 | `CheckoutExperience` | `web/src/features/orders/components/CheckoutExperience.tsx` | 190 lines but many state variables, parallel fetch, address creation, nested error mapping and submission |
| P1 | `PlantAICare` | `web/src/features/home/components/PlantAICare.tsx` | Direct fetch and synthetic failure answers mixed into a branded chat UI |
| P1 | `AddressesExperience` | `web/src/features/profile/components/AddressesExperience.tsx` | Many independent states plus CRUD/default/delete reconciliation in one screen |
| P2 | `ProductCard` | `web/src/features/home/components/ProductCard.tsx` | Availability/package rules, image, favorites, cart animation and presentation are tightly coupled |
| P2 | `PhoneAuthForm` | `web/src/features/auth/components/PhoneAuthForm.tsx` | Form library/Zod/context/redirect/demo presentation combined; worth reviewing after auth flow |
| P2 | `CartDrawer` | `web/src/features/home/components/CartDrawer.tsx` | Effect depends on the complete cart context object and mixes refresh with overlay presentation |
| P2 | `OrdersExperience` / `OrderDetailExperience` | `web/src/features/orders/components/` | Repeated auth redirect/request/error patterns and dense JSX; small enough to clean after checkout |

## 20. Recommended Page-by-Page Review Order

1. **Home (`/`)** — establishes the global visual language and shared `HomeExperience`, catalog hook, product card, hero, footer and navigation dependencies.
2. **Shop (`/shop`)** — reuses home/catalog primitives and contains the largest component plus the complete filter/URL contract.
3. **Product detail (`/products/[slug]`)** — depends on the catalog contract and exposes the favorites inconsistency and cart boundary.
4. **Favorites (`/favorites`)** — small page after product-card/detail behavior is understood; review persistence, hydration and snapshot freshness together.
5. **Auth suite (`/auth`, `/auth/verify`, `/auth/register`, `/auth/registration-success`)** — review as one state machine before protected account/checkout pages.
6. **Profile (`/profile`)** — separate real account navigation from mock/informational modal responsibilities only after auth behavior is mapped.
7. **Profile edit (`/profile/edit`)** — validates the real profile mutation and shared account guard/shell.
8. **Addresses (`/profile/addresses`)** — establishes address CRUD/default behavior before checkout reuses it.
9. **Cart (`/cart`)** — review persistence, product refresh, quantity rules and auth handoff after catalog components are stable.
10. **Checkout (`/checkout`)** — depends on auth, cart and addresses; preserve server-authoritative preview/idempotency semantics.
11. **Orders list (`/orders`)** — follows the completed checkout contract and introduces history state/recovery.
12. **Order detail and success (`/orders/[publicNumber]`, `/success`)** — shared view after list/order DTOs are understood.
13. **Care (`/care`)** — isolated prototype with a separate product-contract decision; safest to evaluate last without blocking commerce cleanup.

This order is frontend dependency-aware. Backend services and tests should be used as behavioral references during each page review rather than broadly refactored first.

## 21. Final Architecture Summary

### What is already good

- The same-origin Next proxy plus shared `apiRequest` creates a coherent cookie/session/CSRF boundary and avoids exposing a public backend URL to browser code.
- Django checkout is server-authoritative, transactional, stock-locking, idempotent, and snapshot-based; frontend cart prices are never trusted for order creation.
- Product subtype modeling preserves shared commercial fields while keeping plant and cut-flower details explicit and serializer-discriminated.
- Runtime response guards exist for auth, catalog, HomeSlide, addresses, previews and orders instead of relying on TypeScript casts alone.
- HomeSlide has defense in depth: backend internal-CTA validation, frontend URL/shape validation, responsive source mapping, fallbacks, and tests.
- Backend ownership and access controls are clear: public catalog, session-protected user data, and user-scoped addresses/orders.
- Backend test coverage protects the most sensitive flows, especially OTP/CSRF, order atomicity/idempotency, ownership, product constraints and slide contracts.
- The CSS token file is a useful semantic foundation even though component adoption is incomplete.

### What is inconsistent

- API/server state is centralized at the request-function level but manually orchestrated differently in each screen.
- Favorites are global on list pages but local and non-persistent on product detail.
- Catalog/product/category images are repository filenames while HomeSlide is uploaded backend media, with different validation and deployment requirements.
- Real profile edit/address pages coexist with mock profile data/modals in `ProfileView`.
- Semantic design utilities coexist with extensive literal colors, arbitrary dimensions and feature-local styles.
- README architecture and dependency claims lag behind the executable repository.
- Most screens are thin Server Component wrappers around client-side data fetching, while only two routes define loading files and none define error boundaries.

### What should not be touched yet

- The atomic order creation, idempotency, stock locking, authoritative totals and immutable snapshot design in `api/orders/services.py` and order models.
- OTP hashing, expiry, attempt limits, one-time use, demo-account restrictions, session login and CSRF enforcement. Extend provider/throttling separately without casually rewriting these invariants.
- The common `apiRequest`/Next proxy cookie and CSRF mechanics without dedicated integration tests.
- Product/detail relational constraints, typed admin proxy workflow, and the public serializer discriminator contract.
- The current HomeSlide model/parser/responsive-image contract while its active frontend changes and focused tests are being stabilized.
- Existing semantic token names until page-level audits show which tokens are actually shared; premature renaming would produce repository-wide churn.

### Highest-value cleanup areas (do not implement yet)

1. Reconcile product-detail favorites with `FavoritesProvider`, then add versioned runtime-safe favorite storage.
2. Decompose `ShopCatalog`, `ProfileView`, `ProductDetailView`, and `HomeDesktop` along existing responsibilities, preserving public props and tests first.
3. Standardize frontend server-state/loading/error/retry behavior and define cache invalidation without weakening the shared API/CSRF client.
4. Decide and document one production media strategy for HomeSlide, then align image-field validation and URL ownership across product/category/gallery assets.
5. Complete the production authentication boundary with an actual SMS provider and shared request throttling while keeping current OTP/session security behavior intact.

---

### Audit counts and constraints

- User-facing frontend page routes: **17**
- Internal Next route handlers: **2**
- Major frontend component/provider entries documented: **53**
- Explicit `"use client"` modules: **39**
- First-party Django domain apps: **3** (`accounts`, `products`, `orders`), plus the `config` project package
- Backend test methods discovered: **127**
- Frontend test cases discovered: **25**
- Application code modified by this audit: **none**
- Packages installed, commits created, or pushes made: **none**
