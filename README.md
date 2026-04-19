# ☁️ SPARS — Student Performance Analysis & Reporting System

A full-stack web application for analysing student performance based on Course Outcomes (COs) for Cloud Computing (UPECS710), built with **Node.js · Express · React · JWT · Chart.js · Local JSON DB**.

---

## 🏗️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router v6, Chart.js 4  |
| Backend    | Node.js, Express 4                      |
| Auth       | JWT (jsonwebtoken), bcryptjs            |
| Database   | Local JSON files (zero-install DB)      |
| Charts     | Chart.js · Bar, Radar, Doughnut        |

---

## 📁 Project Structure

```
spars/
├── server/
│   ├── index.js              # Express app entry
│   ├── db.js                 # JSON-file local DB + seed data
│   ├── .env                  # JWT secret, port
│   ├── middleware/
│   │   └── auth.js           # JWT verify middleware
│   ├── routes/
│   │   ├── auth.js           # POST /login, GET /me, POST /logout
│   │   ├── students.js       # GET/PUT/DELETE /students
│   │   └── analytics.js      # Summary, CO stats, toppers, at-risk
│   └── data/                 # Auto-created JSON files (DB)
│       ├── users.json
│       ├── students.json
│       └── audit.json
│
├── client/
│   ├── public/index.html
│   └── src/
│       ├── App.js            # Router + protected routes
│       ├── index.js          # Entry point
│       ├── index.css         # Global design system (dark theme)
│       ├── context/
│       │   └── AuthContext.js  # JWT storage, login/logout, axios
│       ├── components/
│       │   └── Layout.js     # Topbar + sidebar nav
│       └── pages/
│           ├── Login.js       # Role selector + login form
│           ├── Dashboard.js   # Stats + distribution + CO bar charts
│           ├── COAnalysis.js  # Radar + doughnut + CO cards
│           ├── Students.js    # Searchable table + edit modal
│           ├── StudentDetail.js # Per-student radar, doughnut, q-chips
│           ├── Toppers.js     # Ranked leaderboard
│           ├── AtRisk.js      # Below-60% students
│           └── MyProfile.js   # Student-only self-view
│
└── package.json              # Root scripts (concurrently)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Step 1 — Install dependencies

```bash
# In the project root (spars/)
npm run install:all
```

Or manually:

```bash
cd server && npm install
cd ../client && npm install react react-dom react-router-dom axios chart.js react-chartjs-2 react-scripts
```

### Step 2 — Start the app

```bash
# From project root — starts both server (5000) and client (3000)
npm run dev
```

Or separately:

```bash
# Terminal 1 — API server
cd server && node index.js

# Terminal 2 — React dev server
cd client && npx react-scripts start
```

### Step 3 — Open the app

```
http://localhost:3000
```

The database (`server/data/`) is auto-created and seeded on first run.

---

## 🔐 Login Credentials

| Role          | Username       | Password       |
|---------------|----------------|----------------|
| Administrator | `admin`        | `admin123`     |
| Teacher       | `teacher`      | `teach123`     |
| Student       | `2211100123`   | `2211100123`   |
| Student       | `2211100129`   | `2211100129`   |
| _(any student reg. no.)_ | _(reg. no.)_ | _(same)_ |

---

## 🔑 JWT Auth Flow

```
Client                          Server
  │                               │
  │── POST /api/auth/login ──────▶│  Verify username+password (bcrypt)
  │◀─ { token, user } ───────────│  Sign JWT (8h expiry)
  │                               │
  │── GET /api/students ─────────▶│  Middleware: verify Bearer token
  │   Authorization: Bearer <jwt> │  Decode role, attach req.user
  │◀─ { students } ──────────────│  Role-gated response
  │                               │
  │── POST /api/auth/logout ─────▶│  Log audit, token discarded client-side
```

JWT payload:
```json
{ "id": "admin-1", "username": "admin", "name": "Administrator", "role": "admin", "reg": null }
```

---

## 📡 API Endpoints

### Auth
| Method | Route              | Access  | Description            |
|--------|--------------------|---------|------------------------|
| POST   | `/api/auth/login`  | Public  | Login, returns JWT     |
| GET    | `/api/auth/me`     | Any     | Current user info      |
| POST   | `/api/auth/logout` | Any     | Audit log + logout     |

### Students
| Method | Route                  | Access         | Description            |
|--------|------------------------|----------------|------------------------|
| GET    | `/api/students`        | Admin, Teacher | List all (paginated)   |
| GET    | `/api/students/:reg`   | Any*           | Single student         |
| PUT    | `/api/students/:reg`   | Admin, Teacher | Update marks           |
| DELETE | `/api/students/:reg`   | Admin only     | Delete record          |

*Students can only access their own record.

### Analytics
| Method | Route                       | Access         | Description          |
|--------|-----------------------------|----------------|----------------------|
| GET    | `/api/analytics/summary`    | Admin, Teacher | Dashboard stats      |
| GET    | `/api/analytics/co`         | Admin, Teacher | CO attainment data   |
| GET    | `/api/analytics/toppers`    | Admin, Teacher | Top performers       |
| GET    | `/api/analytics/at-risk`    | Admin, Teacher | Below-60% students   |
| GET    | `/api/analytics/student/:reg` | Any*         | Per-student analytics|
| GET    | `/api/analytics/audit`      | Admin only     | Audit log            |

---

## 🎯 Course Outcome Mapping

| Question | CO  | Max Marks |
|----------|-----|-----------|
| 1(a)     | CO1 | 1         |
| 1(b)     | CO3 | 1         |
| 1(c)     | CO2 | 1         |
| 1(d)     | CO2 | 1         |
| 1(e)     | CO3 | 1         |
| 2(a)     | CO2 | 2.5       |
| 2(b)     | CO4 | 2.5       |
| 2(c)     | CO2 | 2.5       |
| 2(d)     | CO3 | 2.5       |
| 2(e)     | CO4 | 2.5       |
| 2(f)     | CO1 | 2.5       |

A student "passes" a CO when their attainment percentage ≥ 50%.

---

## 🖥️ Features by Role

### 👤 Student
- Login with registration number
- View own performance report
- CO radar chart vs class average
- Question-wise mark breakdown
- Class rank

### 👩‍🏫 Teacher
- Dashboard with class-wide analytics
- CO attainment analysis (radar, doughnut, table)
- Browse & search all students
- Edit student marks via modal form
- Toppers leaderboard
- At-risk student identification

### 🛡️ Admin
- All teacher capabilities
- Delete student records
- View audit log (`/api/analytics/audit`)

---

## 🗄️ Local DB

The app uses plain JSON files stored in `server/data/`. No SQL or external DB required.

- `users.json` — Hashed passwords, roles
- `students.json` — Marks, question scores, CO data
- `audit.json` — Login/logout/edit history (last 500 entries)

To reset the database, simply delete the `server/data/` folder and restart the server.

---

## 📦 Installing React Scripts (if not auto-installed)

```bash
cd client
npm install react-scripts --save
```

Then update `client/package.json` scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

---

## 🔧 Environment Variables (`server/.env`)

```env
PORT=5000
JWT_SECRET=spars_jwt_secret_cloud_computing_2024
NODE_ENV=development
```

Change `JWT_SECRET` to a long random string in production.
