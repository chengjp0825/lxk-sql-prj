# Booking API Contract

**Feature**: 001-meeting-room-booking
**Base URL**: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Auth

#### POST /auth/register
Register a new user.

**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user_id": 1
}
```

**Errors**:
- 400: Username already exists
- 400: Invalid input

---

#### POST /auth/login
Login and get JWT token.

**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "string",
    "role": "user"
  }
}
```

**Errors**:
- 401: Invalid credentials

---

### Rooms

#### GET /rooms
Get all rooms with current status.

**Auth**: Required

**Response (200)**:
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "会议室A",
      "floor": "1F",
      "capacity": 10,
      "status": "active",
      "current_status": "available"  // available / occupied / disabled
    }
  ]
}
```

**current_status logic**:
- `disabled` if room.status == 'disabled'
- `occupied` if room has an approved/pending booking that includes current time
- `available` otherwise

---

#### GET /rooms/:id/timeline
Get room booking timeline for a specific date.

**Auth**: Required

**Query params**:
- `date`: YYYY-MM-DD format

**Response (200)**:
```json
{
  "room_id": 1,
  "date": "2026-05-27",
  "slots": [
    {
      "start": "08:00",
      "end": "08:30",
      "status": "available"
    },
    {
      "start": "08:30",
      "end": "09:00",
      "status": "occupied",
      "booking_id": 5
    }
  ]
}
```

**Status values**:
- `available`: 空闲
- `occupied`: 被占用（显示booking_id）
- `past`: 已过去的时间段

---

### Bookings

#### POST /bookings
Create a new booking request.

**Auth**: Required

**Request**:
```json
{
  "room_id": 1,
  "start_time": "2026-05-27T10:00:00",
  "end_time": "2026-05-27T12:00:00"
}
```

**Response (201)**:
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 10,
    "room_id": 1,
    "start_time": "2026-05-27T10:00:00",
    "end_time": "2026-05-27T12:00:00",
    "status": "pending"
  }
}
```

**Errors**:
- 400: Time slot not available (overlap detected)
- 400: Booking duration exceeds 4 hours
- 400: Booking time is in the past
- 404: Room not found

---

#### GET /bookings/my
Get current user's bookings.

**Auth**: Required

**Response (200)**:
```json
{
  "bookings": [
    {
      "id": 10,
      "room": {
        "id": 1,
        "name": "会议室A",
        "floor": "1F"
      },
      "start_time": "2026-05-27T10:00:00",
      "end_time": "2026-05-27T12:00:00",
      "status": "pending",
      "created_at": "2026-05-27T09:00:00"
    }
  ]
}
```

---

#### DELETE /bookings/:id
Cancel a booking.

**Auth**: Required (owner only)

**Response (200)**:
```json
{
  "message": "Booking cancelled successfully"
}
```

**Errors**:
- 403: Not authorized
- 400: Cannot cancel started booking

---

### Admin

#### GET /admin/bookings
Get all pending bookings.

**Auth**: Required (admin only)

**Response (200)**:
```json
{
  "bookings": [
    {
      "id": 10,
      "room": {"id": 1, "name": "会议室A", "floor": "1F"},
      "user": {"id": 2, "username": "zhangsan"},
      "start_time": "2026-05-27T10:00:00",
      "end_time": "2026-05-27T12:00:00",
      "status": "pending",
      "created_at": "2026-05-27T09:00:00"
    }
  ]
}
```

---

#### PUT /admin/bookings/:id/approve
Approve a booking.

**Auth**: Required (admin only)

**Response (200)**:
```json
{
  "message": "Booking approved",
  "booking": {
    "id": 10,
    "status": "approved"
  }
}
```

---

#### PUT /admin/bookings/:id/reject
Reject a booking.

**Auth**: Required (admin only)

**Response (200)**:
```json
{
  "message": "Booking rejected",
  "booking": {
    "id": 10,
    "status": "rejected"
  }
}
```

---

#### PUT /admin/rooms/:id/status
Update room status.

**Auth**: Required (admin only)

**Request**:
```json
{
  "status": "disabled"
}
```

**Response (200)**:
```json
{
  "message": "Room status updated",
  "room": {
    "id": 1,
    "status": "disabled"
  }
}
```
