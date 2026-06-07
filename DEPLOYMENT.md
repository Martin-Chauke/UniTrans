# Deployment Guide - Backend and Frontends on Render

This repo contains:
- `backend-api/` — Django API
- `frontend-manager/` — Next.js manager portal
- `frontend-student/` — Next.js student portal
- `frontend-driver/` — Next.js driver portal

All services can be deployed on Render using `render.yaml` in the repo root.

---

## 1. Backend Deployment on Render

### 1.1 What is included
- `render.yaml` at repo root configures the Render web service
- `backend-api/` is the service root
- Django includes `gunicorn`, `whitenoise`, and database URL support

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
- Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
- Start command: `gunicorn unitrans.wsgi:application --bind 0.0.0.0:$PORT`

### 1.5 Set Render environment variables for backend
In Render, set these env vars for the backend service:
- `DATABASE_URL` → your Postgres URL
- `SECRET_KEY` → a strong Django secret
- `DEBUG` → `False`
- `ALLOWED_HOSTS` → e.g. `*.onrender.com`
- `CORS_ALLOWED_ORIGINS` → frontend domains on Render

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

## 2. Frontend Deployment on Render

### 2.1 Configured frontend services
The repo now includes Render services for all three Next.js frontends:
- `frontend-manager`
- `frontend-student`
- `frontend-driver`

Each service uses:
- Environment: `Node`
- Build command: `npm install && npm run build`
- Start command: `npm run start -- -p $PORT`

### 2.2 Render configuration in `render.yaml`
The updated `render.yaml` includes:
- `unitrans-manager-frontend`
- `unitrans-student-frontend`
- `unitrans-driver-frontend`

Each frontend service is rooted in its own directory.

### 2.3 Set Render environment variables for frontends
In Render, set these env vars for each frontend service as needed:
- `NEXT_PUBLIC_API_URL` → `https://<your-render-backend>.onrender.com`
- Any other frontend-specific variables your app requires

### 2.4 Deploy each frontend
1. Create a Render account at https://render.com
2. Add a new Web Service for each portal
3. Set the root directory to the frontend folder
4. Configure the build and start commands
5. Add the required environment variables
6. Deploy

---

## 3. Example `render.yaml`

The repo now includes the full service list for backend and frontends.

---

## 4. Environment Variables Summary

### Backend env vars
```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=*.onrender.com
CORS_ALLOWED_ORIGINS=https://<your-manager-domain>.onrender.com,https://<your-student-domain>.onrender.com,https://<your-driver-domain>.onrender.com
```

### Frontend env vars
```
NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com
```

---

## 5. Notes
- All services are now intended for Render deployment.
- Use `render.yaml` to keep deployments in sync.
- Do not commit secret values to Git.
