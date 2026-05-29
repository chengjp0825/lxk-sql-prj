# Quickstart: 九号楼会议室管理系统

**Feature**: 001-meeting-room-booking
**Last Updated**: 2026-05-27

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

## Project Structure

```
sql-prj/
├── backend/          # Flask API server
└── frontend/         # Vue 3 web app
```

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize database

```bash
python app.py
# 首次运行自动创建 instance/meeting.db
```

### 3. Run server

```bash
python app.py
# Server runs at http://localhost:5000
```

### 4. Create test admin user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 手动修改数据库将role改为'admin'
```

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Run dev server

```bash
npm run dev
# App runs at http://localhost:5173
```

---

## Testing the Flow

### 1. Register a user

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'
# Copy token from response
```

### 3. Get rooms

```bash
curl http://localhost:5000/api/rooms \
  -H "Authorization: Bearer <your_token>"
```

### 4. Create a booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"room_id": 1, "start_time": "2026-05-28T10:00:00", "end_time": "2026-05-28T11:00:00"}'
```

---

## Environment Variables

### Backend (.env)

```
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Common Issues

### CORS errors
Backend must have Flask-CORS configured. Already set in app.py.

### Database locked
SQLite doesn't support concurrent writes. Ensure only one Flask instance is running.

### Token expired
JWT tokens expire after 24 hours. Re-login required.
