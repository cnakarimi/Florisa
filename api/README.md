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

## Endpoints

- `GET /api/auth/csrf/`
- `POST /api/auth/request-otp/`
- `POST /api/auth/verify-otp/`
- `GET /api/auth/me/`
- `POST /api/auth/logout/`

Authentication uses Django's HttpOnly session cookie. Unsafe authenticated
requests require the `X-CSRFToken` header using the readable `csrftoken`
cookie supplied by Django.

The development configuration explicitly allows credentialed requests from
`http://localhost:3000` and `http://127.0.0.1:3000`. Secure cookies remain
disabled for plain-HTTP local development and should be enabled in production.
