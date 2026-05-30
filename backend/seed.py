"""Seed script: initialize database with admin user and sample rooms.

Usage:
    python seed.py              # Create fresh database with seed data
    python seed.py --reset      # Delete existing database, then re-create

After running, start the backend:
    python app.py
"""

import os
import sys
import argparse

# Ensure instance directory exists
os.makedirs('instance', exist_ok=True)

DB_PATH = os.path.join('instance', 'meeting.db')

if '--reset' in sys.argv or '-r' in sys.argv:
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f'Deleted {DB_PATH}')

from models import get_engine, create_tables, get_session, User, Room
from auth_utils import hash_password

engine = get_engine(DB_PATH)
create_tables(engine)
session = get_session(engine)

# ── Admin user ──────────────────────────────────────────────
admin = session.query(User).filter(User.username == 'admin').first()
if not admin:
    admin = User(username='admin', password_hash=hash_password('admin123'), role='admin')
    session.add(admin)
    print('[OK] Admin user created (admin / admin123)')

# ── Sample rooms ────────────────────────────────────────────
rooms_data = [
    # 1F
    ('101讨论室', '1F', 6,   8, 10, 12, 18),
    ('102会议室', '1F', 12, 26, 10, 16, 18),
    ('103报告厅', '1F', 30, 48, 10, 22, 18),
    # 2F
    ('201研讨室', '2F', 8,   8, 12, 16, 18),
    ('202会议室', '2F', 15, 28, 12, 16, 18),
    ('203培训室', '2F', 20, 50, 10, 22, 18),
    # 3F
    ('301讨论室A', '3F', 4,  8, 12, 12, 18),
    ('302讨论室B', '3F', 6, 28, 12, 12, 18),
    ('303大会议室', '3F', 25, 48, 12, 22, 18),
    ('304活动室',   '3F', 40, 72, 12, 22, 18),
]

count = 0
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

session.commit()

if count > 0:
    print(f'[OK] {count} rooms created')

# ── Summary ─────────────────────────────────────────────────
users = session.query(User).count()
rooms = session.query(Room).count()
print(f'\nDatabase ready: {users} users, {rooms} rooms')
print(f'Admin login:  admin / admin123')
print(f'Start server: python app.py')

session.close()
