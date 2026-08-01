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
