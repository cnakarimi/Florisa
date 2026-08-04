# Florisa 🌿

A production-oriented, mobile-first e-commerce platform for indoor plants and cut flowers in Tehran.

Florisa is a full-stack portfolio project focused on real-world architecture, secure phone authentication, maintainable product modeling, server-authoritative checkout, responsive UI, and a token-based design system.

> **MVP status:** authentication, catalog, favorites, cart, address management, checkout, cash-on-delivery orders, order history, and production deployment are implemented.

---

## فارسی

**فلوریسا** یک فروشگاه آنلاین موبایل‌محور برای فروش گیاهان آپارتمانی و گل شاخه‌ای در تهران است.

این پروژه با تمرکز روی معماری واقعی، احراز هویت امن با شماره موبایل و OTP، مدل‌سازی چندنوع محصول، سبد خرید، تسویه‌حساب، ثبت سفارش، مدیریت آدرس، طراحی واکنش‌گرا و دیزاین‌توکن توسعه داده شده است.

در نسخه MVP، پرداخت در محل فعال است و پرداخت آنلاین در فاز بعدی اضافه می‌شود.

---

## Live Demo

- **Website:** `https://florisa.ir`
- **Frontend preview:** `https://florisa-psi.vercel.app`
- **API health:** `/api/health/`
- **Django Admin:** `/admin/`
- **Swagger UI:** `/api/schema/swagger-ui/`

> Free-tier services may need a few seconds to wake up after inactivity.

---

## Demo Authentication

Florisa includes a secure demo-only OTP path for portfolio review.

```text
Demo OTP: 12345
```

The demo path still uses the normal OTP persistence, hashing, expiration, attempt limits, and verification flow. Demo mode is controlled by environment variables and should remain disabled outside portfolio/demo environments.

---

## Key Features

### Customer Experience

- Mobile-first responsive storefront
- Search, filtering, ordering, and availability filters
- Indoor plants and cut flowers
- Product-type-specific detail sections
- Favorites with local persistence
- Typed cart with quantity management
- Persistent cart using `localStorage`
- Cart drawer and dedicated cart page
- Phone-number authentication and OTP verification
- Profile-completion flow
- Tehran address validation
- Default-address management
- Server-authoritative checkout preview
- Cash-on-delivery order creation
- Order success, history, and details
- Persian localization and digit formatting
- Custom SVG icon system
- Shared Figma-to-code design tokens

### Product Modeling

#### Shared Product Fields

- Name and slug
- Product type
- Category
- Price and stock
- Sale unit and unit size
- Minimum order quantity
- Short and full descriptions
- Cover image
- Featured and published status
- Created and updated timestamps

#### Indoor Plant Details

- Plant identity and approximate height
- Quality grade
- Pet compatibility
- Pot inclusion, material, color, size, and drainage
- Light and watering requirements
- Care difficulty
- Ideal temperature
- Care and shipping notes

#### Cut Flower Details

- Flower type and variety
- Color and stem length
- Quality grade
- Bunch size
- Freshness and vase life
- Shipping notes

### Admin Experience

- Django Admin catalog management
- Proxy models by product type
- Safe product-type validation
- Shared and type-specific field groups
- Category and image management
- Read-only financial and snapshot fields
- Editable order and payment statuses
- Admin search and filtering

---

## Tech Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS 4
- Framer Motion
- TanStack Query
- Redux Toolkit
- Axios
- Swiper
- Recharts
- `next/image`
- CSS design tokens
- Custom SVG React components

### Backend

- Python
- Django 5.2
- Django REST Framework
- drf-spectacular
- PostgreSQL
- Django sessions
- CSRF protection
- Gunicorn

### Infrastructure

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Neon PostgreSQL
- **Domain:** `florisa.ir`
- Health checks and keep-alive monitoring

---

## Architecture

```text
Browser
  │
  ├── Next.js
  │     ├── responsive UI
  │     ├── cart and favorites providers
  │     ├── session-aware API client
  │     ├── route guards
  │     └── runtime response parsers
  │
  └── Django REST API
        ├── authentication
        ├── catalog
        ├── profiles
        ├── addresses
        ├── checkout preview
        ├── orders
        └── admin
              │
              └── PostgreSQL
```

The frontend never treats browser cart prices as authoritative. Checkout sends only product identifiers and quantities; the backend recalculates prices, availability, totals, units, and validation results.

---

## Repository Structure

```text
flower-platform/
├── web/                         # Next.js frontend
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   └── icons/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── catalog/
│   │   │   ├── favorites/
│   │   │   ├── home/
│   │   │   ├── orders/
│   │   │   └── profile/
│   │   ├── lib/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── next.config.ts
│
├── api/                         # Django backend
│   ├── config/
│   ├── accounts/
│   ├── catalog/
│   ├── orders/
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

The exact folder names may change as the project is refactored.

---

## Authentication Flow

```text
Phone entry
  ↓
POST /api/auth/request-otp/
  ↓
Hashed OTP challenge
  ↓
POST /api/auth/verify-otp/
  ↓
Django session login
  ↓
GET /api/auth/me/
  ↓
Profile completion when required
```

### Security Characteristics

- Iranian phone normalization
- Five-digit OTP validation
- OTP hashing and expiry
- Attempt limits
- Previous-challenge invalidation
- Replay prevention
- Per-phone request limits
- Session authentication
- CSRF protection
- Demo mode disabled by default
- No plaintext OTP logging or API exposure

---

## Cart and Checkout Flow

```text
Guest cart
  ↓
Authentication
  ↓
Profile completion
  ↓
Authoritative preview
  ↓
Tehran address
  ↓
Atomic COD order
  ↓
Success
  ↓
Order history and details
```

The backend is authoritative for:

- Current price
- Availability
- Stock
- Minimum order quantity
- Sale unit
- Line totals
- Final order total

---

## Order Architecture

### UserAddress

- Tehran-only validation
- Postal-code validation
- User ownership
- One-default-address enforcement

### Order

- UUID public order number
- Immutable address snapshot
- Decimal totals
- Order and payment statuses
- Cash-on-delivery support
- Per-user idempotency key

### OrderItem

- Product name and identifier snapshots
- Unit and image snapshots
- Unit price snapshot
- Quantity and line total

Snapshot-based order records preserve historical accuracy when catalog data changes.

---

## API Overview

### Authentication

```http
POST /api/auth/request-otp/
POST /api/auth/verify-otp/
GET  /api/auth/me/
POST /api/auth/complete-registration/
```

### Catalog Filters

```text
search
category
ordering
availability
minimum price
maximum price
product type
quality
color
stem length
light
watering
care difficulty
```

### Orders

- Address list and creation
- Default-address management
- Checkout preview
- Order creation
- Order history
- Order details

Use Swagger for current endpoint contracts.

---

## Design System

```text
Figma Variables
  ↓
Primitive Tokens
  ↓
Semantic Tokens
  ↓
Tailwind CSS 4 theme variables
  ↓
Component utilities
```

Example utilities:

```text
bg-background-primary
bg-background-secondary
text-text-primary
text-text-secondary
text-text-brand
border-border-subtle
bg-action-primary
text-feedback-success
text-feedback-error
```

Components consume semantic tokens rather than hardcoded color values.

### Custom Icons

```text
src/components/icons/
├── Icon.tsx
├── HomeIcon.tsx
├── StoreIcon.tsx
├── CartIcon.tsx
├── HeartIcon.tsx
├── UserIcon.tsx
└── index.ts
```

All icon paths use `currentColor`, allowing Tailwind to control active, inactive, hover, and theme states.

---

## Local Development

### Requirements

- Node.js 20+
- npm
- Python 3.12+
- PostgreSQL
- Git

### Clone

```bash
git clone <repository-url>
cd flower-platform
```

### Frontend

```bash
cd web
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

Production check:

```bash
npm run build
npm run start
```

### Backend on Windows PowerShell

```powershell
cd api
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Backend on macOS or Linux

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000
```

> Some Windows PowerShell versions do not support `&&`. Run commands separately or use `;`.

---

## Environment Variables

Never commit real secrets.

### Frontend

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend

Create `api/.env`:

```env
DEBUG=True
SECRET_KEY=replace-me
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgresql://user:password@localhost:5432/florisa

CSRF_TRUSTED_ORIGINS=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000

DEMO_OTP_ENABLED=False
DEMO_OTP_ONLY=False
DEMO_OTP_PHONE=
DEMO_OTP_CODE=

SMS_PROVIDER=
SMS_API_KEY=
SMS_TEMPLATE_ID=
```

Use the exact variable names from the backend settings if they differ.

---

## Database

```bash
cd api
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations
```

---

## Tests and Quality Checks

Backend:

```bash
cd api
python manage.py test
```

Frontend:

```bash
cd web
npm run lint
npm run build
```

Recommended future coverage:

- Component tests
- API integration tests
- Checkout end-to-end tests
- Playwright tests
- Accessibility regression tests

---

## Image Strategy

- Product and category assets live under `web/public/images/`
- APIs may return filenames rather than complete URLs
- Frontend helpers resolve image paths
- `next/image` provides responsive optimization
- Missing images use controlled fallbacks
- WebP or AVIF is preferred for raster assets
- SVG assets remain vector-based

---

## Deployment

### Vercel

Set the project root directory to:

```text
web
```

Every imported frontend dependency must be listed in:

```text
web/package.json
```

Installing a dependency in the repository root does not make it available to a Vercel project rooted at `web`.

### Render

Typical start command:

```bash
python manage.py migrate && gunicorn config.wsgi:application
```

Configure:

- Build and start commands
- Database URL
- Allowed hosts
- CORS origins
- CSRF trusted origins
- Static files
- Demo OTP flags
- SMS credentials

### Deployment Checklist

- Run frontend production build
- Run backend tests
- Apply migrations
- Verify `/api/health/`
- Verify sessions and CSRF
- Verify CORS
- Verify image paths
- Verify OTP restrictions
- Verify order idempotency
- Verify production environment variables

---

## Current MVP Boundaries

- Cash on delivery is the only payment method
- Delivery is currently limited to Tehran
- Online payment is not implemented yet
- Advanced inventory reservation is planned
- Shipping-fee rules are still evolving
- Free-tier services may experience cold starts

These are explicit MVP boundaries, not features being hidden under the rug like cables behind a desk.

---

## Roadmap

### Product

- Online payment gateway
- Map-based address selection
- Editable user profile
- Shipping-fee rules
- Order cancellation rules
- Discount codes
- Scheduled delivery
- Gift notes
- Bouquets, boxes, and baskets
- Notifications

### Engineering

- `/api/v1/` versioning
- Docker setup
- Environment validation
- Ruff and Black
- ESLint and Prettier
- Pre-commit hooks
- CI pipeline
- Playwright
- Structured logging
- Error monitoring
- Query profiling

---

## Engineering Decisions

### Session Authentication

The app is browser-based and benefits from secure HTTP-only cookies and Django's mature session system.

### Server-Authoritative Checkout

Client cart state can be stale or modified. The backend always recalculates prices, stock, units, and totals.

### Snapshot Order Items

Historical orders must remain accurate even when product data changes.

### Separate Product-Type Details

Plants and cut flowers share commercial fields but require different domain-specific metadata.

### Semantic Tokens

Components depend on meaning such as `text-brand` and `background-secondary`, not specific hexadecimal values.

---

## Screenshots

Store screenshots in:

```text
docs/screenshots/
```

Suggested screenshots:

- Homepage
- Catalog
- Product details
- Authentication
- Cart
- Checkout
- Order success
- Order history
- Mobile navigation
- Django Admin

Example:

```md
![Florisa homepage](docs/screenshots/homepage.webp)
```

---

## Portfolio Highlights

Florisa demonstrates:

- Full-stack architecture
- Production deployment
- Secure OTP and session authentication
- CSRF-aware API communication
- Type-safe frontend development
- Domain-driven product modeling
- Server-authoritative checkout
- Atomic order creation
- Immutable order snapshots
- Responsive UI
- Design-token integration
- Custom SVG icon architecture
- Image optimization
- API documentation
- Admin tooling
- Real-world deployment debugging

---

## Contributing

This is currently a personal portfolio project.

For future collaboration:

1. Create a focused feature branch
2. Add or update tests
3. Run lint and production builds
4. Document environment changes
5. Open a clear pull request

```bash
git checkout -b feat/online-payment
git commit -m "feat: add online payment flow"
git push origin feat/online-payment
```

---

## License

No public license has been selected yet. Until one is added, all rights are reserved.

---

## Author

**Sina**  
Frontend Developer and UI/UX Designer

Built as a production-minded full-stack portfolio project.
