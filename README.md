# Flower Platform

Monorepo containing the Florisa frontend and authentication backend.

## Structure

- `web/` — Next.js frontend
- `api/` — Django REST API

## Local development

Copy the safe example configuration before starting either application:

```powershell
Copy-Item api\.env.example api\.env
Copy-Item web\.env.example web\.env.local
```

The default development URLs are:

- Frontend: `http://localhost:3000`
- Django API: `http://localhost:8000`

### Frontend

```powershell
cd web
npm install
npm run dev
```

### Backend

```powershell
cd api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

Authentication uses Django's HttpOnly session cookie. The frontend initializes
and sends Django's CSRF token automatically and keeps only the pending phone
number in `sessionStorage` while the OTP screen is active.

The backend also supports an opt-in resume demo OTP mode configured entirely
through deployment environment variables. It bypasses delivery only for one
normalized demo phone while retaining the real hash, expiry, attempt limit,
one-time verification, session, and CSRF flow. See
[`api/README.md`](api/README.md#resume-demo-otp) for configuration and shutdown
instructions. Demo mode is disabled by default.
