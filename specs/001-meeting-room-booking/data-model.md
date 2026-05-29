# Data Model: 九号楼会议室管理系统

**Feature**: 001-meeting-room-booking
**Created**: 2026-05-27

## Entity Relationship

```
User (1) ----< (N) Booking
Room (1) ----< (N) Booking
```

## User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto-increment | 用户唯一标识 |
| username | String(50) | Unique, Not Null | 用户名 |
| password_hash | String(256) | Not Null | 密码哈希（werkzeug生成） |
| role | String(20) | Default='user' | 角色: user / admin |
| created_at | DateTime | Not Null | 创建时间 |

## Room

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto-increment | 会议室唯一标识 |
| name | String(100) | Not Null | 会议室名称 |
| floor | String(10) | Not Null | 楼层，如 "1F", "2F" |
| capacity | Integer | Not Null | 容纳人数 |
| status | String(20) | Default='active' | 状态: active / disabled |
| created_at | DateTime | Not Null | 创建时间 |

## Booking

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, Auto-increment | 预约唯一标识 |
| room_id | Integer | FK(Room.id), Not Null | 会议室ID |
| user_id | Integer | FK(User.id), Not Null | 申请人ID |
| start_time | DateTime | Not Null | 预约开始时间 |
| end_time | DateTime | Not Null | 预约结束时间 |
| status | String(20) | Default='pending' | 状态: pending / approved / rejected / cancelled |
| created_at | DateTime | Not Null | 创建时间 |
| updated_at | DateTime | Not Null | 更新时间 |

## Validation Rules

1. **预约时间段**:
   - 开始时间必须晚于当前时间 + 15分钟
   - 结束时间必须晚于开始时间
   - 单次预约时长不超过4小时
   - 运营时间范围: 08:00 - 22:00

2. **Overlap冲突检测**:
   - 同一会议室同一时间段不允许有两个approved/pending状态的预约
   - 检测逻辑: `(new_start < existing_end) AND (new_end > existing_start)`

3. **用户限制**:
   - 同一用户同一时间段只能持有1个有效预约
