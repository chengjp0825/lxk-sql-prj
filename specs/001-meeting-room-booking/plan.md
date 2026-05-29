# Implementation Plan: 九号楼会议室管理系统

**Branch**: `001-meeting-room-booking` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-meeting-room-booking/spec.md`

## Summary

构建九号楼会议室管理系统的完整实现计划。采用前后端分离架构，前端Vue 3 + Vite，后端Python + Flask + SQLite，遵循KISS原则实现会议室预约的核心功能。

## Technical Context

**Language/Version**: Python 3.11+, Node.js 18+

**Primary Dependencies**:
- Frontend: Vue 3.4+, Vite 5.x, Tailwind CSS 3.x, Vue Router 4.x
- Backend: Flask 3.x, PyJWT 2.x, SQLAlchemy 2.x, Flask-CORS

**Storage**: SQLite (.db 本地文件)

**Testing**: Manual testing + curl for API validation

**Target Platform**: Web browser (Chrome/Firefox/Safari)

**Project Type**: Full-stack Web Application

**Performance Goals**: 页面首屏加载 < 2s，API响应 < 500ms

**Constraints**:
- 遵循KISS原则，拒绝过度设计
- 半小时时间颗粒度
- 时间段Overlap防冲突逻辑必须可靠

**Scale/Scope**: 单栋楼宇，< 20间会议室，< 1000用户

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. KISS原则 | ✅ PASS | 前后端分离但极简，无过度抽象层 |
| II. 锁定的极简技术栈 | ✅ PASS | Vue3/Vite/Tailwind/Flask/SQLite/SQLAlchemy/PyJWT |
| III. 极简代码与架构规范 | ✅ PASS | 前端3层，后端2文件结构 |
| IV. 核心业务底线 | ✅ PASS | Overlap判定和半小时刻度轴为核心需求 |
| V. 完整可运行交付 | ✅ PASS | 禁止占位符代码，开箱即用 |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-meeting-room-booking/
├── plan.md              # This file
├── spec.md              # Feature specification
├── data-model.md        # Database schema & relationships
├── quickstart.md        # Setup & run instructions
└── contracts/           # API contracts
    └── booking-api.md   # Booking API contract
```

### Source Code (repository root)

```text
.                           # Repository root
├── frontend/               # Vue 3 frontend
│   ├── src/
│   │   ├── api/           # API request wrappers
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/        # Page views
│   │   ├── router/       # Vue Router config
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/               # Flask backend
│   ├── app.py            # Flask app + routes
│   ├── models.py         # SQLAlchemy models
│   ├── requirements.txt
│   └── instance/         # SQLite db location
│       └── meeting.db
└── SPEC.md               # This repository's spec
```

**Structure Decision**: 前后端分离在同一仓库，frontend/和backend/并行，各自独立运行。

---

## 1. 技术栈与核心依赖确认

### 前端依赖 (frontend/package.json)

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**说明**:
- 不使用Element Plus（仅在需要DatePicker/Dialog时可引入）
- 不使用Pinia/Vuex（使用ref/reactive足够）
- 不使用TypeScript（KISS原则）

### 后端依赖 (backend/requirements.txt)

```
Flask>=3.0.0
Flask-CORS>=4.0.0
PyJWT>=2.8.0
SQLAlchemy>=2.0.0
werkzeug>=3.0.0
```

**说明**:
- 不使用Flask-SQLAlchemy（直接使用原生SQLAlchemy更简洁）
- 不使用Blueprint（路由<20个不需要）
- 不使用复杂的JWT库（PyJWT足够）

---

## 2. 数据库模型与API路由表

### 数据模型 (backend/models.py)

```python
# User: 用户表
User:
  - id: Integer, PK
  - username: String(50), Unique, Not Null
  - password_hash: String(256), Not Null
  - role: String(20), Default='user' (user/admin)
  - created_at: DateTime

# Room: 会议室表
Room:
  - id: Integer, PK
  - name: String(100), Not Null
  - floor: String(10), Not Null  # e.g., "1F", "2F"
  - capacity: Integer, Not Null
  - status: String(20), Default='active' (active/disabled)
  - created_at: DateTime

# Booking: 预约表
Booking:
  - id: Integer, PK
  - room_id: Integer, FK(Room.id), Not Null
  - user_id: Integer, FK(User.id), Not Null
  - start_time: DateTime, Not Null
  - end_time: DateTime, Not Null
  - status: String(20), Default='pending' (pending/approved/rejected/cancelled)
  - created_at: DateTime
  - updated_at: DateTime
```

### API路由表

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | 用户注册 | No |
| POST | /api/auth/login | 用户登录 | No |
| GET | /api/rooms | 获取会议室列表（含当前状态） | Yes |
| GET | /api/rooms/:id/timeline | 获取会议室时间段占用情况 | Yes |
| POST | /api/bookings | 创建预约申请 | Yes |
| GET | /api/bookings/my | 获取当前用户预约记录 | Yes |
| DELETE | /api/bookings/:id | 取消自己的预约 | Yes |
| GET | /api/admin/bookings | 获取所有待审批申请 | Admin |
| PUT | /api/admin/bookings/:id/approve | 审批通过 | Admin |
| PUT | /api/admin/bookings/:id/reject | 审批驳回 | Admin |
| PUT | /api/admin/rooms/:id/status | 更新会议室状态 | Admin |

---

## 3. 分步执行里程碑

### Phase 1: 基础设施与鉴权闭环

**目标**: 后端跑通Flask+SQLite+JWT，前端跑通登录页面+Token存储+路由守卫

**产出**:
- backend/app.py - Flask初始化+JWT工具函数
- backend/models.py - User模型+数据库初始化
- backend/requirements.txt
- frontend/src/api/auth.js - 登录注册API封装
- frontend/src/views/Login.vue - 登录页面
- frontend/src/router/index.js - 路由守卫

**验证**:
1. `python backend/app.py` 启动无报错
2. `POST /api/auth/register` 能创建用户
3. `POST /api/auth/login` 能获取JWT token
4. `npm run dev` 前端启动无报错
5. 登录页输入正确账号能跳转到首页

**时间估计**: 2-3小时

---

### Phase 2: 空间资产调度与主视图

**目标**: 会议室CRUD + 楼层看板渲染

**产出**:
- backend/models.py - Room模型
- backend/app.py - Room路由
- frontend/src/views/Home.vue - 楼层会议室看板
- frontend/src/components/RoomCard.vue - 单个会议室卡片
- frontend/src/api/room.js - 会议室API封装

**验证**:
1. GET /api/rooms 返回会议室列表
2. 首页按楼层分组显示会议室卡片
3. 各房间显示正确的红/绿/灰状态色

**时间估计**: 2-3小时

---

### Phase 3: 核心预约引擎与时间轴

**目标**: 预约防冲突逻辑 + 可视化时间轴组件

**产出**:
- backend/models.py - Booking模型
- backend/app.py - Booking路由 + Overlap判定逻辑
- frontend/src/views/Booking.vue - 会议室预约页面
- frontend/src/components/Timeline.vue - 半小时颗粒度时间轴
- frontend/src/api/booking.js - 预约API封装

**核心业务逻辑 - Overlap判定**:

```python
# 判断新预约是否与已有预约重叠
def has_overlap(room_id, start_time, end_time, exclude_booking_id=None):
    query = Booking.query.filter(
        Booking.room_id == room_id,
        Booking.status.in_(['pending', 'approved']),
        # 重叠条件: 新开始时间 < 已有结束时间 AND 新结束时间 > 已有开始时间
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first() is not None
```

**验证**:
1. 选择空闲时间段能成功提交预约申请
2. 选择已占用时间段提交时被拒绝
3. 单次预约超过4小时被拒绝
4. 时间轴正确显示30分钟刻度

**时间估计**: 4-5小时

---

### Phase 4: 管理员工作台与个人中心

**目标**: 管理员审批流 + 用户预约管理

**产出**:
- backend/app.py - Admin路由
- frontend/src/views/Admin.vue - 管理员控制台
- frontend/src/views/MyBookings.vue - 我的预约页面
- frontend/src/components/BookingItem.vue - 预约记录项

**验证**:
1. 管理员能查看所有待审批申请
2. 管理员能一键通过/驳回申请
3. 用户能查看自己的预约列表
4. 用户能取消未开始的预约

**时间估计**: 3-4小时

---

## 4. 快速启动命令

### 后端启动

```bash
cd backend
pip install -r requirements.txt
python app.py
# 服务运行在 http://localhost:5000
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
# 服务运行在 http://localhost:5173
```

### 初始化测试数据

```bash
# 在后端目录执行
python -c "from app import init_db; init_db()"
```

---

## Complexity Tracking

无复杂度违规。所有设计均符合KISS原则。
