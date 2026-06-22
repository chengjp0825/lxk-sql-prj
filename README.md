# Building 9 Meeting Room Management System

九号楼会议室管理系统 — 可视化、自助式空间调度平台。

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Clone & Install

```bash
git clone git@github.com:chengjp0825/lxk-sql-prj.git
cd lxk-sql-prj
```

### 2. Backend Setup

```bash
cd C:\Users\chengbigdan\Desktop\prj\sql-prj
cd backend
pip install -r requirements.txt

# Initialize database with seed data
python seed.py

# Start Flask server (http://localhost:5000)
python app.py
```

### 3. Frontend Setup

```bash
cd C:\Users\chengbigdan\Desktop\prj\sql-prj
cd frontend
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev
```

### 4. Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| User | Register your own | — |

## Project Structure

```
├── backend/
│   ├── app.py              # Flask routes & API
│   ├── models.py           # SQLAlchemy models (User, Room, Booking)
│   ├── auth_utils.py       # JWT + password hashing
│   ├── seed.py             # Database seeding script
│   ├── requirements.txt
│   └── instance/
│       └── meeting.db      # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios HTTP client
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Reusable logic (theme, notifications)
│   │   ├── views/          # Page views
│   │   ├── router/         # Vue Router config
│   │   └── style.css       # Global styles + CSS theme variables
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── specs/                  # Design specifications
```

## Features

- **Floor Dashboard**: View rooms grouped by floor with real-time availability (green/red/gray)
- **Three View Modes**: Card grid / Excel-style Timeline / Draggable Floor Plan
- **Visual Booking**: Two-click time slot selection with hover preview & collision detection
- **Admin Panel**: Room CRUD, inline editing, booking approval workflow, floor plan layout editor
- **My Bookings**: Track & cancel bookings with notification badges
- **Light/Dark Theme**: Toggle with persistent preference

## API Overview

All endpoints prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/rooms` | user | List rooms (filter `?floor=X`) |
| GET | `/rooms/:id/timeline` | user | Get room timeline by date |
| POST | `/bookings` | user | Create booking |
| GET | `/bookings/my` | user | My bookings |
| DELETE | `/bookings/:id` | user | Cancel booking |
| GET | `/admin/rooms` | admin | All rooms (admin view) |
| POST | `/admin/rooms` | admin | Create room |
| PUT | `/admin/rooms/:id` | admin | Update room |
| PATCH | `/admin/rooms/:id/status` | admin | Toggle room active/disabled |
| PATCH | `/admin/rooms/:id/position` | admin | Save floor plan position |
| GET | `/admin/bookings` | admin | Pending bookings |
| PATCH | `/admin/bookings/:id/status` | admin | Approve/reject booking |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 (Composition API) + Vite + Tailwind CSS |
| Backend | Python + Flask |
| Database | SQLite + SQLAlchemy |
| Auth | PyJWT + werkzeug |
