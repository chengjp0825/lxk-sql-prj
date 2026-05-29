# 九号楼会议室管理系统 Constitution

## Core Principles

### I. KISS原则 (Keep It Simple, Stupid)

**Rule**: 拒绝一切过度设计、拒绝复杂的企业级架构。首要目标是"以最少的代码让系统跑起来"。

**Rationale**: 过度设计导致维护成本高、迭代速度慢。简单即美。

---

### II. 锁定的极简技术栈

**Rule**: 必须严格遵循以下技术栈，禁止擅自引入其他技术：

- **前端**：Vue 3 + Vite + `<script setup>` (Composition API)
- **UI与样式**：Tailwind CSS为核心；仅在DatePicker、Dialog等复杂交互组件上使用Element Plus
- **后端**：Python + Flask，直接使用 `request.get_json()` 接收数据
- **数据库**：SQLite (`.db` 本地文件) + SQLAlchemy (ORM)，禁止裸写SQL字符串

**Rationale**: 锁定技术栈减少决策成本，避免技术栈蔓延。

---

### III. 极简代码与架构规范

**Rule**:

- **前端目录**：仅保留 `components`（复用组件）、`views`（页面）、`api`（请求封装）
- **后端结构**：`app.py`（初始化与路由）+ `models.py`（数据库模型），不搞Blueprint嵌套
- **状态管理**：优先使用 `ref` 和 `reactive`，除非跨页面状态极度复杂否则不引入Pinia
- **鉴权**：后端颁发基础JWT存于localStorage，每次请求Header携带，不搞RBAC

**Rationale**: 目录扁平化减少认知负荷，极简鉴权满足基本安全需求即可。

---

### IV. 核心业务底线 (NON-NEGOTIABLE)

**Rule**: 以下业务规则绝对不可省略或妥协：

1. **时间段冲突判定**：会议室预约接口必须实现严格的"时间段重叠(Overlap)"判定逻辑
2. **半小时刻度轴**：前端必须实现以"30分钟"为最小颗粒度的时间轴组件，直观展示会议室空闲/占用状态并支持过滤

**Rationale**: 这是系统的核心价值所在，冲突判定错误会导致会议室重复预约。

---

### V. 完整可运行交付

**Rule**:

- 严禁输出 `// ... existing code ...` 或 `// 此处省略业务逻辑` 等占位符
- 前端必须能通过 `npm run dev` 运行
- 后端必须能通过 `python app.py` 或 `flask run --debug` 直接启动
- 所有依赖必须声明，不得有缺失

**Rationale**: 交付物必须开箱即用，减少沟通成本和集成摩擦。

---

## Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend Framework | Vue 3 + Vite | 轻量、易学、生态好 |
| UI Styling | Tailwind CSS | 快速布局、原子化 |
| Complex Components | Element Plus | 仅用于DatePicker、Dialog等复杂交互 |
| Backend Framework | Python + Flask | 极简、足够灵活 |
| Database | SQLite | 零配置、适合中小型应用 |
| ORM | SQLAlchemy | 安全、防SQL注入 |
| Authentication | PyJWT | 轻量级Token鉴权 |

---

## Architecture Constraints

- 前端：`src/components/`、`src/views/`、`src/api/` 三层
- 后端：`app.py` + `models.py` 两文件结构
- 不引入Blueprint除非路由数量超过20个
- 不引入Pinia除非跨页面状态共享场景超过3个
- 不引入Redis/Memcached除非性能测量证明必要

---

## Development Workflow

1. **规格优先**：先写 `spec.md` 明确用户故事与验收标准
2. **最小实现**：以最少的代码让功能跑起来
3. **增量迭代**：功能可用后再逐步优化

---

## Governance

**Constitution Status**: This constitution supersedes all other development practices.

**Amendment Procedure**: 
- Any change to principles requires updating `CONSTITUTION_VERSION` with MAJOR.MINOR.PATCH bump
- MAJOR: Backward incompatible principle removals or redefinitions
- MINOR: New principle added or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes

**Compliance**:
- All feature implementations MUST verify compliance with this constitution
- Use `.specify/memory/constitution.md` for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-27
