# UniTrans

A full-stack university bus transport management system. The backend is a Django REST Framework API, and the frontend is a Next.js Manager Portal — both running locally and communicating over HTTP.

## Requirements

**Backend**
- Python 3.12
- PostgreSQL 14+

**Frontend**
- Node.js 18+
- npm 9+

## Repository Structure

```
UniTrans/
├── .env                    # Backend environment variables (not committed)
├── README.md
├── venv/                   # Local virtual environment (not committed)
├── backend-api/            # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── unitrans_api.yaml   # OpenAPI 3.0 spec snapshot
│   ├── unitrans/           # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── accounts/       # User + Student, JWT auth
│       ├── lines/          # Line, Station, LineStation
│       ├── schedules/      # Schedule
│       ├── buses/          # Bus, BusAssignment
│       ├── trips/          # Trip, Row, SeatAssignment
│       ├── subscriptions/  # Subscription, SubscriptionHistory
│       ├── incidents/      # Incident
│       ├── notifications/  # Notification / Alert
│       └── reports/        # Aggregated reporting
└── frontend/               # Next.js Manager Portal
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/            # App Router pages & layouts
        │   ├── login/
        │   └── (dashboard)/
        │       ├── dashboard/
        │       ├── students/
        │       ├── buses/
        │       ├── drivers/
        │       ├── lines-trips/
        │       ├── incidents/
        │       ├── schedule/
        │       ├── subscription-history/
        │       ├── settings/
        │       └── search/
        ├── api/            # Axios client + per-domain API modules
        ├── components/     # UI and feature components
        ├── context/        # AuthContext
        ├── hooks/          # Data-fetching hooks (React Query)
        └── providers/      # React Query + auth providers
```

---

## Backend Setup

### 1. Clone / navigate to project directory

```powershell
cd D:\UniTrans
```

### 2. Create virtual environment (Python 3.12)

```powershell
python -m venv venv
```

### 3. Activate virtual environment

```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate.bat
```

### 4. Install dependencies

```powershell
pip install -r backend-api\requirements.txt
```

### 5. Configure environment variables

Create a `.env` file in the repo root and set the following variables:

```
SECRET_KEY=<your-secret-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
```

The `DATABASE_URL` format is:
```
postgresql://<user>:<password>@<host>:<port>/<dbname>

# Examples:
DATABASE_URL=postgresql://postgres:secret@localhost:5432/unitrans_db
DATABASE_URL=postgresql://admin:pass@db.example.com:5432/unitrans_prod
```

### 6. Create PostgreSQL database

Create the database named in your `DATABASE_URL` before running migrations.

### 7. Run migrations

```powershell
cd backend-api
python manage.py migrate
```

### 8. Create superuser

```powershell
python manage.py createsuperuser
```

### 9. Run development server

```powershell
python manage.py runserver
```

> All `manage.py` commands must be run from inside the `backend-api/` directory.

The API will be available at **http://localhost:8000**.

---

## Frontend Setup

### 1. Navigate to the frontend directory

```powershell
cd D:\UniTrans\frontend
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Configure environment variables

Create a `.env.local` file inside `frontend/` and set the API base URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If omitted, the Axios client defaults to `http://localhost:8000`.

### 4. Run development server

```powershell
npm run dev
```

The Manager Portal will be available at **http://localhost:3000**.

### Available scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Next.js in development mode |
| Production build | `npm run build` | Build for production |
| Production server | `npm start` | Serve the production build |
| Lint | `npm run lint` | Run ESLint |

---

## API Documentation

Once the backend server is running, visit:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema (JSON)**: http://localhost:8000/api/schema/

## Django Admin

Visit http://localhost:8000/admin/ and log in with your superuser credentials.

---

## API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new student |
| POST | `/api/auth/login/` | Obtain JWT token |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |

### Students (Student role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students/me/` | View own profile |
| GET | `/api/students/me/dashboard/` | Student dashboard |
| GET | `/api/students/me/seat/` | View assigned seat |

### Subscriptions (Student role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/` | Subscribe to line |
| GET | `/api/subscriptions/active/` | Current subscription |
| PUT | `/api/subscriptions/change-line/` | Change subscribed line |
| GET | `/api/subscriptions/history/` | Subscription history |

### Lines & Timetable
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lines/` | List all lines |
| GET | `/api/lines/{id}/timetable/` | View line timetable |
| GET/POST/PUT/DELETE | `/api/stations/` | Manage stations |

### Manager Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manager/students/` | List all students |
| GET | `/api/manager/drivers/` | List all drivers |
| GET | `/api/manager/dashboard/` | Manager dashboard |
| CRUD | `/api/manager/lines/` | Manage lines |
| CRUD | `/api/buses/` | Manage buses |
| CRUD | `/api/bus-assignments/` | Assign buses to lines |
| CRUD | `/api/trips/` | Manage trips |
| CRUD | `/api/seat-assignments/` | Assign seats |
| CRUD | `/api/incidents/` | Manage incidents |
| GET | `/api/reports/` | System reports |
| GET | `/api/notifications/` | View notifications |
| CRUD | `/api/manager/schedules/` | Manage schedules |
