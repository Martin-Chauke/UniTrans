# UniTrans — API

A Django REST Framework API for managing university bus transport, including student subscriptions, trip scheduling, seat assignments, incident reporting, and notifications.

## Requirements

- Python 3.12
- PostgreSQL 14+

## Setup

### 1. Clone / navigate to project directory

```powershell
cd d:\UniTrans
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
pip install -r requirements.txt
```

### 5. Configure environment variables

```powershell
copy .env.example .env
# Edit .env — set your SECRET_KEY and DATABASE_URL
```

The `DATABASE_URL` format is:
```
postgresql://<user>:<password>@<host>:<port>/<dbname>

# Examples:
DATABASE_URL=postgresql://postgres:secret@localhost:5432/unitrans_db
DATABASE_URL=postgresql://admin:pass@db.example.com:5432/unitrans_prod
```

### 6. Create PostgreSQL database

```sql
CREATE DATABASE unitrans_db;
```

### 7. Run migrations

```powershell
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

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema (JSON)**: http://localhost:8000/api/schema/

## Django Admin

Visit http://localhost:8000/admin/ and log in with your superuser credentials.

## Project Structure

```
UniTrans/
├── requirements.txt
├── .env.example
├── manage.py
├── unitrans/               # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── accounts/           # User + Student, JWT auth
    ├── lines/              # Line, Station, LineStation
    ├── schedules/          # Schedule
    ├── buses/              # Bus, BusAssignment
    ├── trips/              # Trip, Row, SeatAssignment
    ├── subscriptions/      # Subscription, SubscriptionHistory
    ├── incidents/          # Incident
    ├── notifications/      # Notification / Alert
    └── reports/            # Aggregated reporting
```

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
| CRUD | `/api/buses/` | Manage buses |
| CRUD | `/api/bus-assignments/` | Assign buses to lines |
| CRUD | `/api/trips/` | Manage trips |
| CRUD | `/api/seat-assignments/` | Assign seats |
| CRUD | `/api/incidents/` | Manage incidents |
| GET | `/api/reports/` | System reports |
| GET | `/api/notifications/` | View notifications |
