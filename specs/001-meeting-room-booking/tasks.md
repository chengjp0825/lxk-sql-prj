# Tasks: 九号楼会议室管理系统

**Input**: Design documents from `specs/001-meeting-room-booking/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/booking-api.md, quickstart.md

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure: `backend/`, `backend/instance/`
- [x] T002 Create frontend directory structure: `frontend/src/api/`, `frontend/src/components/`, `frontend/src/views/`, `frontend/src/router/`
- [x] T003 [P] Create `backend/requirements.txt` with Flask, Flask-CORS, PyJWT, SQLAlchemy, werkzeug

---

## Phase 2: Foundational (Database & Core Backend)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `backend/models.py` with SQLAlchemy/SQLite connection and User model (id, username, password_hash, role)
- [x] T005 Create `backend/auth_utils.py` with werkzeug password hashing/verification and PyJWT token generation/parsing
- [x] T006 Create `backend/app.py` Flask app initialization with CORS and database initialization
- [x] T007 Implement `POST /api/auth/register` endpoint. **DoD**: Receives JSON via `request.get_json()`, writes to SQLite, returns 400 on duplicate username
- [x] T008 Implement `POST /api/auth/login` endpoint. **DoD**: Validates password, returns `{token, role}` JSON
- [x] T009 Create `@require_auth` decorator for protected endpoints (parse JWT from HTTP Header)
- [x] T010 Initialize frontend with Vite + Vue 3: run `npm create vite@latest frontend -- --template vue`
- [x] T011 Configure Tailwind CSS in frontend project
- [x] T012 [P] Configure Vue Router in `frontend/src/router/index.js` with routes: `/login`, `/dashboard`, `/admin`
- [x] T013 Create `frontend/src/api/index.js` with axios/fetch wrapper that auto-attaches JWT and handles 401 redirect
- [x] T014 Create `frontend/src/views/LoginView.vue`. **DoD**: Login stores token in localStorage, redirects to `/dashboard` or `/admin` based on role

**Checkpoint**: Backend API and frontend auth flow complete - user stories can begin

---

## Phase 3: User Story 1 - 空间雷达视图 (Priority: P1)

**Goal**: Users see floor-grouped meeting room dashboard with real-time status indicators

**Independent Test**: User opens homepage, immediately sees floor-grouped rooms with color-coded status without any interaction

### Backend Tasks (US1)

- [x] T015 Add Room model to `backend/models.py` (id, name, floor, capacity, is_active)
- [x] T016 Create `@require_admin` decorator extending `@require_auth` for admin-only endpoints
- [x] T017 Implement `GET /api/rooms` endpoint with optional `?floor=X` query parameter
- [x] T018 Implement `POST /api/admin/rooms` endpoint for creating rooms
- [x] T019 Implement `PUT /api/admin/rooms/<int:id>` endpoint for updating rooms
- [x] T020 Implement `PATCH /api/admin/rooms/<int:id>/status` endpoint to toggle is_active

### Frontend Tasks (US1)

- [x] T021 Create `frontend/src/views/UserDashboardView.vue` with layout: floor navigation sidebar + main content area
- [x] T022 Create `frontend/src/components/RoomCard.vue` component displaying room name, floor, capacity, and status color
- [x] T023 Create `frontend/src/components/RoomGrid.vue` using Tailwind CSS Grid to display rooms
- [x] T024 Connect `/api/rooms` to UserDashboardView, render rooms grouped by floor
- [x] T025 **DoD Verification**: `available` renders `bg-green-500`, `in_use` renders `bg-red-500`, `closed` renders `bg-gray-400`

**Checkpoint**: US1 complete - floor grid dashboard working

---

## Phase 4: User Story 2 - 可视化预约 (Priority: P1)

**Goal**: User selects a room and books time slots via 30-minute granularity timeline

**Independent Test**: User selects available room, picks time range on timeline, submits booking successfully

### Backend Tasks (US2)

- [x] T026 Add Booking model to `backend/models.py` (id, user_id, room_id, start_time, end_time, status: pending/approved/rejected)
- [x] T027 Implement `GET /api/rooms/<int:room_id>/timeline?date=YYYY-MM-DD` returning all valid bookings (excluding rejected/cancelled)
- [x] T028 Implement `POST /api/bookings` with Overlap Check algorithm:
  ```
  new_start < existing_end AND new_end > existing_start
  ```
  Returns 409 if conflict found. Also validates max 4-hour duration.
- [x] T029 Implement `GET /api/floors/<floor_id>/rooms-status` returning rooms with current_state (available/in_use/closed)

### Frontend Tasks (US2)

- [x] T030 Create `frontend/src/views/RoomDetailModal.vue` (popup when clicking available room card)
- [x] T031 Create `frontend/src/components/TimelineSlider.vue` - pure CSS/HTML, no chart libraries:
  - Generate 28 slots from 08:00 to 22:00, each 30 minutes
  - Map timeline data: occupied=gray, pending=orange, available=green
- [x] T032 Implement click/drag selection on TimelineSlider to pick start/end time (max 4 hours)
- [x] T033 Connect `POST /api/bookings` to RoomDetailModal, submit booking on confirmation
- [x] T034 **DoD Verification**: User selects time range on green blocks, submits successfully, timeline updates to show pending slot in orange

**Checkpoint**: US2 complete - core booking engine working

---

## Phase 5: User Story 3 - 管理员审批台 (Priority: P1)

**Goal**: Admin has control panel to approve/reject booking requests and manage room availability

**Independent Test**: Admin logs in, sees pending bookings list, approves one, sees status update

### Backend Tasks (US3)

- [x] T035 Implement `PATCH /api/admin/bookings/<int:id>/status` accepting `approved` or `rejected`
- [x] T036 Implement `GET /api/admin/bookings` returning all pending bookings with room and user details

### Frontend Tasks (US3)

- [x] T037 Create `frontend/src/views/AdminDashboardView.vue` with admin layout
- [x] T038 Create `frontend/src/components/BookingApprovalCard.vue` displaying pending booking with approve/reject buttons
- [x] T039 Connect admin endpoints, render pending bookings list
- [x] T040 **DoD Verification**: Admin clicks "approve" or "reject", booking status updates, UI reflects change

**Checkpoint**: US3 complete - admin approval flow working

---

## Phase 6: User Story 4 - 预约查询与取消 (Priority: P2)

**Goal**: User can view their bookings and cancel upcoming approved bookings

**Independent Test**: User navigates to "My Bookings", sees list, cancels one successfully

### Backend Tasks (US4)

- [x] T041 Implement `GET /api/bookings/my` returning current user's bookings with room details
- [x] T042 Implement `DELETE /api/bookings/<int:id>` - user can only cancel their own, only if status is pending or approved and not started

### Frontend Tasks (US4)

- [x] T043 Create `frontend/src/views/MyBookingsView.vue` displaying user's booking history
- [x] T044 Create `frontend/src/components/BookingItem.vue` with cancel button (visible only for cancelable bookings)
- [x] T045 Connect endpoints, render bookings list grouped by status
- [x] T046 **DoD Verification**: User sees their bookings, clicks cancel on eligible booking, booking removed from list

**Checkpoint**: US4 complete - user booking management working

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T047 Create `backend/instance/meeting.db` initialization with seed data (sample rooms)
- [x] T048 Update `frontend/src/App.vue` with navigation header and logout button
- [x] T049 Add `frontend/src/router/index.js` route guards to redirect unauthenticated users to /login
- [x] T050 Test full user journey: Register → Login → Book Room → Admin Approve → View My Booking → Cancel

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3-6 (User Stories)**: All depend on Phase 2
  - US1, US2, US3, US4 can proceed in parallel if staffing allows
- **Phase 7 (Polish)**: Depends on Phases 3-6

### User Story Dependencies

- **US1 (空间雷达)**: Can start after Phase 2 - No dependencies on other stories
- **US2 (可视化预约)**: Can start after Phase 2 - Can test independently after US1 backend complete
- **US3 (管理员审批)**: Can start after Phase 2 - Can test independently after US2 backend complete
- **US4 (预约查询)**: Can start after Phase 2 - Can test independently after US2 backend complete

### Within Each User Story

- Models before endpoints
- Backend before frontend integration
- Story complete before moving to next

### Parallel Opportunities

- T001, T002, T003 can run in parallel
- T010, T011, T012 can run in parallel
- Backend US1 tasks (T015-T020) can run in parallel with frontend US1 tasks (T021-T025) after T004-T009 complete
- All User Stories can proceed in parallel after Phase 2 complete

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 - 空间雷达视图
4. **STOP and VALIDATE**: Test floor dashboard independently
5. Complete Phase 4: US2 - 可视化预约
6. **STOP and VALIDATE**: Test booking flow independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 1 + Phase 2 → Foundation ready
2. Add US1 → Test independently → Deploy/Demo
3. Add US2 → Test independently → Deploy/Demo (core booking MVP!)
4. Add US3 → Test independently → Deploy/Demo
5. Add US4 → Test independently → Deploy/Demo

---

## File Paths Summary

### Backend

```
backend/
├── app.py              # Flask app + all routes
├── models.py           # SQLAlchemy models (User, Room, Booking)
├── auth_utils.py       # JWT + password utilities
├── requirements.txt    # Python dependencies
└── instance/
    └── meeting.db     # SQLite database (auto-created)
```

### Frontend

```
frontend/
├── src/
│   ├── api/
│   │   └── index.js       # Axios wrapper + interceptors
│   ├── components/
│   │   ├── RoomCard.vue
│   │   ├── RoomGrid.vue
│   │   ├── TimelineSlider.vue
│   │   ├── RoomDetailModal.vue
│   │   ├── BookingApprovalCard.vue
│   │   └── BookingItem.vue
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── UserDashboardView.vue
│   │   ├── AdminDashboardView.vue
│   │   └── MyBookingsView.vue
│   ├── router/
│   │   └── index.js       # Vue Router config
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Notes

- All tasks follow the checklist format: `- [x] [ID] [P?] [Story?] Description with file path`
- [P] = parallelizable (different files, no dependencies)
- [US1], [US2], [US3], [US4] = user story labels
- No user story label = setup or foundational phase
- DoD (Definition of Done) specified for key integration tasks
- **All 50 tasks completed on 2026-05-27**
