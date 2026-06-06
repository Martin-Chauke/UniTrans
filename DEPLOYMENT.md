# Deployment Guide - Backend on Render, Manager Frontend on Vercel

This repo contains:
- `backend-api/` — Django API
- `frontend-manager/` — Next.js manager portal

The backend should be deployed on Render, and the manager frontend on Vercel.

---

## 1. Backend Deployment on Render

### 1.1 What is included
- `render.yaml` at repo root configures the Render web service
- `backend-api/` is the service root
- Django already includes `gunicorn`, `whitenoise`, and database URL support

### 1.2 Prepare Django for Render
1. Confirm `backend-api/requirements.txt` includes:
   - `gunicorn`
   - `whitenoise`
   - `dj-database-url`
   - `python-decouple`
2. Confirm `backend-api/unitrans/settings.py` includes:
   - `whitenoise.middleware.WhiteNoiseMiddleware`
   - `STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'`
   - `SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')`
   - `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` parsed from environment variables

### 1.3 Create or connect a PostgreSQL database
Use one of these options:
- Render Postgres add-on
- Supabase
- Neon
- Azure Database for PostgreSQL

Copy the connection string and keep it for Render environment variables.

### 1.4 Render service configuration
Render will use `render.yaml` in the repo root.
The backend service should use:
- Root directory: `backend-api`
- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Start command: `gunicorn unitrans.wsgi:application --bind 0.0.0.0:$PORT`

### 1.5 Set Render environment variables
In Render, set these env vars for the web service:
- `DATABASE_URL` → your Postgres URL
- `SECRET_KEY` → a strong Django secret
- `DEBUG` → `False`
- `ALLOWED_HOSTS` → e.g. `*.onrender.com`
- `CORS_ALLOWED_ORIGINS` → e.g. `https://your-manager-domain.vercel.app`

If using Render Postgres, do not store the database password in the repo.

### 1.6 Deploy the backend
1. Create a Render account at https://render.com
2. Add a new Web Service
3. Connect your GitHub repository
4. Choose the root repo containing `render.yaml`
5. Confirm the service uses `backend-api` as root
6. Deploy

### 1.7 Run migrations on Render
After the first deploy, open the Render shell and run:
```bash
python manage.py migrate
```
If you want, also run:
```bash
python manage.py createsuperuser
```

---

## 2. Manager Frontend Deployment on Vercel

### 2.1 Verify existing Vercel config
`frontend-manager/vercel.json` is already present and defines:
- `installCommand`: `npm ci`
- `buildCommand`: `npm run build`
- `devCommand`: `npm run dev`

### 2.2 Set up the Vercel project
1. Create a Vercel account at https://vercel.com
2. Import the same GitHub repository
3. Set the root directory to `frontend-manager`
4. Add a project environment variable:
   - `NEXT_PUBLIC_API_URL` → `https://<your-render-backend>.onrender.com`
5. Deploy

### 2.3 Confirm the frontend URL
Vercel gives you a URL such as:
- `https://frontend-manager-yourname.vercel.app`

---

## 3. Required Files and Links

Files added or updated:
- `render.yaml` — Render web service specification
- `backend-api/unitrans/settings.py` — Django deployment settings updated for Render
- `DEPLOYMENT.md` — step-by-step Render + Vercel deployment guide

Helpful links:
- Render: https://render.com
- Vercel: https://vercel.com
- Django gunicorn docs: https://docs.djangoproject.com/en/stable/howto/deployment/wsgi/gunicorn/
- Next.js deployment on Vercel: https://nextjs.org/docs/deployment

---

## 4. Environment Variables Summary

### Render backend env vars
```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=*.onrender.com
CORS_ALLOWED_ORIGINS=https://<your-vercel-manager>.vercel.app
```

### Vercel manager frontend env vars
```
NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com
```

---

## 5. Notes
- `frontend-manager/vercel.json` already exists for Vercel builds.
- The Render backend service uses `gunicorn` and `whitenoise`.
- Do not commit secret values to Git.
