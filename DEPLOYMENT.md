# Deployment Guide - Manager Frontend & Backend to Vercel

## Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository pushed to GitHub, GitLab, or Bitbucket
- PostgreSQL database (hosted on Azure, Supabase, Neon, or similar)

---

## Step 1: Prepare the Backend (Django)

### 1.1 Update Static Files Configuration
The backend needs to serve static files properly on Vercel. Update `unitrans/settings.py`:

```python
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Add whitenoise for static file handling
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
    'corsheaders.middleware.CorsMiddleware',
    # ... rest of middleware
]

# Enable compression for static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 1.2 Configure CORS for Frontend
In `unitrans/settings.py`, update CORS settings:

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000'
).split(',')
```

---

## Step 2: Set Up PostgreSQL Database

### Option A: Supabase (Recommended - Free tier available)
1. Go to [supabase.com](https://supabase.com) and create a project
2. Copy the PostgreSQL connection string
3. Use it as your `DATABASE_URL`

### Option B: Azure Database for PostgreSQL
1. Create a PostgreSQL server in Azure portal
2. Copy the connection string format: `postgresql://username:password@servername.postgres.database.azure.com:5432/dbname`

### Option C: Neon (PostgreSQL as a Service)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project and copy the connection string

---

## Step 3: Deploy Backend to Vercel

### 3.1 Push to Git
Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 3.2 Import Backend Project on Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select the **backend-api** folder as root directory
5. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: Generate a secure key (use Django: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*.vercel.app,localhost`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`

6. Click **Deploy**

### 3.3 Get Your Backend URL
After deployment, you'll see a URL like: `https://your-backend.vercel.app`

---

## Step 4: Deploy Manager Frontend to Vercel

### 4.1 Import Frontend Project on Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Select the **frontend-manager** folder as root directory
5. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.vercel.app`
   
6. Click **Deploy**

### 4.2 Get Your Frontend URL
You'll receive a URL like: `https://your-frontend-manager.vercel.app`

---

## Step 5: Final Verification

### Test Backend API
```bash
curl https://your-backend.vercel.app/api/schema/
```

### Test Frontend
Visit `https://your-frontend-manager.vercel.app` in your browser

### Verify Database Connection
The backend will need to run migrations on first deploy. You may need to:
1. Run migrations manually via Vercel CLI:
```bash
vercel env pull  # Pull environment variables
python manage.py migrate
```

---

## Environment Variables Summary

### Backend (.env in Vercel)
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=*.vercel.app,localhost
CORS_ALLOWED_ORIGINS=https://your-frontend-manager.vercel.app
```

### Frontend (.env.local in Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## Troubleshooting

### Backend won't deploy
- Check `vercel.json` exists and is valid
- Ensure `api/wsgi.py` exists
- Check Python dependencies in `requirements.txt`

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check database whitelist IPs (Vercel IPs may need to be added)
- For Supabase: Ensure you're using the correct connection string format

### CORS errors on frontend
- Update `CORS_ALLOWED_ORIGINS` in backend environment variables
- Restart backend deployment after updating

### Static files not loading
- Verify `whitenoise` is in requirements.txt
- Check `STATICFILES_STORAGE` setting in settings.py

---

## Next Steps
- Set up CI/CD with GitHub Actions (optional)
- Configure custom domain names
- Set up monitoring and error tracking
- Configure email service for notifications
