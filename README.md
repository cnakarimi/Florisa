# Flower Platform

Monorepo containing the Florisa frontend and authentication backend.

## Structure

- `web/` — Next.js frontend
- `api/` — Django REST API

## Local development

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
