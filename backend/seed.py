"""
Seed script: initialize the SQLite database with required data.

This script performs the following actions:

  1. Creates the database file (backend/instance/meeting.db) if it doesn't exist
  2. Creates all tables (users, rooms, bookings) via SQLAlchemy
  3. Inserts an admin user (username: admin, password: admin123)
  4. Inserts 10 sample meeting rooms across 3 floors with floor-plan positions

What happens to existing data:

  - Without --reset:  SAFE — only inserts missing records, never overwrites
  - With    --reset:  DESTRUCTIVE — deletes the entire database file first

After running this script:
  - The backend is ready to start:  python app.py
  - Admin can log in:               http://localhost:5173/login
  - Admin can manage rooms:         http://localhost:5173/admin
  - Users can register and book:    http://localhost:5173/dashboard

Usage:
    python seed.py              # First-time setup (idempotent, re-runnable)
    python seed.py --reset      # Wipe everything and start fresh

"""

import os
import sys

# Ensure instance directory exists
os.makedirs('instance', exist_ok=True)

DB_PATH = os.path.join('instance', 'meeting.db')

# ── Step 0: Handle --reset flag ──────────────────────────────
if '--reset' in sys.argv or '-r' in sys.argv:
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f'[RESET] Deleted existing database: {DB_PATH}')
    else:
        print('[RESET] No existing database to delete')

# ── Step 1: Initialize database & tables ─────────────────────
from models import get_engine, create_tables, get_session, User, Room
from auth_utils import hash_password

engine = get_engine(DB_PATH)
create_tables(engine)
session = get_session(engine)
print(f'[INIT] Database initialized: {DB_PATH}')

# ── Step 2: Create admin user (skipped if exists) ────────────
admin = session.query(User).filter(User.username == 'admin').first()
if not admin:
    admin = User(username='admin', password_hash=hash_password('admin123'), role='admin')
    session.add(admin)
    print('[OK]  Admin user created (admin / admin123)')
else:
    print('[SKIP] Admin user already exists')

# ── Step 3: Create sample rooms (skipped if name exists) ─────
# Each room: (name, floor, capacity, pos_x%, pos_y%, width%, height%)
rooms_data = [
    # 1F (3 rooms)
    ('101讨论室', '1F', 6,   8, 10, 12, 18),
    ('102会议室', '1F', 12, 26, 10, 16, 18),
    ('103报告厅', '1F', 30, 48, 10, 22, 18),
    # 2F (3 rooms)
    ('201研讨室', '2F', 8,   8, 12, 16, 18),
    ('202会议室', '2F', 15, 28, 12, 16, 18),
    ('203培训室', '2F', 20, 50, 10, 22, 18),
    # 3F (4 rooms)
    ('301讨论室A', '3F', 4,  8, 12, 12, 18),
    ('302讨论室B', '3F', 6, 28, 12, 12, 18),
    ('303大会议室', '3F', 25, 48, 12, 22, 18),
    ('304活动室',   '3F', 40, 72, 12, 22, 18),
]

count = 0
skipped = 0
for name, floor, capacity, pos_x, pos_y, width_pct, height_pct in rooms_data:
    existing = session.query(Room).filter(Room.name == name).first()
    if not existing:
        room = Room(
            name=name, floor=floor, capacity=capacity,
            pos_x=pos_x, pos_y=pos_y,
            width_pct=width_pct, height_pct=height_pct,
            status='active'
        )
        session.add(room)
        count += 1
    else:
        skipped += 1

# ── Step 4: Commit & report ──────────────────────────────────
session.commit()

if count > 0:
    print(f'[OK]  {count} rooms created')
if skipped > 0:
    print(f'[SKIP] {skipped} rooms already exist')

users = session.query(User).count()
rooms = session.query(Room).count()
print(f'\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
print(f'  Database ready: {users} users, {rooms} rooms')
print(f'  Admin login:    admin / admin123')
print(f'  Start backend:  python app.py')
print(f'  Start frontend: cd ../frontend && npm run dev')
print(f'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

session.close()
