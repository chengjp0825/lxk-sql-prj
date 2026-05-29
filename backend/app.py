import os
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from models import get_engine, create_tables, get_session, User, Room, Booking
from auth_utils import verify_password, generate_token, decode_token, hash_password

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'meeting.db')
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = get_engine(DB_PATH)
create_tables(engine)


def get_db():
    return get_session(engine)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        if token.startswith('Bearer '):
            token = token[7:]

        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        g.user_id = payload['user_id']
        g.username = payload['username']
        g.role = payload['role']
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        if g.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


# Auth endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    db = get_db()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            return jsonify({'error': 'Username already exists'}), 400

        user = User(
            username=username,
            password_hash=hash_password(password),
            role='user'
        )
        db.add(user)
        db.commit()
        return jsonify({'message': 'User registered successfully', 'user_id': user.id}), 201
    finally:
        db.close()


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    db = get_db()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = generate_token(user.id, user.username, user.role)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        }), 200
    finally:
        db.close()


# Room endpoints
@app.route('/api/rooms', methods=['GET'])
@require_auth
def get_rooms():
    db = get_db()
    try:
        floor = request.args.get('floor')
        query = db.query(Room)
        if floor:
            query = query.filter(Room.floor == floor)
        rooms = query.all()

        result = []
        now = datetime.utcnow()
        for room in rooms:
            current_status = 'available'
            if room.status == 'disabled':
                current_status = 'disabled'
            else:
                active_booking = db.query(Booking).filter(
                    Booking.room_id == room.id,
                    Booking.status.in_(['pending', 'approved']),
                    Booking.start_time <= now,
                    Booking.end_time > now
                ).first()
                if active_booking:
                    current_status = 'occupied'

            result.append({
                'id': room.id,
                'name': room.name,
                'floor': room.floor,
                'capacity': room.capacity,
                'status': room.status,
                'current_status': current_status
            })
        return jsonify({'rooms': result}), 200
    finally:
        db.close()


@app.route('/api/admin/rooms', methods=['POST'])
@require_admin
def create_room():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name')
    floor = data.get('floor')
    capacity = data.get('capacity')

    if not name or not floor or not capacity:
        return jsonify({'error': 'Name, floor and capacity required'}), 400

    db = get_db()
    try:
        room = Room(name=name, floor=floor, capacity=capacity, status='active')
        db.add(room)
        db.commit()
        return jsonify({'message': 'Room created successfully', 'room': {'id': room.id, 'name': room.name}}), 201
    finally:
        db.close()


@app.route('/api/admin/rooms/<int:room_id>', methods=['PUT'])
@require_admin
def update_room(room_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    db = get_db()
    try:
        room = db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return jsonify({'error': 'Room not found'}), 404

        if 'name' in data:
            room.name = data['name']
        if 'floor' in data:
            room.floor = data['floor']
        if 'capacity' in data:
            room.capacity = data['capacity']

        db.commit()
        return jsonify({'message': 'Room updated successfully'}), 200
    finally:
        db.close()


@app.route('/api/admin/rooms/<int:room_id>/status', methods=['PATCH'])
@require_admin
def update_room_status(room_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    status = data.get('status')
    if status not in ['active', 'disabled']:
        return jsonify({'error': 'Invalid status'}), 400

    db = get_db()
    try:
        room = db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return jsonify({'error': 'Room not found'}), 404

        room.status = status
        db.commit()
        return jsonify({'message': 'Room status updated', 'room': {'id': room.id, 'status': room.status}}), 200
    finally:
        db.close()


# Floor status endpoint
@app.route('/api/floors/<floor_id>/rooms-status', methods=['GET'])
@require_auth
def get_floor_rooms_status(floor_id):
    db = get_db()
    try:
        rooms = db.query(Room).filter(Room.floor == floor_id).all()
        now = datetime.utcnow()

        result = []
        for room in rooms:
            current_status = 'available'
            if room.status == 'disabled':
                current_status = 'disabled'
            else:
                active_booking = db.query(Booking).filter(
                    Booking.room_id == room.id,
                    Booking.status.in_(['pending', 'approved']),
                    Booking.start_time <= now,
                    Booking.end_time > now
                ).first()
                if active_booking:
                    current_status = 'in_use'

            result.append({
                'id': room.id,
                'name': room.name,
                'floor': room.floor,
                'capacity': room.capacity,
                'current_status': current_status
            })
        return jsonify({'rooms': result}), 200
    finally:
        db.close()


# Booking endpoints
@app.route('/api/rooms/<int:room_id>/timeline', methods=['GET'])
@require_auth
def get_room_timeline(room_id):
    date_str = request.args.get('date')
    if not date_str:
        date_str = datetime.utcnow().strftime('%Y-%m-%d')

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    db = get_db()
    try:
        room = db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return jsonify({'error': 'Room not found'}), 404

        start_of_day = date
        end_of_day = date + timedelta(days=1)

        bookings = db.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.status.in_(['pending', 'approved']),
            Booking.end_time > start_of_day,
            Booking.start_time < end_of_day
        ).all()

        slots = []
        current = datetime.combine(date, datetime.min.time().replace(hour=8))
        end = datetime.combine(date, datetime.min.time().replace(hour=22))

        while current < end:
            slot_end = current + timedelta(minutes=30)
            slot_status = 'available'

            for booking in bookings:
                if booking.start_time < slot_end and booking.end_time > current:
                    slot_status = 'occupied'
                    break

            slots.append({
                'start': current.strftime('%H:%M'),
                'end': slot_end.strftime('%H:%M'),
                'status': slot_status
            })
            current = slot_end

        return jsonify({
            'room_id': room_id,
            'date': date_str,
            'slots': slots
        }), 200
    finally:
        db.close()


@app.route('/api/bookings', methods=['POST'])
@require_auth
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    room_id = data.get('room_id')
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')

    if not room_id or not start_time_str or not end_time_str:
        return jsonify({'error': 'room_id, start_time and end_time required'}), 400

    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400

    if start_time >= end_time:
        return jsonify({'error': 'End time must be after start time'}), 400

    duration = end_time - start_time
    if duration > timedelta(hours=4):
        return jsonify({'error': 'Booking duration cannot exceed 4 hours'}), 400

    if start_time < datetime.utcnow() + timedelta(minutes=15):
        return jsonify({'error': 'Booking must be at least 15 minutes in the future'}), 400

    db = get_db()
    try:
        room = db.query(Room).filter(Room.id == room_id).first()
        if not room:
            return jsonify({'error': 'Room not found'}), 404

        if room.status == 'disabled':
            return jsonify({'error': 'Room is disabled'}), 400

        overlapping = db.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.status.in_(['pending', 'approved']),
            Booking.start_time < end_time,
            Booking.end_time > start_time
        ).first()

        if overlapping:
            return jsonify({'error': 'Time slot conflict'}), 409

        booking = Booking(
            user_id=g.user_id,
            room_id=room_id,
            start_time=start_time,
            end_time=end_time,
            status='pending'
        )
        db.add(booking)
        db.commit()

        return jsonify({
            'message': 'Booking created successfully',
            'booking': {
                'id': booking.id,
                'room_id': booking.room_id,
                'start_time': booking.start_time.isoformat(),
                'end_time': booking.end_time.isoformat(),
                'status': booking.status
            }
        }), 201
    finally:
        db.close()


@app.route('/api/bookings/my', methods=['GET'])
@require_auth
def get_my_bookings():
    db = get_db()
    try:
        bookings = db.query(Booking).filter(Booking.user_id == g.user_id).order_by(Booking.created_at.desc()).all()
        result = []
        for b in bookings:
            room = db.query(Room).filter(Room.id == b.room_id).first()
            result.append({
                'id': b.id,
                'room': {'id': room.id, 'name': room.name, 'floor': room.floor} if room else None,
                'start_time': b.start_time.isoformat(),
                'end_time': b.end_time.isoformat(),
                'status': b.status,
                'created_at': b.created_at.isoformat()
            })
        return jsonify({'bookings': result}), 200
    finally:
        db.close()


@app.route('/api/bookings/<int:booking_id>', methods=['DELETE'])
@require_auth
def cancel_booking(booking_id):
    db = get_db()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404

        if booking.user_id != g.user_id and g.role != 'admin':
            return jsonify({'error': 'Not authorized'}), 403

        if booking.status in ['cancelled', 'rejected']:
            return jsonify({'error': 'Booking already cancelled or rejected'}), 400

        if booking.start_time <= datetime.utcnow():
            return jsonify({'error': 'Cannot cancel started booking'}), 400

        booking.status = 'cancelled'
        db.commit()
        return jsonify({'message': 'Booking cancelled successfully'}), 200
    finally:
        db.close()


# Admin endpoints
@app.route('/api/admin/bookings', methods=['GET'])
@require_admin
def get_all_pending_bookings():
    db = get_db()
    try:
        bookings = db.query(Booking).filter(Booking.status == 'pending').order_by(Booking.created_at.desc()).all()
        result = []
        for b in bookings:
            room = db.query(Room).filter(Room.id == b.room_id).first()
            user = db.query(User).filter(User.id == b.user_id).first()
            result.append({
                'id': b.id,
                'room': {'id': room.id, 'name': room.name, 'floor': room.floor} if room else None,
                'user': {'id': user.id, 'username': user.username} if user else None,
                'start_time': b.start_time.isoformat(),
                'end_time': b.end_time.isoformat(),
                'status': b.status,
                'created_at': b.created_at.isoformat()
            })
        return jsonify({'bookings': result}), 200
    finally:
        db.close()


@app.route('/api/admin/bookings/<int:booking_id>/status', methods=['PATCH'])
@require_admin
def update_booking_status(booking_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    new_status = data.get('status')
    if new_status not in ['approved', 'rejected']:
        return jsonify({'error': 'Status must be approved or rejected'}), 400

    db = get_db()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404

        booking.status = new_status
        db.commit()
        return jsonify({
            'message': f'Booking {new_status}',
            'booking': {'id': booking.id, 'status': booking.status}
        }), 200
    finally:
        db.close()


@app.route('/api/admin/rooms', methods=['GET'])
@require_admin
def get_all_rooms_admin():
    db = get_db()
    try:
        rooms = db.query(Room).all()
        result = []
        for room in rooms:
            result.append({
                'id': room.id,
                'name': room.name,
                'floor': room.floor,
                'capacity': room.capacity,
                'status': room.status
            })
        return jsonify({'rooms': result}), 200
    finally:
        db.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
