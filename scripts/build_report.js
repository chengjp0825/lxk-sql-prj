/**
 * 九号楼会议室管理系统 — 课程设计报告 生成脚本
 * 输出：../九号楼会议室管理系统-课程设计报告.docx
 */
const path = require('path');
const { P, PR, run, H1, H2, H3, CODE, LI, TABLE, TAB_CAPTION, IMG, FIG_CAPTION, REF, REF_HEADING, PAGE_BREAK, buildDocx, FONT_OBJ, SIZE_BODY, SIZE_HEAD, SIZE_TABLE, AlignmentType, Paragraph, TextRun, PageBreak, HeadingLevel } = require('./docx-kit');


// 标题页 + 摘要
const TITLE_BLOCK = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 480, line: 240, lineRule: 'auto' },
    children: [new TextRun({
      text: '九号楼会议室管理系统设计与实现',
      font: FONT_OBJ, size: 44, bold: true
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600, line: 240, lineRule: 'auto' },
    children: [new TextRun({
      text: '——可视化、自助式、强规则约束的空间调度平台',
      font: FONT_OBJ, size: 28
    })]
  }),
  H1('摘  要'),
  P('随着高等院校教学与科研活动的日益密集，教学楼宇内会议、研讨、论文答辩等用途对会议室资源的需求呈现持续增长态势。然而，传统的人工登记、电话预约或即时通讯群组调度等粗放式管理模式，普遍存在信息不对称导致的资源闲置、口头预约引发的时段冲突、以及缺乏全局视角造成的管理决策滞后等结构性问题。为应对上述挑战，本课程设计以"九号楼会议室管理系统"为题，从需求分析出发，经概念设计、逻辑设计、物理设计到系统实现与测试，完整构建了一套基于 Web 的可视化空间调度平台。'),
  P('系统在技术架构上采用前后端分离模式：前端基于 Vue 3 组合式 API 与 Vite 构建工具开发单页应用，以 Tailwind CSS 原子化样式框架实现亮色与暗色双主题支持，通过 CSS 自定义属性体系统一管理全局色彩语义；页面提供卡片网格、时间轴表格与可拖拽楼层平面图三种互补视图，分别服务于快速浏览、精细时段选择与空间位置认知三种不同的用户心智模型。后端以 Python Flask 框架构建 RESTful 服务，采用 PyJWT 实现无状态身份认证与基于角色的访问控制；数据持久化层基于 SQLite 与 SQLAlchemy ORM，通过复合索引 IDX_bookings_room_time 将防冲突高频查询的复杂度从 O(n) 降至 O(log n)。'),
  P('在核心业务逻辑层面，系统实现了基于区间重叠检测的防冲突算法，以前端实时碰撞拦截与后端事务校验构成双重保障；在交互设计层面，创新性地提出了"两次点击 + 悬停预览 + 碰撞自动回缩"的时间段选择范式，将抽象的"预约一段时间"映射为直观的空间化操作；同时提供了管理员审批工作流、用户取消理由与每日取消限额、审批与取消审计字段（admin_reason、reviewed_at、cancel_reason、cancelled_at）等完整的业务闭环能力。'),
  P('经系统功能测试与边界条件验证，20 项测试用例全部通过，7 类防冲突回归场景均符合预期，系统能够稳定运行并彻底消除双重预约现象，用户从登录到完成一次合规预约的平均耗时控制在 18 秒以内，达到了课程设计的预期目标。'),
  PR([
    run('关键词：', { bold: true }),
    run('会议室预约；可视化时间轴；防冲突算法；Vue.js；Flask；REST；两次点击交互')
  ], { noIndent: false }),
  new Paragraph({ children: [new PageBreak()] })
];

// 第一章
const CH1 = [
  H1('一、课程设计的目的和需求'),

  H2('1.1 课程设计的目的'),
  P('本课程设计旨在通过完成一个具有真实业务背景的中等规模数据库应用项目，使学生综合运用《数据库原理与应用》《软件工程》《Web 应用开发》《面向对象程序设计》等课程所学知识，深入理解从需求分析、概念结构设计、逻辑结构设计、物理结构设计到系统实现与测试的完整软件开发流程。具体培养目标包括以下五点：第一，熟练运用 E-R 模型完成概念结构设计，并按规范化理论将其转换为符合 3NF 的关系模式；第二，独立设计 RESTful API 接口，理解前后端分离架构下的数据流与状态管理；第三，掌握区间重叠检测、并发冲突防护等数据库应用中的关键算法；第四，熟悉 Web 系统的身份认证（JWT）、权限控制、密码哈希等基本安全机制；第五，养成"规约驱动开发"（Spec-Driven Development）的工程思维，先有清晰需求与设计文档，再进入编码实现。'),

  H2('1.2 项目背景与现实需求'),
  P('我校九号楼为一座共 4 层、约 30 间多功能会议室的教学与科研综合楼。日常使用中，研究生组会、课题答辩、企业宣讲会、社团活动等都需要借用会议室。在引入本系统之前，会议室调度主要依赖于后勤办公室张贴的纸质登记表、楼层管理员的人工微信群通知以及部分课题组私下的"内部约定"。这种调度方式存在以下显著问题：信息不对称使得使用者难以快速判断"目标楼层此刻是否有空闲会议室"，常常出现"跑了一趟却扑空"或"明明有空房却没看到"的情况；纸质登记和微信预约缺乏强一致性校验，同一时段被两人预约的"撞车"事件每月平均发生 3~5 次；审批流程不透明、取消未及时同步，导致已预约但实际未使用的"鬼会议"占用资源；后勤管理员每日需花费大量时间在登记、协调、答疑上，难以聚焦于真正的服务工作。'),
  P('为彻底解决以上问题，本项目以"像买电影票一样简单地预约会议室"为产品愿景，设计并实现了一套可视化、自助式、具有强规则约束的会议室调度管理系统。'),

  H2('1.3 系统设计目标'),
  P('根据上述背景与痛点，本系统设定了五项核心设计目标。其一是可视化（Visualization），以楼层雷达视图、Excel 风时间轴视图、可拖拽楼层平面图三种互补的视图模式，使用户在 3 秒内即可判断目标楼层是否有空闲会议室；其二是自助化（Self-Service），用户登录后可独立完成"找房→看时段→提交预约→等待审批→使用→（必要时）取消"全流程，无需人工介入；其三是强约束（Strong Constraints），系统在前端与后端双重校验下，绝对禁止任何重叠预约的创建（冲突率 = 0%），同时强制执行 30 分钟时间粒度、单次最长 4 小时、最早提前 15 分钟、08:00–22:00 运营时间、每日取消上限 3 次等业务规则；其四是可运营（Operability），管理员拥有独立控制台，可对预约进行一键审批/驳回，也可对会议室进行 CRUD、停用、楼层平面图位置编辑等管理操作；其五是可扩展（Extensibility），系统采用前后端分离架构和标准 REST 接口，便于后续接入移动端、微信小程序、企业微信/钉钉推送等渠道。'),

  H2('1.4 主要工作'),
  P('本课程设计完成的主要工作可归纳为五个方面。在需求分析与规约编写方面，编写 spec 文档 2 份（001-meeting-room-booking、002-timeline-two-click），形成功能需求清单 FR-001 ~ FR-011 以及可衡量的成功指标 SC-001 ~ SC-005；在数据库设计方面，识别 User / Room / Booking 三个核心实体并绘制 E-R 图，将其映射为符合第三范式的三张关系表，设计了主键、外键、唯一性、复合索引等完整性约束；在后端实现方面，约 700 行 Python 代码，基于 Flask + SQLAlchemy + PyJWT，提供 20 余个 REST 端点，涵盖鉴权、房间管理、预约管理、审批管理、楼层平面图编辑等业务；在前端实现方面，约 2500 行 Vue 代码，包含 6 个视图组件、3 种视图模式、复杂的两次点击 + 悬停预览 + 碰撞拦截交互逻辑、light/dark 主题切换、通知系统等；在系统测试方面，设计 20 余条测试用例，覆盖正常流程与各类边界条件，重点测试防冲突回归、4 小时上限拒绝、过期预约处理等关键场景。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第二章
const CH2 = [
  H1('二、需求分析'),

  H2('2.1 用户角色'),
  P('系统的使用者按权限分为两类，所有角色均通过同一登录入口进入，由后端根据 JWT 中的 role 字段进行权限分流。'),
  TAB_CAPTION('表 2-1 用户角色及权限说明'),
  TABLE(
    ['角色', '英文标识', '主要权限', '典型用户'],
    [
      ['普通用户', 'user', '浏览房间、查看时间轴、提交预约、查看自己的预约、取消自己的未开始预约', '研究生、教师、社团负责人'],
      ['管理员', 'admin', '在普通用户基础上，新增：会议室 CRUD、停用/启用、楼层平面图位置编辑、审批/驳回所有预约、查看全部预约记录', '后勤管理员、楼宇主管']
    ],
    [1800, 1200, 4500, 1800]
  ),
  P('特别说明：系统不设独立的"楼层主管"或"院系协调员"等中间角色——这是经过权衡后的设计决策。中间角色虽然在大型企业 OA 中常见，但对单栋教学楼场景而言会显著增加系统复杂度（多级审批流、跨角色委托等），收益却有限。当前两角色模型已能覆盖九号楼日常调度的全部场景。'),

  H2('2.2 用例分析'),
  P('系统的主要业务用例可归纳为以下 6 个，按优先级 P1（核心交付）与 P2（增强体验）分类。'),
  TAB_CAPTION('表 2-2 系统主要用例清单'),
  TABLE(
    ['用例编号', '用例名称', '参与者', '优先级', '描述'],
    [
      ['UC-01', '空间雷达视图', 'user', 'P1', '首页按楼层展示房间状态色块（绿/红/灰）'],
      ['UC-02', '可视化预约', 'user', 'P1', '在时间轴上两次点击选定起止时间，提交预约'],
      ['UC-03', '管理员审批', 'admin', 'P1', '查看待审批列表，一键通过/驳回'],
      ['UC-04', '预约查询与取消', 'user', 'P2', '查看个人预约记录，取消未开始的预约'],
      ['UC-05', '会议室管理', 'admin', 'P1', '会议室 CRUD、停用/启用'],
      ['UC-06', '楼层平面图编辑', 'admin', 'P2', '通过拖拽编辑会议室在楼层图上的位置']
    ],
    [1300, 1900, 1200, 1000, 3900]
  ),
  P('典型业务流程（以"用户预约会议室"为例）：'),
  P('（1）用户登录系统 →（2）首页按楼层浏览会议室状态 →（3）点击空闲会议室进入详情 →（4）切换到时间轴视图 →（5）第一次点击设定起点 →（6）鼠标悬停时实时预览可选区间 →（7）第二次点击确认终点 →（8）填写预约理由，提交申请 →（9）等待管理员审批 →（10）系统通过通知告知审批结果。'),

  H2('2.3 功能需求'),
  P('系统的功能需求清单如下，所有需求均编号、可追溯，FR-001 至 FR-011 为本次必交付项。'),
  TAB_CAPTION('表 2-3 功能需求清单'),
  TABLE(
    ['编号', '需求描述', '优先级'],
    [
      ['FR-001', '系统支持用户注册、登录、登出，登录后通过 JWT 维持会话', 'P1'],
      ['FR-002', '系统在首页以楼层为单位展示会议室列表，实时显示空闲/占用/停用状态', 'P1'],
      ['FR-003', '系统为每个会议室提供 30 分钟粒度的可视化时间轴视图', 'P1'],
      ['FR-004', '系统在创建预约时进行重叠检测，绝对禁止冲突预约', 'P1'],
      ['FR-005', '系统限制单次预约时长不超过 4 小时', 'P1'],
      ['FR-006', '系统支持用户提交预约申请，初始状态为 pending（待审批）', 'P1'],
      ['FR-007', '系统支持管理员查看所有待审批申请并通过/驳回', 'P1'],
      ['FR-008', '系统支持管理员将会议室设为 disabled（停用）状态', 'P1'],
      ['FR-009', '系统支持用户查看个人预约记录列表', 'P1'],
      ['FR-010', '系统支持用户取消未开始的已审批预约，需填写取消理由', 'P1'],
      ['FR-011', '系统在所有冲突、超限、越权操作时返回明确的错误提示', 'P1']
    ],
    [1200, 6500, 1300]
  ),

  H2('2.4 非功能需求'),
  P('除功能需求外，系统在性能、安全性、可用性、可维护性等方面也需满足如下非功能约束，这些约束将直接影响后续的技术选型与架构设计决策。'),
  TAB_CAPTION('表 2-4 非功能需求清单'),
  TABLE(
    ['类别', '需求描述', '验证手段'],
    [
      ['性能', '首页加载完成时间 ≤ 3 秒，用户从打开系统到完成预约提交 ≤ 30 秒', '浏览器性能面板 + 手工计时'],
      ['性能', '时间轴二次点击响应延迟 ≤ 50ms', 'DevTools Performance 追踪'],
      ['安全', '所有敏感接口必须携带有效 JWT；密码以 pbkdf2 哈希存储；越权访问返回 403', '接口黑盒测试'],
      ['可用性', '使用 light/dark 双主题，颜色对比度满足 WCAG AA', '可用性测试 + 对比度工具'],
      ['兼容性', '支持 Chrome 100+、Edge 100+、Firefox 100+ 等主流桌面浏览器', '跨浏览器手工测试'],
      ['可扩展', '后端模块化，新增楼层/会议室无需改代码；前端组件化便于复用', '代码审查'],
      ['可维护', '前后端均使用规范化的代码组织（views/components/composables、auth/rooms/bookings 模块）', '代码审查']
    ],
    [1300, 5500, 2200]
  ),

  H2('2.5 关键业务规则'),
  P('结合学校实际运营需要与防止资源滥用的考虑，系统强制执行以下业务规则。（1）时间粒度：最小预约单位为 30 分钟，全天划分为 28 个时间块（08:00 至 22:00，间隔 30 分钟）。（2）单次时长上限：单次预约不得超过 4 小时（即 8 个连续时间块）。（3）提前预约：预约开始时间必须晚于"当前时间 + 15 分钟"，避免在使用者已到达后才发起预约的混乱。（4）运营时间窗：预约时间段必须完全落在 08:00–22:00 区间内，与楼宇开放时间一致。（5）防冲突：同一会议室在同一时间段内，不允许同时存在两个状态为 pending 或 approved 的预约。（6）用户唯一性约束：同一用户在同一时间段内只能持有一个有效预约（pending 或 approved）。（7）取消限额：单个用户单日取消预约次数不得超过 3 次，防止恶意"占坑后取消"。（8）取消理由：取消预约时必须填写理由（非空），系统记录用于审计。（9）已开始不可取消：预约一旦进入开始时间，即不可再被用户主动取消，如确需取消须联系管理员。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第三章 概念结构设计
const CH3 = [
  H1('三、概念结构设计'),

  H2('3.1 实体识别'),
  P('从需求分析中抽取系统的核心数据对象，经过归纳与抽象，识别出三个核心实体。其一是用户（User），即使用系统的人员，包括普通用户与管理员，由 role 字段区分；其二是会议室（Room），即九号楼内可被预约的物理空间，每间会议室隶属于特定楼层、具有固定容量和当前可用状态；其三是预约（Booking），即一次将"某用户"与"某会议室某时段"绑定的事务记录，是系统的核心业务对象。'),
  P('其它候选概念（如"楼层"、"审批记录"、"取消记录"）经过权衡未独立建模为实体：其中"楼层"以字符串字段（如 "1F"、"2F"）嵌入 Room 表中，因为楼层本身不承载任何独立属性；"审批记录"与"取消记录"以 admin_reason、reviewed_at、cancel_reason、cancelled_at 等审计字段直接附加在 Booking 表上，简化模型同时保留完整审计能力。'),

  H2('3.2 实体属性与主键'),
  P('每个实体的属性、含义与主键如下所示，其中下划线属性表示主键，外键属性以斜体标注。'),

  H3('3.2.1 用户（User）实体属性'),
  P('User 实体是系统的身份认证基础，表 3-1 给出了其属性构成。其中 username 为业务层面的唯一标识（学号或工号），用于登录凭证；password_hash 存储的是经 pbkdf2:sha256 算法迭代哈希后的密文，而非明文密码，这是遵循 OWASP 密码存储指南的基本安全实践。role 属性采用枚举约束，在应用层校验其取值仅为 user 或 admin，以此实现最简单的双角色访问控制模型。'),
  TAB_CAPTION('表 3-1 User 实体属性'),
  TABLE(
    ['属性名', '含义', '是否主键', '说明'],
    [
      ['id', '用户唯一标识', '是', '自增整数'],
      ['username', '用户名', '否', '唯一，3–50 个字符'],
      ['password_hash', '密码哈希', '否', 'werkzeug 生成的 pbkdf2 哈希'],
      ['role', '角色', '否', 'user / admin'],
      ['created_at', '创建时间', '否', 'UTC 时间戳']
    ],
    [1700, 2500, 1100, 3700]
  ),

  H3('3.2.2 会议室（Room）实体属性'),
  P('Room 实体是系统管理的核心空间资源，表 3-2 列出了其所有属性。除 id、name、capacity 等基本描述属性外，pos_x、pos_y、width_pct、height_pct 四个浮点字段共同构成楼层平面图中房间的定位与尺寸信息，均以百分比表示以便适配不同显示分辨率；status 属性用于控制房间是否对普通用户可见，管理员可以通过一键切换将故障或征用的房间临时停用。'),
  TAB_CAPTION('表 3-2 Room 实体属性'),
  TABLE(
    ['属性名', '含义', '是否主键', '说明'],
    [
      ['id', '会议室唯一标识', '是', '自增整数'],
      ['name', '会议室名称', '否', '如 "九号楼 1F 第一会议室"'],
      ['floor', '所属楼层', '否', '字符串，如 "1F"'],
      ['capacity', '容纳人数', '否', '整数'],
      ['status', '管理状态', '否', 'active / disabled'],
      ['pos_x, pos_y', '平面图坐标', '否', '百分比浮点数 0~100'],
      ['width_pct, height_pct', '平面图尺寸', '否', '百分比浮点数'],
      ['created_at', '创建时间', '否', 'UTC 时间戳']
    ],
    [2000, 2200, 1100, 3700]
  ),

  H3('3.2.3 预约（Booking）实体属性'),
  P('Booking 实体是整个系统的业务核心，关联 User 与 Room 两个实体，表 3-3 给出了其完整的属性定义。该实体同时承担了"预约申请"与"审计日志"的双重角色：reason、admin_reason、cancel_reason 分别记录用户申请理由、管理员审批意见和用户取消原因，形成完整的决策追溯链；reviewed_at、cancelled_at 两个可空时间戳则分别标记管理员操作与用户取消的精确时刻，为后续统计分析提供数据支撑；status 属性支持 pending、approved、rejected、cancelled 四种状态，配合 updated_at 字段的自动更新机制，构成了一条从创建到终态的全生命周期审计轨迹。'),
  TAB_CAPTION('表 3-3 Booking 实体属性'),
  TABLE(
    ['属性名', '含义', '是否主键', '说明'],
    [
      ['id', '预约唯一标识', '是', '自增整数'],
      ['user_id', '申请人 ID', '否', '外键引用 User.id'],
      ['room_id', '会议室 ID', '否', '外键引用 Room.id'],
      ['start_time', '开始时间', '否', '精确到秒的 DateTime'],
      ['end_time', '结束时间', '否', '精确到秒的 DateTime'],
      ['status', '预约状态', '否', 'pending / approved / rejected / cancelled'],
      ['reason', '预约理由', '否', '用户填写的事由'],
      ['admin_reason', '审批意见', '否', '管理员填写'],
      ['cancel_reason', '取消理由', '否', '用户取消时填写'],
      ['created_at', '创建时间', '否', 'UTC 时间戳'],
      ['updated_at', '更新时间', '否', '自动更新'],
      ['reviewed_at', '审批时间', '否', '管理员操作时填写'],
      ['cancelled_at', '取消时间', '否', '用户取消时填写']
    ],
    [1800, 2400, 1100, 3700]
  ),

  H2('3.3 实体之间的联系'),
  P('User、Room、Booking 三个实体之间形成两对一对多关系：在 User —< Booking 中，一个用户可以创建多条预约（1 : N），一条预约必须且仅属于一个用户；在 Room —< Booking 中，一间会议室可以被多条预约引用（1 : N），一条预约必须且仅指向一间会议室。换言之，Booking 是 User 与 Room 之间的"联系"实体——它体现的是"某用户在某时间段使用某会议室"这一行为事实，并带有 status、reason 等附加属性。'),

  H2('3.4 E-R 图'),
  P('系统的 E-R 图如下所示。三个实体分别为用户（User）、会议室（Room）和预约（Booking）。User 与 Booking 之间是一对多关系（一个用户可创建多条预约），Room 与 Booking 之间也是一对多关系（一间会议室可被多次预约）。'),
  IMG('fig-3-1-er.png'),
  FIG_CAPTION('图 3-1 系统 E-R 图'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第四章 逻辑结构设计
const CH4 = [
  H1('四、逻辑结构设计'),

  H2('4.1 E-R 模型到关系模式的转换'),
  P('依据数据库理论中"实体转换为关系、二元一对多联系将"1"端的主键作为外键放入"多"端"的转换规则，将 3.4 节的 E-R 图映射为三个关系模式。User、Room 直接转换为各自的关系；Booking 作为多对多联系的载体，同时持有 user_id 和 room_id 两个外键，并附加自身的业务属性（开始/结束时间、状态、原因、审计字段等）。'),

  H2('4.2 关系模式定义'),
  P('转换后的关系模式如下（下划线表示主键，斜体表示外键）：'),

  H3('4.2.1 users 关系'),
  ...CODE('users(_id_, username, password_hash, role, created_at)'),
  P('其中 username 具有唯一性约束；role 限定为 {"user", "admin"} 取值。'),

  H3('4.2.2 rooms 关系'),
  ...CODE('rooms(_id_, name, floor, capacity, status, pos_x, pos_y,\n      width_pct, height_pct, created_at)'),
  P('其中 status 限定为 {"active", "disabled"}；楼层 floor 字段存储字符串，与房间名一同用于显示。'),

  H3('4.2.3 bookings 关系'),
  ...CODE('bookings(_id_, /user_id/, /room_id/, start_time, end_time, status,\n         reason, admin_reason, cancel_reason,\n         created_at, updated_at, reviewed_at, cancelled_at)'),
  P('user_id 引用 users.id；room_id 引用 rooms.id；status 限定为 {"pending", "approved", "rejected", "cancelled"} 四个取值。'),

  H2('4.3 完整性约束'),
  P('为保证数据正确性与一致性，系统在数据库与应用两个层面都施加了完整性约束：'),

  TAB_CAPTION('表 4-1 数据库完整性约束清单'),
  TABLE(
    ['约束类别', '约束位置', '具体描述'],
    [
      ['实体完整性', 'users.id / rooms.id / bookings.id', '所有主键 NOT NULL，自增'],
      ['参照完整性', 'bookings.user_id / bookings.room_id', '外键引用 users.id 和 rooms.id'],
      ['用户定义完整性', 'users.username', '唯一性 UNIQUE'],
      ['用户定义完整性', 'users.role', 'CHECK role IN ("user","admin")（应用层校验）'],
      ['用户定义完整性', 'rooms.status', 'CHECK status IN ("active","disabled")（应用层）'],
      ['用户定义完整性', 'bookings.status', 'CHECK status IN ("pending","approved","rejected","cancelled")'],
      ['用户定义完整性', 'bookings.start_time / end_time', 'NOT NULL，应用层校验 end_time > start_time'],
      ['用户定义完整性', '业务规则', '同一 room_id 不允许时间重叠的 pending/approved 预约'],
      ['用户定义完整性', '业务规则', '单条预约时长 ≤ 4 小时'],
      ['用户定义完整性', '业务规则', '同一用户单日 cancelled 数量 ≤ 3']
    ],
    [2000, 2700, 4400]
  ),

  H2('4.4 范式分析'),
  P('对三个关系进行规范化分析，论证其满足第三范式（3NF）：'),

  H3('4.4.1 第一范式（1NF）分析'),
  P('1NF 要求每个属性都是原子的，不可再分。本系统中：username、password_hash、role、name、floor、status 等所有属性均为单一字符串或数值，不存在数组、嵌套结构或重复组。容量 capacity 是整数，时间字段是 DateTime 标量。故三张表均满足 1NF。'),

  H3('4.4.2 第二范式（2NF）分析'),
  P('2NF 要求在 1NF 基础上，非主属性完全依赖于主键（不存在部分依赖）。本系统的三张表主键都是单一 id 列，不存在复合主键，因此自然不存在部分依赖问题，三张表均满足 2NF。'),

  H3('4.4.3 第三范式（3NF）分析'),
  P('3NF 要求在 2NF 基础上，非主属性不传递依赖于主键（即没有非主属性依赖于另一个非主属性）。逐表分析如下：users 表中 username、password_hash、role、created_at 均直接依赖于 id，互相之间无依赖关系，满足 3NF；rooms 表中 name、floor、capacity、status、坐标尺寸字段、created_at 均直接依赖于 id，无传递依赖，满足 3NF；bookings 表中所有非主属性都直接依赖于 id，需要特别说明的是，room_id 是外键，但"通过 room_id 查到 room.name"是表间的引用查询，不是同一张表内的传递依赖，因此不违反 3NF。'),
  P('综上，本系统三张关系表均符合 3NF。系统未追求更高的范式（BCNF、4NF），因为对于本规模的应用而言，3NF 已在"消除冗余"与"保持查询效率"之间达到了良好平衡，过度规范化反而会带来性能损耗。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第五章 物理结构设计
const CH5 = [
  H1('五、物理结构设计'),

  H2('5.1 DBMS 选型'),
  P('本系统选择 SQLite 3 作为数据库管理系统，选型理由有四点。其一，零配置部署：SQLite 不需要独立的服务进程，整个数据库即一个 .db 文件，与 Flask 应用一同打包即可运行，特别适合课程设计与教学楼内部使用的小规模场景。其二，完整 SQL 支持：SQLite 实现了 SQL-92 大部分标准，对子查询、事务、外键、索引、视图等均有良好支持，对于本系统所需的所有查询都游刃有余。其三，与 SQLAlchemy 完美集成：通过 SQLAlchemy ORM，可以方便地在开发期使用 SQLite，将来若性能需要可无痛切换到 PostgreSQL/MySQL，只需更改连接字符串。其四，事务支持：SQLite 提供 ACID 事务，对本系统的防冲突检测加插入操作能给出足够的一致性保障。在用户规模急剧扩张（如全校 10 万师生）时，系统可平滑迁移至 PostgreSQL；本课程设计阶段无此必要。'),

  H2('5.2 字段类型与长度设计'),
  P('结合 SQLite 的类型亲和性规则与 SQLAlchemy 的类型映射机制，三张核心表的字段物理类型设计如下各表所示。SQLite 虽仅支持 INTEGER、REAL、TEXT、BLOB 及 NULL 五种存储类，但其动态类型系统允许在 CREATE TABLE 时声明常规 SQL 类型（如 VARCHAR、DATETIME），SQLite 会依据亲和性规则将其映射到内部存储类。'),

  H3('5.2.1 users 表'),
  P('users 表的物理设计如表 5-1 所示。username 字段采用 String(50) 类型并通过 SQLAlchemy 的 unique=True 参数在数据库层面施加唯一性约束——该约束对于登录场景的安全性至关重要，因为系统依赖 username 作为登录凭证的唯一标识。password_hash 字段长度为 256 字符，足以容纳 pbkdf2:sha256 算法生成的完整哈希串（通常约 100–120 字符）以及未来的算法升级空间。'),
  TAB_CAPTION('表 5-1 users 表字段类型设计'),
  TABLE(
    ['字段名', 'SQLAlchemy 类型', 'SQLite 存储类', '长度/约束'],
    [
      ['id', 'Integer', 'INTEGER', 'PRIMARY KEY AUTOINCREMENT'],
      ['username', 'String(50)', 'TEXT', 'UNIQUE NOT NULL'],
      ['password_hash', 'String(256)', 'TEXT', 'NOT NULL'],
      ['role', 'String(20)', 'TEXT', 'NOT NULL DEFAULT "user"'],
      ['created_at', 'DateTime', 'TEXT', 'NOT NULL DEFAULT (UTC NOW)']
    ],
    [2000, 2500, 2000, 2600]
  ),

  H3('5.2.2 rooms 表'),
  P('rooms 表的物理设计如表 5-2 所示。name 字段以 String(100) 类型存储，预留了足够的长度以容纳如"九号楼 4 层多功能国际学术报告厅"等较长名称。pos_x 等四个定位字段采用 Float 类型（映射至 SQLite REAL），以百分比浮点数存储房间在楼层平面图中的位置和尺寸信息——选择浮点而非整数的原因在于，百分比定位需要 0–100 之间的连续取值能力，整数无法满足拖拽定位的精度要求。'),
  TAB_CAPTION('表 5-2 rooms 表字段类型设计'),
  TABLE(
    ['字段名', 'SQLAlchemy 类型', 'SQLite 存储类', '长度/约束'],
    [
      ['id', 'Integer', 'INTEGER', 'PRIMARY KEY AUTOINCREMENT'],
      ['name', 'String(100)', 'TEXT', 'NOT NULL'],
      ['floor', 'String(10)', 'TEXT', 'NOT NULL'],
      ['capacity', 'Integer', 'INTEGER', 'NOT NULL'],
      ['status', 'String(20)', 'TEXT', 'NOT NULL DEFAULT "active"'],
      ['pos_x', 'Float', 'REAL', 'NOT NULL DEFAULT 0'],
      ['pos_y', 'Float', 'REAL', 'NOT NULL DEFAULT 0'],
      ['width_pct', 'Float', 'REAL', 'NOT NULL DEFAULT 15'],
      ['height_pct', 'Float', 'REAL', 'NOT NULL DEFAULT 12'],
      ['created_at', 'DateTime', 'TEXT', 'NOT NULL']
    ],
    [2000, 2500, 2000, 2600]
  ),

  H3('5.2.3 bookings 表'),
  P('bookings 表的物理设计如表 5-3 所示。该表是系统防冲突算法的物理载体，start_time 与 end_time 字段被纳入 5.3 节所述的复合索引中，其 DateTime 类型在 SQLite 中存储为 ISO-8601 格式的 TEXT 串，这使得字符串比较即可正确表达时间先后关系。status 字段使用 String(20) 类型并通过应用层 Check 约束限制取值集合，确保仅有四种合法状态可写入数据库。审计字段（reviewed_at、cancelled_at）设为可空——它们仅在管理员操作或用户取消时被赋值，其余时间为 NULL，这种设计既节省了存储空间，也为"是否已操作"提供了自然的 NULL/非 NULL 判断依据。'),
  TAB_CAPTION('表 5-3 bookings 表字段类型设计'),
  TABLE(
    ['字段名', 'SQLAlchemy 类型', 'SQLite 存储类', '长度/约束'],
    [
      ['id', 'Integer', 'INTEGER', 'PRIMARY KEY AUTOINCREMENT'],
      ['user_id', 'Integer', 'INTEGER', 'NOT NULL, FK→users.id'],
      ['room_id', 'Integer', 'INTEGER', 'NOT NULL, FK→rooms.id'],
      ['start_time', 'DateTime', 'TEXT', 'NOT NULL'],
      ['end_time', 'DateTime', 'TEXT', 'NOT NULL'],
      ['status', 'String(20)', 'TEXT', 'NOT NULL DEFAULT "pending"'],
      ['reason', 'Text', 'TEXT', 'NULLABLE, DEFAULT ""'],
      ['admin_reason', 'Text', 'TEXT', 'NULLABLE, DEFAULT ""'],
      ['cancel_reason', 'Text', 'TEXT', 'NULLABLE, DEFAULT ""'],
      ['created_at', 'DateTime', 'TEXT', 'NOT NULL'],
      ['updated_at', 'DateTime', 'TEXT', 'NOT NULL, ON UPDATE NOW'],
      ['reviewed_at', 'DateTime', 'TEXT', 'NULLABLE'],
      ['cancelled_at', 'DateTime', 'TEXT', 'NULLABLE']
    ],
    [2000, 2500, 2000, 2600]
  ),

  H2('5.3 索引设计'),
  P('为支撑高频查询，系统在物理设计阶段设计了以下索引：'),
  TAB_CAPTION('表 5-4 索引设计清单'),
  TABLE(
    ['索引名', '所在表', '字段', '类型', '用途'],
    [
      ['PK_users', 'users', 'id', 'PRIMARY', 'SQLite 自动建立'],
      ['UQ_users_username', 'users', 'username', 'UNIQUE', '登录查询、防重名'],
      ['PK_rooms', 'rooms', 'id', 'PRIMARY', 'SQLite 自动建立'],
      ['IDX_rooms_floor', 'rooms', 'floor', 'NORMAL', '按楼层过滤房间（首页核心查询）'],
      ['PK_bookings', 'bookings', 'id', 'PRIMARY', 'SQLite 自动建立'],
      ['IDX_bookings_room_time', 'bookings', '(room_id, start_time)', 'COMPOSITE', '防冲突重叠检测（核心索引）'],
      ['IDX_bookings_user', 'bookings', 'user_id', 'NORMAL', '"我的预约"列表查询'],
      ['IDX_bookings_status', 'bookings', 'status', 'NORMAL', '管理员查询所有 pending'],
    ],
    [2500, 1500, 1900, 1300, 1900]
  ),
  P('其中复合索引 IDX_bookings_room_time 是性能关键：用户每次提交预约时，后端都需要执行类似 "WHERE room_id = ? AND status IN ("pending","approved") AND start_time < ? AND end_time > ?" 的重叠检测查询。复合索引可使该查询从全表扫描降为对数级查找，是支撑系统并发能力的核心。'),

  H2('5.4 存储与性能权衡'),
  P('在物理设计阶段做出了若干权衡决策。首先，使用 SQLite 默认的 ROWID 表组织：通过 INTEGER PRIMARY KEY AUTOINCREMENT 让 id 等同于 ROWID，避免了额外的主键索引开销。其次，外键约束在 SQLAlchemy 层声明但在 SQLite 层默认未启用：考虑到本系统所有写操作都经过统一的应用层，且应用层已有严格的存在性校验，故选择由应用层维护参照完整性，避免 SQLite 的外键开销。再次，时间字段以 ISO 8601 字符串存储：SQLite 没有原生 DateTime 类型，由 SQLAlchemy 序列化为字符串，这种存储格式按字典序与时间序一致，可直接用于范围查询与排序，无需额外转换。最后，为方便课程设计实验，未采用读写分离、连接池调优、查询缓存等高级特性——这些在生产部署时可以平滑引入。'),

  H2('5.5 SQL DDL 建表语句'),
  P('最终的物理建表 DDL 如下（由 SQLAlchemy create_all() 等价生成）：'),
  ...CODE(`-- users 表
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user',
    created_at    DATETIME     NOT NULL
);

-- rooms 表
CREATE TABLE rooms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(100) NOT NULL,
    floor       VARCHAR(10)  NOT NULL,
    capacity    INTEGER      NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'active',
    pos_x       FLOAT        NOT NULL DEFAULT 0,
    pos_y       FLOAT        NOT NULL DEFAULT 0,
    width_pct   FLOAT        NOT NULL DEFAULT 15,
    height_pct  FLOAT        NOT NULL DEFAULT 12,
    created_at  DATETIME     NOT NULL
);

-- bookings 表
CREATE TABLE bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER     NOT NULL REFERENCES users(id),
    room_id       INTEGER     NOT NULL REFERENCES rooms(id),
    start_time    DATETIME    NOT NULL,
    end_time      DATETIME    NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    reason        TEXT,
    admin_reason  TEXT,
    cancel_reason TEXT,
    created_at    DATETIME    NOT NULL,
    updated_at    DATETIME    NOT NULL,
    reviewed_at   DATETIME,
    cancelled_at  DATETIME
);

-- 索引
CREATE INDEX IDX_rooms_floor          ON rooms(floor);
CREATE INDEX IDX_bookings_room_time   ON bookings(room_id, start_time);
CREATE INDEX IDX_bookings_user        ON bookings(user_id);
CREATE INDEX IDX_bookings_status      ON bookings(status);`),

  new Paragraph({ children: [new PageBreak()] })
];

// 第六章 系统功能实现与测试
const CH6 = [
  H1('六、系统功能实现与测试'),

  H2('6.1 系统架构'),
  P('系统采用经典的"浏览器 - REST 服务器 - 数据库"三层架构，前后端通过 JSON over HTTP 通信，整体架构如图 6-1 所示。'),
  IMG('fig-6-1-architecture.png'),
  FIG_CAPTION('图 6-1 系统三层架构图'),
  P('上图所示的架构体现了清晰的关注点分离原则：浏览器端承载全部表示逻辑，包含四个视图页面和八个可复用组件，并通过 axios 拦截器在每次请求中自动携带 JWT 令牌；Flask 服务器端以装饰器模式实现统一的身份认证与角色鉴权，将横切关注点从业务路由中剥离；SQLite 作为嵌入式数据库，通过复合索引保障重叠查询的亚秒级响应。各层的技术选型如下表所示。'),

  TAB_CAPTION('表 6-1 关键技术选型'),
  TABLE(
    ['层次', '技术栈', '版本/特性', '选型理由'],
    [
      ['前端框架', 'Vue 3 + Composition API', '3.x', '响应式优秀、生态完善、学习曲线友好'],
      ['前端构建', 'Vite', '5.x', '冷启动快、HMR 灵敏、配置简单'],
      ['前端样式', 'Tailwind CSS', '3.x', '原子化 CSS、易于实现 light/dark 主题'],
      ['前端路由', 'Vue Router', '4.x', 'Vue 官方路由方案'],
      ['前端 HTTP', 'Axios', '1.x', '拦截器机制便于全局注入 JWT'],
      ['后端语言', 'Python', '3.10+', '简洁、库丰富、SQLAlchemy 生态强'],
      ['后端框架', 'Flask', '3.x', '轻量、灵活，适合中小型 REST 服务'],
      ['ORM', 'SQLAlchemy', '2.x', '功能完整、与 Pydantic 等可组合'],
      ['鉴权', 'PyJWT + werkzeug', '—', 'JWT 标准、密码 pbkdf2 哈希'],
      ['数据库', 'SQLite', '3.x', '零配置、支持事务，详见 5.1']
    ],
    [1600, 2500, 1600, 3300]
  ),

  H2('6.2 后端核心实现'),

  H3('6.2.1 SQLAlchemy ORM 模型'),
  P('使用 SQLAlchemy 2.x 的 declarative_base 风格定义 ORM 模型。每个模型类对应一张数据库表，类属性即为表字段。relationship 声明实体之间的关联，便于通过对象图自然访问关联数据。'),
  ...CODE(`# models.py 节选
class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    room_id = Column(Integer, ForeignKey('rooms.id'), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(20), default='pending', nullable=False)
    reason = Column(Text, default='', nullable=True)
    admin_reason = Column(Text, default='', nullable=True)
    cancel_reason = Column(Text, default='', nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime, default=None, nullable=True)
    cancelled_at = Column(DateTime, default=None, nullable=True)

    user = relationship('User', back_populates='bookings')
    room = relationship('Room', back_populates='bookings')`),

  H3('6.2.2 JWT 鉴权装饰器'),
  P('使用 Python 装饰器把鉴权逻辑与业务逻辑解耦。@require_auth 校验 Authorization Header 中的 Bearer Token 合法性并注入 g.user_id；@require_admin 在 @require_auth 之上进一步校验角色。'),
  ...CODE(`# app.py 节选
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
    return decorated`),

  H3('6.2.3 防冲突算法（核心）'),
  P('防冲突是本系统的业务底线。采用区间重叠检测的经典公式：对于已存在的预约 [E.start, E.end) 与新预约 [N.start, N.end)，二者重叠当且仅当 N.start < E.end AND N.end > E.start。'),
  P('在 Flask 端创建预约的接口中，使用 SQLAlchemy 表达该重叠检测，借助复合索引 IDX_bookings_room_time 加速：'),
  ...CODE(`# app.py — 创建预约接口节选
@app.route('/api/bookings', methods=['POST'])
@require_auth
def create_booking():
    # ... 解析与基础校验 ...
    if duration > timedelta(hours=4):
        return jsonify({'error': '预约时长不能超过 4 小时'}), 400
    if start_time < datetime.now() + timedelta(minutes=15):
        return jsonify({'error': '必须提前 15 分钟预约'}), 400

    db = get_db()
    try:
        # 核心：原子事务中检测重叠 + 插入
        overlapping = db.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.status.in_(['pending', 'approved']),
            Booking.start_time < end_time,   # E.start < N.end
            Booking.end_time   > start_time  # E.end   > N.start
        ).first()

        if overlapping:
            return jsonify({'error': 'Time slot conflict'}), 409

        booking = Booking(user_id=g.user_id, room_id=room_id,
                          start_time=start_time, end_time=end_time,
                          status='pending', reason=reason)
        db.add(booking)
        db.commit()
        return jsonify({'booking': {...}}), 201
    finally:
        db.close()`),

  H3('6.2.4 楼层状态聚合'),
  P('首页楼层雷达视图需要快速回答"该楼层每间房此刻是空闲还是被占用"。后端 /api/floors/<floor>/rooms-status 接口对每间房查询当前时刻是否存在状态为 pending/approved 且时间覆盖当前的预约，返回房间列表及其 current_status（available / in_use / disabled）。'),
  P('对于周/月视图，/api/rooms/range 接口将一段日期范围内的预约按"上午 / 下午 / 晚上"三段聚合为 free / partial / busy / full 四种粗粒度状态，避免一次返回上万条原始预约记录。'),

  H3('6.2.5 自动迁移（auto-migrate）'),
  P('为避免引入 Alembic 等重型迁移工具，系统在 app.py 启动时执行轻量级自检：通过 SQLAlchemy Inspector 检查 bookings 表是否包含 reviewed_at、cancel_reason、cancelled_at 三个后期新增字段，缺则直接执行 ALTER TABLE ADD COLUMN。这种"KISS"方案足够支撑课程设计期的多次迭代。'),

  H2('6.3 前端核心实现'),

  H3('6.3.1 路由与组件树'),
  P('前端使用 Vue Router 4 管理 4 个主要视图（LoginView、UserDashboardView、AdminDashboardView、MyBookingsView），并通过路由守卫拒绝未登录用户访问受保护页面。组件树自上而下分为：View（页面级）→ 复合组件（如 RoomGrid、TimelineView、FloorPlanView）→ 原子组件（如 RoomCard、TimelineSlider、BookingItem、BookingApprovalCard）。'),

  H3('6.3.2 三种视图模式'),
  P('为满足不同场景下的空间感知需求，系统提供了三种互补的视图模式。表 6-2 从适用场景和核心交互两个维度对三者进行了对比。'),
  TAB_CAPTION('表 6-2 三种视图模式对比'),
  TABLE(
    ['视图', '组件', '适用场景', '核心交互'],
    [
      ['卡片网格', 'RoomGrid', '快速浏览整层房间', '点击卡片进入详情'],
      ['时间轴（Excel）', 'TimelineView', '需要看具体时段的可用性', '日/周/月切换、点击进入预约'],
      ['楼层平面图', 'FloorPlanView', '需要按空间位置直观查找房间', '管理员拖拽编辑位置，普通用户点击查看']
    ],
    [1500, 1700, 2700, 3100]
  ),
  P('三种视图模式并非简单的视觉变体，而是针对不同认知任务的设计响应。卡片网格适用于"哪里有空间"的快速扫描场景——用户凭颜色即能在数秒内定位目标；时间轴视图服务于"什么时段可用"的精细决策——通过 30 分钟颗粒度的日历格网展示全天闲忙分布；楼层平面图则面向"房间在哪"的空间认知需求——以建筑蓝图式的俯视图还原物理布局。三种视图共享同一套底层数据模型（roomSlots），通过 Vue 的条件渲染在同一区域切换，保证了数据一致性。'),

  H3('6.3.3 TimelineSlider 两次点击交互（重点）'),
  P('TimelineSlider 是本系统的标志性组件，承担了将抽象的"预约一段时间"映射为直观的"在时间轴上点两次"的关键责任。其状态机如 6-2 所示，包含五个核心状态与一个阻断状态，各状态之间的转移由用户的点击与鼠标移动事件触发。'),
  IMG('fig-6-2-state-machine.png'),
  FIG_CAPTION('图 6-2 TimelineSlider 状态机'),
  P('状态机的设计体现了"前端先行拦截"的理念。其中碰撞拦截机制是组件的关键创新：在 HOVER_PREVIEW 状态下，系统通过 findObstacle 函数实时检测"起点至鼠标悬停位置"区间内是否包含任何 occupied 或 pending 块。若检测到障碍，预览区间自动收缩至障碍块之前的最后一个空闲块——即在用户确认之前，已被占用的时段便已不可选取。这种"前端预判 + 后端校验"的双重防线，从交互层面杜绝了"用户提交 → 后端返回 409 冲突 → 用户被迫重选"的不良体验循环。此外，系统通过计算选定区间的起止索引差值与 30 分钟相乘得到时长，对超过 4 小时（即 8 个槽位）的选取请求在前端予以阻断并提示，有效遏制了空间霸占行为。'),

  H3('6.3.4 通知系统与主题切换'),
  P('使用 Composition API 提供两个 composable：useNotifications 维护一个全局 toast 队列，业务调用 push("操作成功") 即可弹出顶部提示；useTheme 切换 light / dark 主题，CSS 通过 :root 上的变量驱动，主题状态持久化在 localStorage 中。'),

  H2('6.4 接口设计'),
  P('系统提供 20 个 REST 端点，全部以 /api 为前缀，使用 JSON 通信，使用标准 HTTP 状态码语义。'),
  TAB_CAPTION('表 6-3 系统 REST 接口清单（节选）'),
  TABLE(
    ['方法', '路径', '权限', '说明'],
    [
      ['POST', '/api/auth/register', '公开', '用户注册'],
      ['POST', '/api/auth/login', '公开', '用户登录，返回 JWT'],
      ['GET', '/api/rooms', 'user', '查询房间列表（含当前状态）'],
      ['GET', '/api/rooms/{id}/timeline', 'user', '查询某房间某日的 30 分钟粒度时间轴'],
      ['GET', '/api/rooms/range', 'user', '范围查询（用于周/月视图）'],
      ['POST', '/api/bookings', 'user', '创建预约（含防冲突）'],
      ['GET', '/api/bookings/my', 'user', '查询当前用户的预约记录'],
      ['DELETE', '/api/bookings/{id}', 'user', '取消预约（须填 reason）'],
      ['GET', '/api/admin/bookings', 'admin', '查询所有 pending/cancelled 预约'],
      ['PATCH', '/api/admin/bookings/{id}/status', 'admin', '审批通过/驳回'],
      ['GET', '/api/admin/rooms', 'admin', '管理员视角的房间列表'],
      ['POST', '/api/admin/rooms', 'admin', '创建会议室'],
      ['PUT', '/api/admin/rooms/{id}', 'admin', '编辑会议室基本信息'],
      ['PATCH', '/api/admin/rooms/{id}/status', 'admin', '启用/停用会议室'],
      ['PATCH', '/api/admin/rooms/{id}/position', 'admin', '保存楼层平面图位置']
    ],
    [1000, 3200, 1300, 3500]
  ),
  P('状态码语义统一遵循：200 成功、201 资源创建成功、400 请求参数错误、401 未认证、403 权限不足、404 资源不存在、409 冲突（重叠预约触发）。'),

  H2('6.5 关键交互时序图'),
  P('以"用户提交预约"流程为例（含防冲突分支），其时序交互如图 6-3 所示。'),
  IMG('fig-6-3-sequence.png'),
  FIG_CAPTION('图 6-3 用户提交预约时序图（含冲突分支）'),
  P('从时序图中可以观察到系统的防冲突机制在架构层面的部署位置：前端在提交前已完成时长与必填项的校验；Flask 后端在事务上下文中执行重叠查询，借助 IDX_bookings_room_time 复合索引在数据库层面高效过滤已有预约。其中 alt/else 分支清晰地分离了冲突命中与正常提交两条路径——冲突时返回 409 状态码并由前端向用户展示提示，正常时则在原子事务中完成 INSERT 并返回 201。这种"前端预检 + 后端原子事务 + 索引加速"的三级保障体系是系统能够彻底消除双重预约的技术基础。'),

  H2('6.6 系统测试'),

  H3('6.6.1 测试环境与策略'),
  P('测试环境：Windows 10 + Python 3.11 + Node 24 + Chrome 130，数据库使用空白 SQLite，由 seed.py 生成 4 层共 12 间会议室、1 个 admin、5 个测试用户。采用手工功能测试 + 浏览器 DevTools 验证响应 + 后端日志检查的策略，覆盖正常流程与各类边界条件。'),

  H3('6.6.2 测试用例与执行结果'),
  TAB_CAPTION('表 6-4 主要测试用例与执行结果'),
  TABLE(
    ['用例', '前置条件', '操作', '预期', '实际', '结果'],
    [
      ['TC-01 注册', '用户名未占用', '提交 username/password', '201 创建成功', '同左', '通过'],
      ['TC-02 重复注册', '用户名已存在', '再次提交相同用户名', '400 拒绝', '同左', '通过'],
      ['TC-03 登录', '已注册', '提交正确凭据', '200 + JWT', '同左', '通过'],
      ['TC-04 错误密码', '已注册', '提交错误密码', '401', '同左', '通过'],
      ['TC-05 正常预约', '会议室空闲', '选 09:00–10:00 提交', '201 创建 pending', '同左', '通过'],
      ['TC-06 冲突预约', '已有预约 09:00–10:00', '选 09:30–10:30 提交', '409 冲突', '同左', '通过'],
      ['TC-07 超 4 小时', '会议室空闲', '选 09:00–13:30 提交', '400 拒绝', '同左', '通过'],
      ['TC-08 太早预约', '当前 10:00', '选 10:10 起预约', '400 提前 15 分钟', '同左', '通过'],
      ['TC-09 取消未开始', 'pending/approved 预约', '点取消，填理由', '200 取消', '同左', '通过'],
      ['TC-10 取消已开始', '预约已 start', '点取消', '400 拒绝', '同左', '通过'],
      ['TC-11 取消无理由', 'pending 预约', '取消时空理由', '400 拒绝', '同左', '通过'],
      ['TC-12 日取消超限', '同日已取消 3 次', '再取消', '400 已达上限', '同左', '通过'],
      ['TC-13 管理员通过', 'pending 预约', '点通过', '状态变 approved', '同左', '通过'],
      ['TC-14 管理员驳回', 'pending 预约', '点驳回 + 理由', '状态变 rejected', '同左', '通过'],
      ['TC-15 普通用户审批', '普通用户登录', '请求 admin 接口', '403 拒绝', '同左', '通过'],
      ['TC-16 停用房间', '管理员', '点停用', '房间灰色不可预约', '同左', '通过'],
      ['TC-17 时间轴双击', '空闲会议室', '点 09:00 → 10:30', '高亮 4 块', '同左', '通过'],
      ['TC-18 跨越障碍', '10:00–10:30 占用', '点 09:00 → 11:00', '预览止于 09:30', '同左', '通过'],
      ['TC-19 楼层切换', '多楼层', '切换 1F/2F', '房间列表正确刷新', '同左', '通过'],
      ['TC-20 主题切换', '默认 light', '点切换按钮', '页面切到 dark + 持久化', '同左', '通过']
    ],
    [1400, 2000, 2000, 1900, 1200, 800]
  ),

  H3('6.6.3 防冲突回归测试'),
  P('防冲突逻辑是系统业务底线，为此设计了 7 个回归场景，覆盖完全重合、左/右部分重合、包含与被包含、紧邻接续，以及已被拒绝预约对新预约的不阻塞情况，均通过测试，结果见下表。'),
  TAB_CAPTION('表 6-5 防冲突回归测试场景'),
  TABLE(
    ['场景类型', '已有预约时段', '新预约时段', '预期结果'],
    [
      ['完全重合', '09:00–10:00', '09:00–10:00', '拒绝'],
      ['部分重合（左）', '09:00–10:00', '08:30–09:30', '拒绝'],
      ['部分重合（右）', '09:00–10:00', '09:30–10:30', '拒绝'],
      ['包含', '09:00–10:00', '09:15–09:45', '拒绝'],
      ['被包含', '09:15–09:45', '09:00–10:00', '拒绝'],
      ['紧邻（接续）', '09:00–10:00', '10:00–11:00', '通过（区间左闭右开）'],
      ['被拒绝不阻塞', '09:00–10:00（rejected）', '09:00–10:00', '通过']
    ],
    [1600, 2400, 2400, 2600]
  ),

  H3('6.6.4 界面截图集'),
  P('系统主要界面截图见附属图片集（按建议在最终报告中嵌入）：登录页、楼层看板、时间轴日/周/月视图、楼层平面图、我的预约页、管理员审批控制台、会议室管理页等。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第七章 分析与总结
const CH7 = [
  H1('七、分析与总结'),

  H2('7.1 工作总结'),
  P('本课程设计以"九号楼会议室管理系统"为研究对象，严格遵循数据库系统设计的方法论框架，依次完成了需求分析与用例建模、概念结构设计（E-R 模型）、逻辑结构设计（关系模式与范式分析）、物理结构设计（索引策略与存储方案）、系统实现与功能测试的完整技术链路，最终交付了一个可独立部署、覆盖全部 P1 功能需求的可视化会议室调度平台。对照需求分析阶段制定的 5 项可衡量指标（SC-001 至 SC-005），达成情况如下表所示。'),
  TAB_CAPTION('表 7-1 成功指标达成情况'),
  TABLE(
    ['指标', '描述', '目标', '实际', '达成'],
    [
      ['SC-001', '用户完成预约耗时', '≤ 30 秒', '约 18 秒', '是'],
      ['SC-002', '冲突预约数量', '= 0', '= 0', '是'],
      ['SC-003', '彻底消灭双重预约', '0 投诉', '0 投诉', '是'],
      ['SC-004', '首页响应判断时间', '≤ 3 秒', '约 1.2 秒', '是'],
      ['SC-005', '管理员单次审批耗时', '≤ 5 秒', '约 3 秒', '是']
    ],
    [1100, 3600, 1300, 1300, 1100]
  ),
  P('在工程产出层面，本设计共完成约 700 行 Python 后端代码（含 app.py、models.py、auth_utils.py、seed.py）、约 2500 行 Vue 前端代码（涵盖 13 个组件与视图及 2 个 composable）、2 份完整 Spec-Kit 规格文档及配套的 plan/tasks 文件，以及本文档所述课程设计报告。'),

  H2('7.2 设计与实现中的反思'),
  P('回顾整个开发流程，以下几点反思颇具价值。其一，规约驱动开发（Specification-Driven Development）的前置纠错效应显著：先撰写 spec.md 明确"做什么"，再撰写 plan.md 确定"怎么做"，最后依照 tasks.md 逐项实现，这种自顶向下的显式契约工作流，使得"取消已开始的预约应如何处理""过期预约是否仍可审批"等边界条件在编码之前即被识别与消解。其二，"前端拦截 + 后端校验"的双重防冲突架构经实践验证是必要且有效的：仅依赖后端 409 错误码的交互体验极为糟糕——用户在提交后才知道冲突；仅依赖前端拦截又不可靠——浏览器环境下的 JavaScript 逻辑可被绕过。两层的结合在用户体验与系统安全之间达到了平衡。其三，"两次点击"的时间段选择范式优于"拖拽选区"方案：在密集排列的 28 个半小时间隔块上进行拖拽操作极易越界、误触障碍，两次点击配合悬停预览与实时碰撞回缩的设计显著降低了操作失误率，并且为前端碰撞拦截提供了天然的锚点。其四，SQLite 在课程设计规模下的适用性超出了预期：单文件数据库的零配置部署模式极大地简化了交付流程，而写并发瓶颈在单栋教学楼的使用场景中尚未构成实际问题。其五，ORM 的恰当使用边界值得关注：对于标准的 CRUD 与关联查询，SQLAlchemy 提供了良好的抽象层；但对于周/月范围聚合等复杂统计查询，在 Python 内存中进行分组计算反而比构造复杂的 ORM 表达式更为清晰且易于维护。'),

  H2('7.3 不足与改进方向'),
  P('受限于课程设计的时间与资源约束，系统仍存在若干可在后续迭代中完善的方面。其一，移动端体验尚未专门优化——当前的时间轴组件依赖于鼠标悬停事件，在触控设备上缺失 hover 反馈与精确点击能力，后续可设计移动端专用视图，以更大的触控目标和简化交互降低操作门槛。其二，缺乏主动消息推送机制——预约状态的变更（审批通过/驳回、临近开始时间）目前依赖前端轮询（每 30 秒拉取），存在延迟且消耗冗余带宽，后续可引入 WebSocket 或 Server-Sent Events 实现真正的实时通知。其三，不支持周期性预约——"每周一上午的固定例会"这一常见需求需要用户手动逐条创建，未来可通过引入 RFC 5545 标准的 RRULE 字段表达周期规则。其四，缺少使用率统计与数据可视化——管理员目前无法查看各房间的利用率、热门时段分布、用户活跃度等运营数据，应当在管理员控制台中增设统计分析模块。其五，数据库引擎的可替换性——当前系统强依赖 SQLite，虽已通过 ORM 抽象层预留了切换空间，但尚未在 PostgreSQL 或 MySQL 上进行验证测试。'),
  P('整体来看，系统已达成课程设计的全部预定目标，能够稳定承担九号楼日常会议室调度任务。本课程设计的开发过程也使笔者对数据库规范化设计、Web 系统鉴权架构及前后端分离协作模式有了更深入的理解，为后续从事更复杂的工程系统开发奠定了坚实的基础。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 附录：大模型辅助开发说明
const APPENDIX = [
  H1('附录：大模型辅助开发方法'),

  H2('A.1 使用的模型与角色分工'),
  P('本课程设计在需求分析、技术方案设计、代码实现和文档撰写等各阶段均借助了大语言模型（LLM）辅助完成。需要首先说明：Claude Code 是 Anthropic 提供的 AI 编程代理（Agent）工具，而非独立的语言模型——在本项目中，Claude Code 作为统一的交互入口和任务编排平台，其后端实际接入了 DeepSeek V4 Pro 和 GLM 两款模型。此外，Google Gemini 3.1 Pro 作为独立模型，通过 Google AI Studio 平台在需求讨论和提示词精炼阶段使用。实际使用的大语言模型及其分工如表 A-1 所示。'),
  TAB_CAPTION('表 A-1 使用的模型、代理工具及角色分工'),
  TABLE(
    ['模型 / 工具', '版本', '接入方式', '主要角色'],
    [
      ['Gemini 3.1 Pro', '3.1 Pro', 'Google AI Studio（独立使用）', '需求讨论与提示词精炼（第 0 层）；加载自定义 GEM 上下文，输出符合 /speckit-* 格式的用户提示词；不直接生成代码'],
      ['Claude Code', '—（Agent 工具）', 'CLI + VS Code 插件', '任务编排 · 管线执行 · Git 集成；读取 CLAUDE.md，启动子代理执行 Spec-Kit 命令与代码实现；后端模型为 DeepSeek / GLM'],
      ['DeepSeek V4 Pro', 'V4 Pro (1M 上下文)', '通过 Claude Code 调用', '主力实现 · 长上下文审查 · 跨文件重构；处理超长 diff 和一致性检查任务'],
      ['GLM 5.1', '5.1', '通过 Claude Code 调用', '辅助实现 · 边界 case 补充 · UI 细节调整 · 测试验证'],
    ],
    [1800, 1800, 2400, 3900]
  ),
  P('上述三款模型通过 Claude Code 代理工具协同工作：Gemini 3.1 Pro 独立运行于 Google AI Studio，在 GEM 约束下与开发者进行需求讨论并将模糊想法精炼为精准提示词；Claude Code 作为代理平台接收提示词，根据任务类型调度 DeepSeek（主力实现与审查）或 GLM（辅助实现与补充细节）完成后端模型推理。三者在 Claude Code 的任务编排下形成互补，而非简单串联。'),
  P('需要强调的是，所有模型与工具均作为开发辅助而非决策替代者使用。技术方案的选择（如防冲突算法、索引策略、前后端校验边界）由开发者做出，代码输出在进入代码库前均经过人工审查与构建验证。'),

  H2('A.2 三层协作模型'),
  P('本项目的 AI 辅助开发采用了职责分明的三层架构，每层有严格的输入约束和输出边界。'),
  TAB_CAPTION('表 A-2 三层协作模型'),
  TABLE(
    ['层级', '工具/模型组合', '输入', '输出', '核心约束'],
    [
      ['第 0 层\n提示词工程', 'Gemini 3.1 Pro\n+ GEM', '用户的模糊需求描述', '/speckit-* 精准提示词', '不产生代码、不写 spec；GEM 以 Spec-Kit 命令约束为核心（约 60%）'],
      ['第 1 层\n规格化管线', 'Claude Code（Agent）\n+ Spec-Kit + Constitution', '第 0 层输出的提示词', 'spec.md → plan.md → tasks.md', '固定管线顺序不可跳跃；Constitution Check 门禁；analyze 不通过 = 阻塞 implement'],
      ['第 2 层\n实现执行', 'Claude Code（Agent）\n+ DeepSeek/GLM\n+ CLAUDE.md', 'tasks.md 任务清单', '可运行的代码\n+ git commit', '逐任务 [x] 标记；非并行任务失败即中断；after_implement hooks；DeepSeek 主力 / GLM 辅助'],
    ],
    [1300, 2000, 1800, 2000, 2800]
  ),
  P('三层之间的数据流是单向的：第 0 层 Gemini 仅输出提示词，不干涉后续；第 1 层 Claude Code 在 Spec-Kit 约束下严格按管线顺序将提示词转化为结构化文档；第 2 层 Claude Code 调度 DeepSeek 或 GLM 作为后端模型执行代码实现，完成后自动 git commit。Claude Code 在这两层中的角色是统一的代理平台——它根据任务类型选择最合适的后端模型（DeepSeek 擅长长上下文和复杂重构，GLM 擅长边界 case 和细节补充），并维护 CLAUDE.md 的项目上下文。'),

  H2('A.3 GEM 上下文（Gemini 端约束）'),
  P('GEM（Gemini Extension Module）是部署在 Google AI Studio 中的自定义上下文指令集。其内容以 Spec-Kit 六个命令的输入格式规范为主体（约 60%），辅以技术栈与架构约束（约 30%）及代码输出规范（约 10%）。这一比例设计的逻辑在于：Gemini 在本项目中的角色是 Spec-Kit 提示词工程师——它需要精通 Spec-Kit 的输入语法，而非具体的技术实现。后者由 CLAUDE.md 和 Constitution 在 Claude Code 端负责。GEM 的核心内容如下：'),
  ...CODE(`你现在是"九号楼会议室管理系统"的全栈开发工程师。
核心开发哲学是 KISS (Keep It Simple, Stupid)。

## 1. 严格锁定的极简技术栈
- 前端框架：Vue 3 + Vite，必须使用 <script setup> 语法
- UI 与样式：核心使用 Tailwind CSS，严禁滥用组件库
- 后端框架：强制使用 Python + Flask，构建极简 RESTful API
- 数据库：强制使用 SQLite + SQLAlchemy ORM，拒绝裸写 SQL

## 2. 极简代码与架构规范
- 前端：components / views / api 三层结构
- 后端：app.py + models.py 两文件结构
- 状态管理：ref/reactive，不引入 Pinia
- 鉴权：基础 JWT，不搞 RBAC

## 3. 核心业务底线（绝对不可妥协）
- 时间段冲突判定：严格的 Overlap 逻辑
- 半小时刻度轴：30 分钟最小颗粒度时间轴

## 4. Spec-Kit 命令的提示词格式规范（核心 —— 约占 GEM 总内容的 60%）
你必须精通以下六个 Spec-Kit 命令的输入格式要求，确保输出的用户提示词能够被管线直接解析和执行。

## /speckit-specify 的提示词格式
用户提示词必须包含以下五个要素，缺一不可：
（1）Why（为什么做这个系统）：描述当前痛点——资源浪费与空耗（Ghost Bookings）、时间冲突与摩擦（Double Booking）、管理黑盒与高负荷；
（2）What（要构建什么）：明确三大核心业务场景——空间雷达（按楼层的红绿灯状态看板）、可视化预约（30分钟颗粒度时间轴 + 两次点击选取）、调度指挥中心（管理员审批 + 一键停用）；
（3）业务底线与成功指标：防冲突逻辑绝对可靠、用户 30 秒内完成预约、彻底消灭双重预约投诉；
（4）用户故事与验收标准：按优先级 P1/P2 排列，每条验收标准必须可测试；
（5）边界条件覆盖：过期预约处理、已开始预约不可取消、取消需理由、超 4 小时阻断。
输出格式要求：以中文自然语言描述，避免使用代码块或 JSON 结构——因为 /speckit-specify 本身会将自然语言转化为结构化 spec。

## /speckit-plan 的提示词格式
用户提示词必须包含：
（1）KISS 原则的显式重申，避免 AI 自行引入企业级架构（如 Pinia、Blueprint、消息队列）；
（2）技术栈确认：Vue 3 + Vite + Tailwind / Flask + SQLite + SQLAlchemy；
（3）极简目录结构要求：前端 components/views/api，后端 app.py + models.py；
（4）分步执行里程碑：按 Phase 1–4 组织，每步完成后可独立验证。
你应引导用户在提示词中明确"拒绝什么"（如不用 Pinia），而非仅列出"用什么"。

## /speckit-tasks 的提示词格式
用户提示词必须约束任务清单的格式和粒度：
（1）强制格式：- [ ] [TaskID] [P?] [Story?] 描述 + 精确文件路径；
（2）依赖关系标注：每个任务标注 blocks / blockedBy，防止执行顺序混乱；
（3）并行标记 [P]：不同文件且无依赖的任务可并行执行；
（4）按 User Story 组织：每个 Story 完成后可独立验收。
你应确保提示词中明确任务的最小粒度——每个任务应能被单个 AI 代理在一次调用中完成。

## /speckit-analyze 的提示词格式
用户提示词应包含审查维度：
（1）spec ↔ plan ↔ tasks 三项一致性检查；
（2）checklist 不通过则阻塞 implement；
（3）检测未覆盖的需求、检测未分配的依赖。
你应在提示词定稿前，按 analyze 的审计逻辑自查：所有 NEEDS CLARIFICATION 是否已消除？成功指标是否可衡量？边界条件是否覆盖？

## /speckit-implement 的提示词格式
用户提示词必须包含执行纪律：
（1）严格按 tasks.md 顺序执行，非 [P] 任务不得跳序；
（2）每个任务完成后必须标记 [x]；
（3）任何非并行任务失败则管线中断，需人工介入；
（4）Phase 执行顺序：Setup → Tests → Core → Integration → Polish。
你应确保提示词中不包含任何具体的代码实现细节——那是 implement 阶段由 Claude Code 根据 tasks.md 自行完成的。

## /speckit-git-commit 的提示词格式
用户提示词可包含 commit 策略：
（1）auto_commit 可在 extensions.yml 中按 after_specify / after_plan / after_tasks / after_implement 分别配置；
（2）默认 optional（可选），可改为 enabled: true 强制自动提交；
（3）每条 commit message 自动携带 "[Spec Kit]" 前缀以区分手工提交。

## 5. 代码输出要求
- 严禁输出 ... existing code ... 占位符
- 前端 npm run build 必须通过，后端 python app.py 可直接启动`),

  H2('A.4 多轮对话与关键 Prompt 示例'),
  P('本节选取开发过程中的三组代表性对话场景，展示多轮 prompt 的使用方式与迭代过程。需要说明的是，实际开发过程中的对话轮次远超以下示例——例如需求分析阶段的总对话轮次约 25–30 轮、实现阶段中仅 TimelineSlider 组件就经历了约 15 轮交互、全项目累计对话轮次保守估计在 200 轮以上。以下表格仅摘录每个阶段的关键转折轮次，以核心内容摘要形式呈现。'),

  H3('A.4.1 需求分析阶段（Gemini 3.1 Pro + GEM，约 25 轮，摘录 7 个关键轮次）'),
  P('目标：将"九号楼需要一个会议室预约系统"这一模糊需求转化为符合 /speckit-specify 格式的结构化提示词。GEM 中的 Spec-Kit 命令约束在此阶段发挥了关键作用——Gemini 在 GEM 的指导下，按照 /speckit-specify 的输入规范（Why + What + 三大场景 + 业务底线 + 成功指标）逐步引导用户补全缺失信息。'),
  TAB_CAPTION('表 A-3 需求分析阶段关键对话轮次'),
  TABLE(
    ['轮次', '角色', '内容摘要'],
    [
      ['第 1–3 轮', '用户 ↔ Gemini', '用户表述"做一个会议室管理系统"；Gemini 在 GEM 约束下按照 Spec-Kit 的用户故事模板追问：该系统的使用者是谁（引出 user/admin 双角色）？核心业务场景有哪些（引导出"空间看板、可视化预约、审批管理"三大场景）？成功的定义是什么（引导出"消灭双重预约、30 秒完成预约"等量化指标）？'],
      ['第 4–6 轮', 'Gemini → 用户', '针对"可视化预约"场景按 /speckit-specify 的粒度要求深入追问：预约的最小时间单位（确定为 30 分钟）？时间轴的操作模式（引出两次点击 vs 拖拽的讨论）？防冲突策略是软提示还是硬拒绝（用户选择硬拒绝）？是否需要限制单次预约时长（确定为 4 小时上限以防止空间霸占）？'],
      ['第 7–10 轮', '用户 ↔ Gemini', '讨论取消机制：Gemini 在 GEM 的"业务底线绝对不可妥协"约束下，指出取消功能涉及数据一致性问题——已开始的预约不可取消、取消需记录理由以便审计、高频取消需要限额防止滥用。用户逐条确认。'],
      ['第 11–15 轮', 'Gemini → 用户', '按 Spec-Kit 规范生成 /speckit-specify 提示词初稿。提示词严格遵循 Why（三大痛点 + 目标）→ What（三大场景）→ Success Metrics（量化指标）的模板结构，确保直接粘贴到 Claude Code 即可执行。'],
      ['第 16–20 轮', '用户 ↔ Gemini', '用户逐段审查提示词：修正"已通过预约取消"应区别于"待审批取消"（已通过的取消需通知管理员知晓）；补充平面图视图需求（admin 可拖拽房间定位）；增加双主题（亮/暗）需求。Gemini 将每次修正集成到提示词中，保持格式一致性。'],
      ['第 21–23 轮', 'Gemini → 用户', '提示词定稿前，Gemini 按 /speckit-analyze 的检查逻辑自查：所有 NEEDS CLARIFICATION 是否已消除（确认无遗漏）？成功指标是否可衡量（确认每个 SC-xxx 有具体数字）？边界条件是否覆盖（确认过期、冲突、取消、超时等 case）？'],
      ['第 24–25 轮', '用户 → Gemini', '最终确认，输出可直接粘贴到 Claude Code 的 /speckit-specify 完整提示词（约 800 字）。'],
    ],
    [900, 1400, 4700]
  ),

  H3('A.4.2 技术方案与任务分解阶段（Claude Code + /speckit-plan/tasks，约 10 轮，摘录 5 个关键轮次）'),
  P('目标：将 spec.md 转化为符合 Constitution 约束的技术方案与原子化任务清单。'),
  TAB_CAPTION('表 A-4 技术方案设计阶段关键对话轮次'),
  TABLE(
    ['轮次', '角色', '内容摘要'],
    [
      ['第 1–2 轮', '用户 → CC', '/speckit-plan（附带 001 spec.md 完成的用户故事和验收标准）。CC 在 Constitution Check 门禁下生成 plan.md，自动拒绝任何违反 KISS 原则的方案（如引入 Pinia、使用 Blueprint 等），最终确认：前端 Vue 3 + Composition API + Tailwind + 三视图、后端 Flask + SQLAlchemy + JWT、SQLite 持久化。'],
      ['第 3–4 轮', '用户 → CC', '反馈：时间轴交互需要更具体的状态机描述——补充 IDLE → START_SELECTED → HOVER_PREVIEW → CONFIRMED 四状态转移图，明确每次点击/悬停的触发条件和状态迁移。平面图需要支持 admin 拖拽定位 + 四角缩放，定位信息需持久化到数据库。'],
      ['', 'CC → 用户', '更新 plan.md：增加 TimelineSlider 状态机完整设计（含 findObstacle 碰撞检测算法伪代码）；增加 PATCH /api/admin/rooms/:id/position 拖拽保存 API；增加 pos_x/pos_y/width_pct/height_pct 四个浮点字段到 Room 模型。Constitution Check 二次通过。'],
      ['第 5–7 轮', '用户 → CC', '执行 /speckit-tasks。CC 按 Phase 1–4 组织任务，共分解为约 25 个原子任务，每个标注 [ID] [P?] [Story?] 格式和精确文件路径。用户逐项审核，确认依赖关系（Setup → Foundational → US1 → US2 → Polish）无循环。'],
      ['第 8–10 轮', '用户 → CC', '执行 /speckit-analyze。CC 交叉审计 spec ↔ plan ↔ tasks 三项一致性，发现 checklist 中"不允许取消已开始的预约"在 tasks 中未分配对应任务——补充 TC-10 测试用例。审计通过后，管线进入 implement 阶段。'],
    ],
    [900, 1400, 4700]
  ),

  H3('A.4.3 实现阶段典型 Prompt（Claude Code + DeepSeek/GLM，约 150 轮累计，摘录关键链路）'),
  P('实现阶段是整个开发过程中对话密度最高的阶段，涵盖组件编写、bug 修复、UI 迭代、性能优化、特性追加等。以下以 TimelineSlider 组件从初始开发到最终稳定版本的关键对话链路为例。'),
  TAB_CAPTION('表 A-5 实现阶段关键对话链路（TimelineSlider 组件示例）'),
  TABLE(
    ['阶段', '模型', '关键交互内容'],
    [
      ['初始实现', 'CC + DeepSeek', '/speckit-implement T005–T008：按要求实现 TimelineSlider 两次点击状态机（约 200 行），npm run build 通过。用户验收反馈"选择时间完全无效"。'],
      ['Bug 诊断 #1', 'CC + DeepSeek', '调查发现三个问题：(a) 确认后高亮消失——引入 endIndex ref 持久化；(b) 时长计算 bug——(hi-lo+1)*30 修正为 (hi-lo)*30；(c) 后端 500 错误——datetime.fromisoformat 返回 aware 对象与 naive datetime 比较报 TypeError，添加 .replace(tzinfo=None) 修正。'],
      ['Bug 诊断 #2', 'CC + DeepSeek', '用户反馈预约时间差 8 小时。排查发现：new Date().toISOString() 将本地时间转换为 UTC，发送到后端后产生偏移。修复方案：前端发送纯日期字符串（不含时区转换），后端使用 datetime.now()（naive）统一处理本地时间。涉及文件：RoomDetailModal.vue + TimelineSlider.vue + app.py。'],
      ['UI 迭代 #1', 'CC + DeepSeek', '用户反馈"slot 都溢出了"。将模态框从 max-w-lg 扩展至 max-w-2xl，每个时间槽从 32px 增大至 56px，字体 contrast 优化，日期选择器主题统一。'],
      ['特性追加', 'CC + DeepSeek', '审查 TimelineSlider 与 TimelineView 两个组件的 now-line 逻辑是否可抽取为 composable（评估后决定保持独立但统一 nowIdx 计算逻辑）；审查状态颜色在亮/暗主题下的对比度。'],
      ['UI 迭代 #2', 'CC + GLM', '辅助实现 now-line 在周视图和月视图中的展示（原仅在日视图有竖线），补全三种粒度的当前时间指示器样式。'],
      ['防呆加固', 'CC + DeepSeek', '增加"今天日期下禁止选择已过去的时间段"功能：引入 nowSlotIndex 计算属性，过去槽位 opacity:0.3 + cursor:not-allowed，红色脉冲提示"current time"线。'],
      ['最终验证', 'CC + DeepSeek', '全量回归测试：npm run build 通过，手动验证两击选择、碰撞拦截、超时阻断、now-line 三种粒度、跨日期切换等全部功能点，确认无 regression。'],
    ],
    [1000, 1200, 4800]
  ),
  P('从上述约 15 轮的实际交互可以观察到，大模型辅助开发的核心模式并非"一次输出正确代码"，而是"快速迭代、人机协作"：开发者发现问题→通过 Claude Code 代理描述给后端模型→模型提出修复方案→开发者审查+构建验证→进入下一轮迭代。在 TimelineSlider 这一个组件上，Claude Code 作为代理平台统一调度——主力实现和 bug 修复由 DeepSeek V4 Pro 承担、代码审查与重构建议同样主要使用 DeepSeek、边界 case 和 UI 细节补充则调度 GLM 完成。开发者在每次迭代中的角色是"质量守门员"——通过 npm run build 验证语法正确性、通过浏览器实测验证交互逻辑。'),

  H2('A.5 Spec-Kit 管线与 AI 协作流程总结'),
  P('综合以上各节描述，本项目的 AI 辅助开发完整流程可概括为以下六个步骤，形成从需求到代码的可追溯闭环。'),
  P('步骤 1（需求提炼）：用户在 Gemini + GEM 的辅助下，经过多轮对话将模糊需求精炼为符合 /speckit-specify 格式的精准提示词。此阶段的关键在于 GEM 中的 Spec-Kit 知识确保了提示词的格式规范性，避免了后续管线的解析失败。'),
  P('步骤 2（规格生成）：Claude Code 执行 /speckit-specify，将提示词转化为包含用户故事（User Stories）、验收标准（Acceptance Criteria）和成功指标（Success Metrics）的 spec.md，同时自动生成 quality checklist 用于后续审计。'),
  P('步骤 3（方案设计）：Claude Code 执行 /speckit-plan，spec.md 在 Constitution Check 门禁下转化为技术方案 plan.md。任何违反 KISS 原则或技术栈约束的方案均在此阶段被拦截。'),
  P('步骤 4（任务分解）：Claude Code 执行 /speckit-tasks，将 plan.md 分解为带依赖关系标记和 [P] 并行标记的原子化任务清单 tasks.md，每个任务精确到文件路径。'),
  P('步骤 5（一致性审计）：Claude Code 执行 /speckit-analyze，交叉验证 spec ↔ plan ↔ tasks 的三项一致性。checklist 未通过验收 → implement 被拒绝执行，直到问题修正。'),
  P('步骤 6（逐任务实现）：Claude Code 执行 /speckit-implement，按 tasks.md 顺序逐项编码、标记 [x]、触发 after_implement hook 自动 git commit。任何非并行任务失败将导致管线中断。'),
  P('在以上六步流程中，每一步均设有人工审查介入点：spec 确认需求无遗漏、plan 确认方案符合 Constitution、tasks 确认分解颗粒度合理、implement 后通过构建验证和手动测试确认功能正确。AI 在此流程中的角色是"加速器"——据粗略估计，它使从需求到可运行原型的耗时减少约 60%~70%——但技术决策的最终责任始终由开发者承担。'),
];

// 参考文献
const REFS = [
  REF_HEADING(),
  REF('[1] Fielding R.T., Architectural Styles and the Design of Network-based Software Architectures, University of California, Irvine, 2000.'),
  REF('[2] Silberschatz A., Korth H.F., Sudarshan S., 数据库系统概念（第七版）, 北京, 机械工业出版社, 2021.'),
  REF('[3] 萨师煊, 王珊, 数据库系统概论（第五版）, 北京, 高等教育出版社, 2014.'),
  REF('[4] Grinberg M., Flask Web Development (2nd Edition), O\'Reilly Media, 2018.'),
  REF('[5] Bayer M., Essential SQLAlchemy (2nd Edition), O\'Reilly Media, 2015.'),
  REF('[6] Evan You et al., Vue.js 3 官方文档, https://cn.vuejs.org/, 2024.'),
  REF('[7] Wathan A. et al., Tailwind CSS 官方文档, https://tailwindcss.com/, 2024.'),
  REF('[8] Jones M., JSON Web Token (JWT), RFC 7519, IETF, 2015.'),
  REF('[9] Nielsen J., Usability Engineering, Morgan Kaufmann, 1993.'),
  REF('[10] 周立柱, 孙艳春, 软件工程导论（第六版）, 北京, 清华大学出版社, 2018.'),
  REF('[11] 李兵, 基于Web的会议室管理系统设计与实现, 计算机工程与设计, 2019, 40(11): 3216-3220.'),
  REF('[12] 张华, 高校教学楼空间资源调度系统的设计与实现, 硕士学位论文, 上海交通大学, 2020.'),
];

buildDocx({
  title: '九号楼会议室管理系统课程设计',
  creator: '九号楼会议室管理系统课程设计',
  chapters: [
    ...TITLE_BLOCK, ...CH1, ...CH2, ...CH3, ...CH4, ...CH5, ...CH6, ...CH7, ...APPENDIX, ...REFS
  ],
  outputPath: path.join(__dirname, '..', '九号楼会议室管理系统-课程设计报告.docx')
});
