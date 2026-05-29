# Tasks: 时间轴组件交互重构

**Input**: Design documents from `specs/002-timeline-two-click/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: None requested. Manual browser verification.

**Organization**: Tasks grouped by user story. All tasks touch the same file (`TimelineSlider.vue`) and must run sequentially.

---

## Phase 1: Cleanup

**Purpose**: Remove dead code before adding new logic

- [x] T001 [清理] 删除 `frontend/src/components/TimelineSlider.vue` 中未使用的变量 `const today` (L45) 和 `const rangeEnd` (L107)

---

## Phase 2: User Story 1 - 两次点击选择 (Priority: P1) 🎯 MVP

**Goal**: 用户通过两次点击精确选定预约起止时间

**Independent Test**: 点击 09:00 设起点 → 点击 10:30 确认为终点 → emit 正确数据

### Implementation

- [x] T002 [US1] 引入状态机变量 `selectionStep` (`'IDLE'` / `'SELECTING_END'`) 和 `startIndex`，替换 `selectedIndices` 数组，移除 `toggleSlot` 和 `validateSelection` 函数 in `frontend/src/components/TimelineSlider.vue`
- [x] T003 [US1] 实现 `onClick(index)` 两段式逻辑：IDLE 时设起点 → SELECTING_END 时执行碰撞+时长校验后确认选区并 emit in `frontend/src/components/TimelineSlider.vue`
- [x] T004 [US1] 实现第三次点击重置逻辑：IDLE 且已有 startIndex 时点击 → 清空旧选区并以新位置为起点 in `frontend/src/components/TimelineSlider.vue`

**Checkpoint**: 两次点击完成预约时段选择，第三次点击可重置

---

## Phase 3: User Story 2 - 悬停预览 (Priority: P1)

**Goal**: 鼠标移动时实时显示预览区间

**Independent Test**: 设起点后移动鼠标，预览区间即时高亮

### Implementation

- [x] T005 [US2] 新增 `hoverIndex` ref 和 `onMouseEnter(index)` 方法（仅在 SELECTING_END 时更新），模板中每个 slot 添加 `@mouseenter` 绑定 in `frontend/src/components/TimelineSlider.vue`
- [x] T006 [US2] 新增 `onMouseLeave` 方法清空 `hoverIndex`，在时间轴容器上绑定 `@mouseleave` in `frontend/src/components/TimelineSlider.vue`

**Checkpoint**: 悬停预览可见，鼠标移开后预览消失

---

## Phase 4: User Story 3 - 碰撞拦截 (Priority: P1)

**Goal**: 跨越已占用/pending 块的选择被前端阻断

**Independent Test**: 选择包含障碍块的区间 → 预览截断、点击拒绝

### Implementation

- [x] T007 [US3] 实现 `findObstacle(lo, hi)` 辅助函数：扫描区间内第一个 `status !== 'available'` 的索引，无则返回 -1 in `frontend/src/components/TimelineSlider.vue`
- [x] T008 [US3] 在悬停预览（`getSlotClass`）中调用 `findObstacle` 截断预览范围，在 `onClick` 确认时调用 `findObstacle` 阻断非法选择并显示错误提示 in `frontend/src/components/TimelineSlider.vue`

**Checkpoint**: 无法跨障碍选择，预览在障碍前自动截断

---

## Phase 5: User Story 4 - 状态颜色区分 (Priority: P2)

**Goal**: pending 块显示橙色，与 occupied（灰）和 available（绿）明确区分

**Independent Test**: 创建 pending 预约后时间轴显示橙色块

### Implementation

- [x] T009 [US4] 更新 `getSlotClass` 方法：新增 `pending` → `bg-orange-400`、`occupied` → `bg-gray-400`、`available` → `bg-green-500` 三种基础状态色，以及预览色（`bg-blue-300`）和确认色 in `frontend/src/components/TimelineSlider.vue`
- [x] T010 [US4] 更新 `backend/app.py` 中 `get_room_timeline` 函数 (L304-307)：将 `slot_status = 'occupied'` 改为根据 `booking.status` 区分 `'pending'` 和 `'occupied'`

**Checkpoint**: pending=橙色, occupied=灰色, available=绿色, 预览=浅蓝

---

## Phase 6: Polish

**Purpose**: 最终验证和收尾

- [x] T011 更新 `frontend/src/components/TimelineSlider.vue` 中 `selectedRange` 和 `duration` computed，基于 `startIndex`/`hoverIndex` 重新计算
- [ ] T012 完整验收：启动前后端，测试全部 4 条 User Story 的 acceptance scenarios，确认 `npm run dev` 无报错

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Cleanup)**: No dependencies
- **Phase 2 (US1)**: Depends on Phase 1 — core interaction logic
- **Phase 3 (US2)**: Depends on Phase 2 — needs state machine variables
- **Phase 4 (US3)**: Depends on Phase 2,3 — collision check used in both hover and click
- **Phase 5 (US4)**: Depends on Phase 3,4 — getSlotClass is the same function
- **Phase 6 (Polish)**: Depends on all previous phases

### Sequential Only

All frontend tasks modify the same file `TimelineSlider.vue` — **no parallel execution possible**. T010 (backend) can run at any point independently.

### Task Dependency Graph

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T011 → T012
                                                                    ↗ (any time)
                                                             T010 ↗
```

---

## Implementation Strategy

### Execution Order

1. T001: Clean dead code
2. T002-T004: US1 core (two-click state machine + onClick)
3. T005-T006: US2 (hover preview)
4. T007-T008: US3 (collision detection)
5. T009: US4 (status colors in UI)
6. T010: US4 (backend pending differentiation — can do anytime)
7. T011: Polish (computed cleanup)
8. T012: Final verification

### Verification at Each Phase

Each phase includes a **Checkpoint** — stop and manually verify before proceeding to the next phase. This ensures bugs are caught early in a single-file sequential refactor.

---

## File Paths Summary

```
frontend/src/components/TimelineSlider.vue  ← T001-T009, T011 (ALL frontend tasks)
backend/app.py                              ← T010 (single line change)
```
