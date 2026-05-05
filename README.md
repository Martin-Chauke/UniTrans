# UniTrans

A full-stack university bus transport management system. The backend is a Django REST Framework API. The UI is split into **three Next.js applications** that all talk to the same API:

- **Manager Portal** (`frontend-manager/`) — for transport managers and admins to manage students, buses, drivers, lines, trips, incidents, subscriptions, statistics, and reports.
- **Student Portal** (`frontend-student/`) — for students to view assigned transport, schedules, subscriptions, line-change requests, notifications, and support reports.
- **Driver Portal** (`frontend-driver/`) — for drivers to view trips for their assigned bus, browse trip history, report incidents, and read manager replies (default dev port **3002**).

Each app uses JWT authentication with its own login flow, Axios client, and `localStorage` keys (`manager_access_token`, `student_access_token`, `driver_access_token`, …). Because the apps run on different dev ports by default, a manager, student, and driver can be signed in at the same time without token collisions.

![System Overview](SYSTEM OVERVIEW.png)

---

## Requirements

**Backend**
- Python 3.12
- PostgreSQL 14+

**Frontends** (one install per app directory)
- Node.js 18+
- npm 9+
- Next.js 16 (see each `frontend-*/package.json` for exact framework versions)

---

## Repository Structure

```
UniTrans/
├── .env                        # Backend environment variables (not committed)
├── README.md
├── venv/                       # Local virtual environment (not committed)
├── backend-api/                # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── unitrans_api.yaml       # OpenAPI 3.0 spec snapshot
│   ├── unitrans/               # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── accounts/           # User, Student, Driver models + JWT auth
│       ├── lines/              # Line, Station, LineStation, Timetable
│       ├── schedules/          # Schedule
│       ├── buses/              # Bus, BusAssignment
│       ├── trips/              # Trip, Row, SeatAssignment
│       ├── subscriptions/      # Subscription, SubscriptionHistory
│       ├── incidents/          # Incident
│       ├── notifications/      # Notification / Alert
│       └── reports/            # Aggregated reporting
├── frontend-manager/           # Next.js — Manager Portal (default dev port **3000**)
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx                # Public landing / entry
│       │   ├── login/
│       │   ├── register/
│       │   └── (dashboard)/            # Auth-guarded manager UI
│       │       ├── dashboard/
│       │       ├── statistics/
│       │       ├── students/
│       │       ├── buses/
│       │       ├── drivers/
│       │       ├── lines-trips/
│       │       ├── incidents/
│       │       ├── schedule/
│       │       ├── subscription-history/
│       │       ├── settings/
│       │       └── search/
│       ├── api/
│       │   ├── client.ts               # Manager Axios + JWT refresh
│       │   └── modules/                # auth, accounts, buses, drivers, lines, …
│       ├── components/
│       ├── context/
│       │   └── AuthContext.tsx
│               └── providers/
├── frontend-driver/            # Next.js — Driver Portal (default dev port **3002**)
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/
│       │   ├── page.tsx                # Redirects to /driver/landing
│       │   ├── driver/
│       │   │   ├── landing/
│       │   │   └── login/
│       │   └── (driver-portal)/        # Auth-guarded driver UI
│       │       └── driver/
│       │           ├── dashboard/
│       │           ├── trips/
│       │           ├── incidents/
│       │           └── profile/
│       ├── api/
│       │   ├── driver-client.ts        # Driver Axios + JWT refresh
│       │   └── modules/driver/
│       ├── components/driver-layout/
│       ├── context/
│       │   └── DriverAuthContext.tsx
│       └── providers/
└── frontend-student/           # Next.js — Student Portal (default dev port **3001**)
    ├── package.json
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx                # Redirects to /student/landing
        │   ├── student/
        │   │   ├── landing/            # Marketing / entry for students
        │   │   ├── login/
        │   │   └── register/
        │   └── (student-portal)/       # Auth-guarded student UI
        │       └── student/
        │           ├── dashboard/
        │           ├── transport/
        │           ├── schedule/
        │           ├── station-line/
        │           ├── subscription/
        │           ├── subscription-history/
        │           ├── request-change/
        │           ├── requests/
        │           ├── assignment-history/
        │           ├── notifications/
        │           ├── reports/
        │           └── profile/
        ├── api/
        │   ├── student-client.ts       # Student Axios + JWT refresh
        │   └── modules/student/        # Student-facing API helpers
        ├── components/
        ├── context/
        │   └── StudentAuthContext.tsx
        └── providers/
```

---

## Backend Setup

### 1. Navigate to the project directory

```bash
# Linux / macOS
cd /path/to/UniTrans

# Windows PowerShell
cd D:\UniTrans
```

### 2. Create virtual environment (Python 3.12)

```bash
python -m venv venv
```

### 3. Activate virtual environment

```bash
# Linux / macOS
source venv/bin/activate

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate.bat
```

### 4. Install dependencies

```bash
pip install -r backend-api/requirements.txt
```

### 5. Configure environment variables

Create a `.env` file in the repo root:

```
SECRET_KEY=<your-secret-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
```

Examples:

```
DATABASE_URL=postgresql://postgres:secret@localhost:5432/unitrans_db
DATABASE_URL=postgresql://admin:pass@db.example.com:5432/unitrans_prod
```

### 6. Create PostgreSQL database

Create the database named in your `DATABASE_URL` before running migrations.

### 7. Run migrations

```bash
cd backend-api
python manage.py migrate
```

### 8. Create superuser

```bash
python manage.py createsuperuser
```

### 9. Run development server

```bash
python manage.py runserver
```

> All `manage.py` commands must be run from inside the `backend-api/` directory.

The API will be available at **http://localhost:8000**.

---

## Frontend Setup

The manager and student apps are **separate packages**. Install and run each from its own directory (in two terminals if you need both at once).

### Manager Portal (`frontend-manager/`)

1. **Go to the app folder**

```bash
cd frontend-manager
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment**

Create `frontend-manager/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If omitted, the API client defaults to `http://localhost:8000`.

4. **Dev server** (port **3000** per `package.json`)

```bash
npm run dev
```

| Page | URL |
|------|-----|
| Public landing | http://localhost:3000/ |
| Manager login | http://localhost:3000/login |
| Manager register | http://localhost:3000/register |

### Student Portal (`frontend-student/`)

1. **Go to the app folder**

```bash
cd frontend-student
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment**

Create `frontend-student/.env.local` with the same variable as above if your API is not on `http://localhost:8000`.

4. **Dev server** (port **3001** per `package.json`)

```bash
npm run dev
```

| Page | URL |
|------|-----|
| Root (redirects) | http://localhost:3001/ → `/student/landing` |
| Student landing | http://localhost:3001/student/landing |
| Student login | http://localhost:3001/student/login |
| Student register | http://localhost:3001/student/register |

### Driver Portal (`frontend-driver/`)

1. **Go to the app folder**

```bash
cd frontend-driver
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment**

Create `frontend-driver/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000` (or your API base URL) if needed.

4. **Dev server** (port **3002** per `package.json`)

```bash
npm run dev
```

| Page | URL |
|------|-----|
| Root (redirects) | http://localhost:3002/ → `/driver/landing` |
| Driver landing | http://localhost:3002/driver/landing |
| Driver login | http://localhost:3002/driver/login |

Driver accounts are created by a transport manager (**Drivers** in the manager app). Set an optional **Driver portal password** when adding or editing a driver so they can sign in. Tokens are stored as `driver_access_token` and `driver_refresh_token`.

### Available scripts (each app)

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Next.js in development mode |
| Production build | `npm run build` | Build for production |
| Production server | `npm start` | Serve the production build |
| Lint | `npm run lint` | Run ESLint |

---

## API Documentation

Once the backend server is running:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Django Admin

Visit http://localhost:8000/admin/ and log in with your superuser credentials.

---

## Student Portal — Flow & Communication

### Registration & Login

Students register via `POST /api/auth/register/` (no tokens returned) and then log in at `/student/login` on the **student app** (port 3001 in development). On successful login (`POST /api/auth/login/`) the API returns a JWT pair which is stored in `localStorage` under the keys `student_access_token` and `student_refresh_token` — separate from the manager's `access_token` and the driver's `driver_access_token` so multiple sessions can run side by side when using the apps together.

```
Student opens /student/register (frontend-student)
  → fills registration form (name, email, reg. number, password)
  → POST /api/auth/register/  →  student record created
  → redirected to /student/login

Student logs in at /student/login
  → POST /api/auth/login/
  → receives { access, refresh, user }
  → tokens saved to localStorage (student_access_token / student_refresh_token)
  → redirected to /student/dashboard
```

Every subsequent API call from the student portal attaches `Authorization: Bearer <student_access_token>`. When a 401 is received the student Axios instance silently refreshes via `POST /api/auth/token/refresh/` and retries.

### Student Portal Pages

| Route | What the student sees | API calls |
|---|---|---|
| `/student/landing` | Public entry / marketing before login | (static / navigation to login & register) |
| `/student/dashboard` | Overview of current line, next bus, subscription status, unread alerts, transport details, today's schedule, station map, request widget, history | `GET /api/students/me/dashboard/`, active subscription, timetable, notifications |
| `/student/transport` | Full transport assignment: line, seat, pickup station, subscription dates | `GET /api/students/me/`, `GET /api/students/me/seat/`, active subscription |
| `/student/schedule` | Timetable for the student's line, filterable by day | `GET /api/lines/{id}/timetable/` |
| `/student/station-line` | Visual route with all stops highlighted; student's stop marked | `GET /api/lines/{id}/` |
| `/student/subscription` | Active subscription details and status | `GET /api/subscriptions/active/` |
| `/student/subscription-history` | Table of all past subscription changes | `GET /api/subscriptions/history/` |
| `/student/request-change` | Form to request a line transfer; lists available lines | `GET /api/lines/`, `PUT /api/subscriptions/change-line/` |
| `/student/requests` | Status of submitted line change requests | `GET /api/subscriptions/history/` |
| `/student/assignment-history` | Timeline of all line assignments across semesters | `GET /api/subscriptions/history/` |
| `/student/notifications` | Full notification inbox; mark individual or all as read | `GET /api/notifications/`, `PATCH /api/notifications/{id}/read/`, `PATCH /api/notifications/read-all/` |
| `/student/reports` | Submit delay reports, incident reports, general inquiries | `POST /api/incidents/` |
| `/student/profile` | View and edit personal info; upload / remove profile photo | `GET /api/students/me/`, `PUT /api/students/me/` |

### Manager → Student Communication

The transport manager controls everything that affects a student's experience. The table below shows how manager actions in the Manager Portal flow through to what the student sees.

| Manager action | How the student sees it |
|---|---|
| Assigns student to a line | Student's `/transport` and `/dashboard` show the new line and pickup station |
| Creates a trip & assigns seats | Student's seat number appears on `/transport` and the dashboard summary |
| Sends a notification (trip delay, line change alert, etc.) | Appears in the student's notification inbox; unread badge updates on the topbar bell icon |
| Changes a bus assignment | Student sees updated bus details on next dashboard load |
| Resolves / creates an incident | Reflected in system alerts on the student's dashboard |
| Approves or rejects a line change request | The result appears in `/student/requests` and the student receives a notification |
| Updates timetable / schedule | Student's `/schedule` page reflects the change immediately |

### Authentication Isolation

Both apps share the same Django backend and the same `/api/auth/login/` endpoint. Tokens and React context stay separate per app:

| | Manager Portal (`frontend-manager`) | Student Portal (`frontend-student`) |
|---|---|---|
| Axios instance | `src/api/client.ts` | `src/api/student-client.ts` |
| localStorage key (access) | `access_token` | `student_access_token` |
| localStorage key (refresh) | `refresh_token` | `student_refresh_token` |
| React context | `AuthContext` | `StudentAuthContext` |
| Auth guard | `app/(dashboard)/layout.tsx` → `/login` | `app/(student-portal)/layout.tsx` → `/student/login` |

---

## API Endpoints Overview

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new student |
| POST | `/api/auth/manager/register/` | Register new transport manager |
| POST | `/api/auth/login/` | Obtain JWT token pair |
| POST | `/api/auth/token/refresh/` | Refresh access token |

### Student — Profile & Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET, PUT | `/api/students/me/` | View / update own profile |
| GET | `/api/students/me/dashboard/` | Dashboard summary |
| GET | `/api/students/me/seat/` | Current seat assignment |

### Student — Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/` | Subscribe to a line |
| GET | `/api/subscriptions/active/` | Current active subscription |
| PUT | `/api/subscriptions/change-line/` | Request line change |
| GET | `/api/subscriptions/history/` | Full subscription / request history |

### Student — Lines & Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lines/` | List all available lines |
| GET | `/api/lines/{id}/` | Line detail with stations |
| GET | `/api/lines/{id}/timetable/` | Full timetable for a line |
| GET | `/api/stations/` | List all stations |

### Student — Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | List all notifications |
| PATCH | `/api/notifications/{id}/read/` | Mark single notification as read |
| PATCH | `/api/notifications/read-all/` | Mark all notifications as read |

### Manager Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manager/dashboard/` | Manager overview dashboard |
| GET, POST, PUT, DELETE | `/api/manager/students/` | Manage student records |
| GET, POST, PUT, DELETE | `/api/manager/drivers/` | Manage driver records |
| CRUD | `/api/buses/` | Manage buses |
| CRUD | `/api/bus-assignments/` | Assign buses to lines |
| CRUD | `/api/trips/` | Manage trips |
| CRUD | `/api/seat-assignments/` | Assign seats to students |
| CRUD | `/api/incidents/` | Manage incidents |
| CRUD | `/api/schedules/` | Manage schedules |
| GET | `/api/reports/` | Aggregated system reports |
