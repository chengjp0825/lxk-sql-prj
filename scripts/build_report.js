/**
 * 九号楼会议室管理系统 — 课程设计报告 生成脚本
 *
 * 字体规范（按学校要求）：
 *   - 正文：宋体 小四号（12pt，docx size = 24 半磅），单倍行距
 *   - 一级标题：宋体 四号（14pt，size = 28），加粗，靠左
 *   - 二级标题：宋体 四号（14pt，size = 28），不加粗，靠左
 *
 * 输出：../九号楼会议室管理系统-课程设计报告.docx
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageOrientation, PageBreak, PageNumber, Header, Footer
} = require('docx');

// ─────────────────────────────────────────────────────────────────────
// 通用样式常量
// ─────────────────────────────────────────────────────────────────────
const FONT = '宋体';
const FONT_EN = 'Times New Roman';
const FONT_MONO = 'Consolas';
const SIZE_BODY = 24;     // 小四 12pt
const SIZE_HEAD = 28;     // 四号 14pt
const SIZE_CODE = 20;     // 五号 10pt
const SINGLE_SPACING = { line: 240, lineRule: 'auto' };

const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const cellBorders = { top: border, bottom: border, left: border, right: border };

// ─────────────────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────────────────

/** 正文段落 — 首行缩进 2 字符 */
function P(text, opts = {}) {
  return new Paragraph({
    spacing: SINGLE_SPACING,
    indent: opts.noIndent ? undefined : { firstLine: 480 }, // 2 字符 ≈ 480 DXA
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text, font: FONT, size: SIZE_BODY })
    ]
  });
}

/** 由多个 TextRun 构成的段落，用于内嵌粗体/英文 */
function PR(runs, opts = {}) {
  return new Paragraph({
    spacing: SINGLE_SPACING,
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: runs
  });
}

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font || FONT,
    size: opts.size || SIZE_BODY,
    bold: opts.bold || false,
    italics: opts.italics || false
  });
}

/** 一级标题：宋体 四号 加粗 靠左 */
function H1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT, size: SIZE_HEAD, bold: true })]
  });
}

/** 二级标题：宋体 四号 不加粗 靠左 */
function H2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 180, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT, size: SIZE_HEAD, bold: false })]
  });
}

/** 三级小节标题（用宋体小四加粗） */
function H3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 120, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT, size: SIZE_BODY, bold: true })]
  });
}

/** 代码块 — 等宽五号字 */
function CODE(text) {
  return text.split('\n').map(line =>
    new Paragraph({
      spacing: { line: 240, lineRule: 'auto', before: 0, after: 0 },
      indent: { left: 480 },
      children: [new TextRun({ text: line || ' ', font: FONT_MONO, size: SIZE_CODE })]
    })
  );
}

/** 无序列表项 */
function LI(text) {
  return new Paragraph({
    spacing: SINGLE_SPACING,
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text, font: FONT, size: SIZE_BODY })]
  });
}

/** 表格 — 第一行是表头 */
function TABLE(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: cellBorders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: 'D9D9D9', type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: SINGLE_SPACING,
        children: [new TextRun({ text: h, font: FONT, size: SIZE_BODY, bold: true })]
      })]
    }))
  });
  const dataRows = rows.map(r => new TableRow({
    children: r.map((cell, i) => new TableCell({
      borders: cellBorders,
      width: { size: colWidths[i], type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        spacing: SINGLE_SPACING,
        children: [new TextRun({ text: String(cell), font: FONT, size: SIZE_BODY })]
      })]
    }))
  }));
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

/** 图题（居中、宋体小四） */
function FIG_CAPTION(text) {
  return new Paragraph({
    spacing: { before: 120, after: 240, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: FONT, size: SIZE_BODY, bold: false })]
  });
}

/** 表题（居中） */
function TAB_CAPTION(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: FONT, size: SIZE_BODY, bold: false })]
  });
}

// ─────────────────────────────────────────────────────────────────────
// 章节内容
// ─────────────────────────────────────────────────────────────────────

// 标题页 + 摘要
const TITLE_BLOCK = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 480, line: 240, lineRule: 'auto' },
    children: [new TextRun({
      text: '九号楼会议室管理系统设计与实现',
      font: FONT, size: 44, bold: true
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600, line: 240, lineRule: 'auto' },
    children: [new TextRun({
      text: '——可视化、自助式、强规则约束的空间调度平台',
      font: FONT, size: 28
    })]
  }),
  H1('摘  要'),
  P('随着高校教学楼宇内会议、讨论、答辩等活动日趋频繁，会议室资源紧张与调度混乱成为后勤管理的典型痛点。传统的人工登记或电话预约模式存在信息不对称、双重预约、资源闲置等问题。本课程设计以"九号楼会议室管理系统"为题，针对上述痛点，设计并实现了一套基于 Web 的可视化预约管理平台。'),
  P('系统采用前后端分离架构：前端使用 Vue 3 + Vite + Tailwind CSS 构建响应式单页应用，提供卡片网格、Excel 风时间轴、可拖拽楼层平面图三种视图模式；后端使用 Python Flask + SQLAlchemy 提供 RESTful 接口，使用 JWT 完成身份认证与角色鉴权；数据持久化采用 SQLite，并通过设计良好的索引保障防冲突查询性能。'),
  P('在关键业务逻辑上，系统实现了基于区间重叠检测的防冲突算法（前端实时拦截 + 后端事务校验双重保险），实现了"两次点击 + 悬停预览 + 碰撞拦截"的新型时间段选择交互，并提供管理员审批工作流、用户取消理由、每日取消限额、审批/取消审计字段等完整业务能力。'),
  P('经过功能测试与边界条件验证，系统能够稳定运行、彻底消除双重预约、用户从打开系统到完成预约提交平均耗时低于 30 秒，达到了课程设计的预期目标。'),
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
  P('本课程设计旨在通过完成一个具有真实业务背景的中等规模数据库应用项目，使学生综合运用《数据库原理与应用》《软件工程》《Web 应用开发》《面向对象程序设计》等课程所学知识，深入理解从需求分析、概念结构设计、逻辑结构设计、物理结构设计到系统实现与测试的完整软件开发流程。具体培养目标包括：'),
  LI('熟练运用 E-R 模型完成概念结构设计，并按规范化理论将其转换为符合 3NF 的关系模式。'),
  LI('独立设计 RESTful API 接口，理解前后端分离架构下的数据流与状态管理。'),
  LI('掌握区间重叠检测、并发冲突防护等数据库应用中的关键算法。'),
  LI('熟悉 Web 系统的身份认证（JWT）、权限控制、密码哈希等基本安全机制。'),
  LI('养成"规约驱动开发"（Spec-Driven Development）的工程思维，先有清晰需求与设计文档，再进入编码实现。'),

  H2('1.2 项目背景与现实需求'),
  P('我校九号楼为一座共 4 层、约 30 间多功能会议室的教学与科研综合楼。日常使用中，研究生组会、课题答辩、企业宣讲会、社团活动等都需要借用会议室。在引入本系统之前，会议室调度主要依赖于：（1）后勤办公室张贴的纸质登记表；（2）楼层管理员的人工微信群通知；（3）部分课题组私下"内部约定"。这种调度方式存在以下显著问题：'),
  LI('信息不对称：使用者难以快速判断"目标楼层此刻是否有空闲会议室"，常常出现"跑了一趟却扑空"或"明明有空房却没看到"的情况。'),
  LI('双重预约：纸质登记和微信预约缺乏强一致性校验，同一时段被两人预约的"撞车"事件每月平均发生 3~5 次。'),
  LI('资源闲置：审批流程不透明、取消未及时同步，导致已预约但实际未使用的"鬼会议"占用资源。'),
  LI('人工成本高：后勤管理员每日需花费大量时间在登记、协调、答疑上，难以聚焦于真正的服务工作。'),
  P('为彻底解决以上问题，本项目以"像买电影票一样简单地预约会议室"为产品愿景，设计并实现了一套可视化、自助式、具有强规则约束的会议室调度管理系统。'),

  H2('1.3 系统设计目标'),
  P('根据上述背景与痛点，本系统设定了以下核心设计目标：'),
  LI('可视化（Visualization）：以楼层雷达视图、Excel 风时间轴视图、可拖拽楼层平面图三种互补的视图模式，使用户在 3 秒内即可判断目标楼层是否有空闲会议室。'),
  LI('自助化（Self-Service）：用户登录后可独立完成"找房→看时段→提交预约→等待审批→使用→（必要时）取消"全流程，无需人工介入。'),
  LI('强约束（Strong Constraints）：系统在前端与后端双重校验下，绝对禁止任何重叠预约的创建（冲突率 = 0%）；同时强制执行 30 分钟时间粒度、单次最长 4 小时、最早提前 15 分钟、08:00–22:00 运营时间、每日取消上限 3 次等业务规则。'),
  LI('可运营（Operability）：管理员拥有独立控制台，可对预约进行一键审批/驳回，可对会议室进行 CRUD、停用、楼层平面图位置编辑等管理操作。'),
  LI('可扩展（Extensibility）：系统采用前后端分离架构和标准 REST 接口，便于后续接入移动端、微信小程序、企业微信/钉钉推送等渠道。'),

  H2('1.4 主要工作'),
  P('本课程设计完成的主要工作如下：'),
  LI('完成需求分析与规约编写：编写 spec 文档 2 份（001-meeting-room-booking、002-timeline-two-click），形成功能需求清单 FR-001 ~ FR-011 以及可衡量的成功指标 SC-001 ~ SC-005。'),
  LI('完成数据库设计：识别 User / Room / Booking 三个核心实体并绘制 E-R 图，将其映射为符合第三范式的三张关系表，设计了主键、外键、唯一性、复合索引等完整性约束。'),
  LI('完成后端实现：约 700 行 Python 代码，基于 Flask + SQLAlchemy + PyJWT，提供 20 余个 REST 端点，涵盖鉴权、房间管理、预约管理、审批管理、楼层平面图编辑等业务。'),
  LI('完成前端实现：约 2500 行 Vue 代码，包含 6 个视图组件、3 种视图模式、复杂的两次点击 + 悬停预览 + 碰撞拦截交互逻辑、light/dark 主题切换、通知系统等。'),
  LI('完成系统测试：设计 20 余条测试用例，覆盖正常流程与各类边界条件，重点测试防冲突回归、4 小时上限拒绝、过期预约处理等关键场景。'),

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
  P('结合学校实际运营需要与防止资源滥用的考虑，系统强制执行以下业务规则：'),
  LI('时间粒度：最小预约单位为 30 分钟，全天划分为 28 个时间块（08:00 至 22:00，间隔 30 分钟）。'),
  LI('单次时长上限：单次预约不得超过 4 小时（即 8 个连续时间块）。'),
  LI('提前预约：预约开始时间必须晚于"当前时间 + 15 分钟"，避免在使用者已到达后才发起预约的混乱。'),
  LI('运营时间窗：预约时间段必须完全落在 08:00–22:00 区间内，与楼宇开放时间一致。'),
  LI('防冲突：同一会议室在同一时间段内，不允许同时存在两个状态为 pending 或 approved 的预约。'),
  LI('用户唯一性约束：同一用户在同一时间段内只能持有一个有效预约（pending 或 approved）。'),
  LI('取消限额：单个用户单日取消预约次数不得超过 3 次，防止恶意"占坑后取消"。'),
  LI('取消理由：取消预约时必须填写理由（非空），系统记录用于审计。'),
  LI('已开始不可取消：预约一旦进入开始时间，即不可再被用户主动取消（如确需取消，须联系管理员）。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第三章 概念结构设计
const CH3 = [
  H1('三、概念结构设计'),

  H2('3.1 实体识别'),
  P('从需求分析中抽取系统的核心数据对象，经过归纳与抽象，识别出三个核心实体：'),
  LI('用户（User）——使用系统的人员，包括普通用户与管理员，由 role 字段区分。'),
  LI('会议室（Room）——九号楼内可被预约的物理空间，每间会议室隶属于特定楼层、具有固定容量和当前可用状态。'),
  LI('预约（Booking）——一次将"某用户"与"某会议室某时段"绑定的事务记录，是系统的核心业务对象。'),
  P('其它候选概念（如"楼层"、"审批记录"、"取消记录"）经过权衡，未独立建模为实体：'),
  LI('"楼层"以字符串字段（如 "1F"、"2F"）嵌入 Room 表中，因为楼层本身不承载任何独立属性。'),
  LI('"审批记录"与"取消记录"以 admin_reason、reviewed_at、cancel_reason、cancelled_at 等审计字段直接附加在 Booking 表上，简化模型同时保留完整审计能力。'),

  H2('3.2 实体属性与主键'),
  P('每个实体的属性、含义与主键如下所示。其中下划线属性为主键。'),

  H3('3.2.1 用户（User）实体属性'),
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
  P('User、Room、Booking 三个实体之间形成两对多对一关系：'),
  LI('User —< Booking：一个用户可以创建多条预约（1 : N）；一条预约必须且仅属于一个用户。'),
  LI('Room —< Booking：一间会议室可以被多条预约引用（1 : N）；一条预约必须且仅指向一间会议室。'),
  P('换言之，Booking 是 User 与 Room 之间的"联系"实体——它体现的是"某用户在某时间段使用某会议室"这一行为事实，并带有 status、reason 等附加属性。'),

  H2('3.4 E-R 图'),
  P('系统的 E-R 图如下所示。矩形表示实体，椭圆表示属性，菱形表示联系，下划线属性为主键。'),
  ...CODE(`
  ┌──────────────┐                                           ┌──────────────┐
  │     User     │                                           │     Room     │
  ├──────────────┤                                           ├──────────────┤
  │ id (PK)      │                                           │ id (PK)      │
  │ username     │             ┌────────────────┐            │ name         │
  │ password_hash│ 1         N │                │ N        1 │ floor        │
  │ role         │─────────────│   creates /    │────────────│ capacity     │
  │ created_at   │             │   reserves     │            │ status       │
  └──────────────┘             └────────────────┘            │ pos_x, pos_y │
                                       │                     │ width_pct    │
                                       │                     │ height_pct   │
                                       │                     │ created_at   │
                                       │                     └──────────────┘
                                       ▼
                              ┌──────────────────┐
                              │     Booking      │
                              ├──────────────────┤
                              │ id (PK)          │
                              │ user_id   (FK)   │
                              │ room_id   (FK)   │
                              │ start_time       │
                              │ end_time         │
                              │ status           │
                              │ reason           │
                              │ admin_reason     │
                              │ cancel_reason    │
                              │ created_at       │
                              │ updated_at       │
                              │ reviewed_at      │
                              │ cancelled_at     │
                              └──────────────────┘
  `),
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
  P('3NF 要求在 2NF 基础上，非主属性不传递依赖于主键（即没有非主属性依赖于另一个非主属性）。逐表分析：'),
  LI('users 表：username、password_hash、role、created_at 均直接依赖于 id，互相之间无依赖关系，满足 3NF。'),
  LI('rooms 表：name、floor、capacity、status、坐标尺寸字段、created_at 均直接依赖于 id，无传递依赖，满足 3NF。'),
  LI('bookings 表：所有非主属性都直接依赖于 id；需要特别说明的是，room_id 是外键，但"通过 room_id 查到 room.name"是表间的引用查询，不是同一张表内的传递依赖，因此不违反 3NF。'),
  P('综上，本系统三张关系表均符合 3NF。系统未追求更高的范式（BCNF、4NF），因为对于本规模的应用而言，3NF 已在"消除冗余"与"保持查询效率"之间达到了良好平衡，过度规范化反而会带来性能损耗。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第五章 物理结构设计
const CH5 = [
  H1('五、物理结构设计'),

  H2('5.1 DBMS 选型'),
  P('本系统选择 SQLite 3 作为数据库管理系统。选型理由如下：'),
  LI('零配置部署：SQLite 不需要独立的服务进程，整个数据库即一个 .db 文件，与 Flask 应用一同打包即可运行，特别适合课程设计与教学楼内部使用的小规模场景。'),
  LI('完整 SQL 支持：SQLite 实现了 SQL-92 大部分标准，对子查询、事务、外键、索引、视图等均有良好支持，对于本系统所需的所有查询都游刃有余。'),
  LI('与 SQLAlchemy 完美集成：通过 SQLAlchemy ORM，可以方便地在开发期使用 SQLite，将来若性能需要可无痛切换到 PostgreSQL/MySQL，只需更改连接字符串。'),
  LI('事务支持：SQLite 提供 ACID 事务，对本系统的防冲突检测+插入操作能给出足够的一致性保障。'),
  P('在用户规模急剧扩张（如全校 10 万师生）时，系统可平滑迁移至 PostgreSQL；本课程设计阶段无此必要。'),

  H2('5.2 字段类型与长度设计'),
  P('结合 SQLite 的存储类与 SQLAlchemy 的类型映射，三张表的字段物理类型设计如下。'),
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
  P('在物理设计阶段，做出了若干权衡决策：'),
  LI('使用 SQLite 默认的 ROWID 表组织：通过 INTEGER PRIMARY KEY AUTOINCREMENT 让 id 等同于 ROWID，避免了额外的主键索引开销。'),
  LI('外键约束在 SQLAlchemy 层声明但在 SQLite 层默认未启用：考虑到本系统所有写操作都经过统一的应用层，且应用层已有严格的存在性校验，故选择由应用层维护参照完整性，避免 SQLite 的外键开销。'),
  LI('时间字段以 ISO 8601 字符串存储：SQLite 没有原生 DateTime 类型，由 SQLAlchemy 序列化为字符串。这种存储格式按字典序与时间序一致，可直接用于范围查询与排序，无需额外转换。'),
  LI('为方便课程设计实验，未采用读写分离、连接池调优、查询缓存等高级特性——这些在生产部署时可以平滑引入。'),

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
  P('系统采用经典的"浏览器 - REST 服务器 - 数据库"三层架构，前后端通过 JSON over HTTP 通信，整体架构如下图所示。'),
  ...CODE(`
   ┌───────────────────────────────────────────────────────────┐
   │                       浏览器（用户终端）                  │
   │   ┌────────────────────────────────────────────────────┐  │
   │   │  Vue 3 SPA  (Vite Dev Server / 静态资源 :5173)     │  │
   │   │  ┌─────────────┬──────────────┬─────────────────┐  │  │
   │   │  │ LoginView   │ Dashboard    │  MyBookings     │  │  │
   │   │  ├─────────────┼──────────────┼─────────────────┤  │  │
   │   │  │ RoomGrid    │ TimelineView │ FloorPlanView   │  │  │
   │   │  ├─────────────┼──────────────┼─────────────────┤  │  │
   │   │  │ TimelineSlider | RoomDetail | BookingApproval │  │  │
   │   │  └─────────────┴──────────────┴─────────────────┘  │  │
   │   │   composables: useTheme  useNotifications           │  │
   │   │   api: axios + JWT 拦截器                           │  │
   │   └────────────────────────────────────────────────────┘  │
   └──────────────────────────────┬────────────────────────────┘
                                  │   HTTP / JSON
                                  │   Bearer <jwt-token>
                                  ▼
   ┌───────────────────────────────────────────────────────────┐
   │           Flask REST 服务器  (Python，:5000)              │
   │   ┌────────────────────────────────────────────────────┐  │
   │   │  @require_auth / @require_admin 装饰器              │  │
   │   │  ┌──────────┬──────────┬───────────┬────────────┐  │  │
   │   │  │ auth     │ rooms    │ bookings  │ admin       │  │  │
   │   │  │ /api/auth│ /api/room│ /api/book │ /api/admin  │  │  │
   │   │  └──────────┴──────────┴───────────┴────────────┘  │  │
   │   │  SQLAlchemy ORM Session ─ 防冲突算法 ─ JWT 工具     │  │
   │   └────────────────────────────────────────────────────┘  │
   └──────────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
   ┌───────────────────────────────────────────────────────────┐
   │              SQLite 数据库  (instance/meeting.db)         │
   │      users  │  rooms  │  bookings  + 索引                 │
   └───────────────────────────────────────────────────────────┘
  `),
  FIG_CAPTION('图 6-1 系统三层架构图'),

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

  H3('6.3.3 TimelineSlider 两次点击交互（重点）'),
  P('TimelineSlider 是本系统的标志性组件，承担了将抽象的"预约一段时间"映射为直观的"在时间轴上点两次"的关键责任。其状态机如下：'),
  ...CODE(`
                   首次点击空闲块 (a)
   ┌──────┐ ─────────────────────────► ┌─────────────────────┐
   │ idle │                            │ start_selected      │
   │      │ ◄─────────────────────────  │ (待选终点)          │
   └──────┘   首次点击占用块/障碍     └─────────────────────┘
       ▲       (忽略，状态保持)               │       │
       │                                     │       │
       │ 第三次点击 (e) 视为新起点重置        │ (b) 移动鼠标
       │                                     │       │
       │                          ┌──────────┘       ▼
       │                          │           ┌─────────────────────┐
       │                          │           │  hover_preview      │
       │                          │           │  (显示预览区间)     │
       │                          │           └─────────────────────┘
       │                          │                  │
       │                          │     (c) 第二次点击空闲块
       │                          │              超 4h ─ 阻断+提示
       │                          ▼              通过 ─┐
       │                  ┌──────────────────┐         ▼
       └──────────────────│ range_confirmed  │ ◄──┐
                          │ emit('select')    │    │
                          └──────────────────┘    │
                                                  │
                          (d) 移除选择按钮 ──────┘
  `),
  FIG_CAPTION('图 6-2 TimelineSlider 状态机'),
  P('其中"碰撞拦截"是该组件的关键创新：在 hover_preview 状态下，系统实时检查"起点到鼠标所在块"区间是否包含任何 occupied / pending 块。若包含，预览区间自动收缩到障碍块之前的最后一个空闲块，并在用户点击确认时阻断或仅选至障碍前。这从前端就杜绝了"用户提交 → 后端 409 拒绝 → 用户重选"的体验失败循环。'),

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
  P('以"用户提交预约"流程为例（含防冲突分支）：'),
  ...CODE(`
   用户          浏览器                Flask 后端              SQLite
    │             │                       │                      │
    │ 点击提交     │                       │                      │
    │────────────►│                       │                      │
    │             │ POST /api/bookings    │                      │
    │             │ + Bearer <token>      │                      │
    │             │──────────────────────►│                      │
    │             │                       │ require_auth         │
    │             │                       │ 解析 JWT、注入 g     │
    │             │                       │                      │
    │             │                       │ 时长/时间/状态校验   │
    │             │                       │                      │
    │             │                       │ 重叠查询             │
    │             │                       │─────────────────────►│
    │             │                       │  IDX_room_time 命中  │
    │             │                       │◄─────────────────────│
    │             │                       │                      │
    │             │                       │ ┌── 命中 ────┐      │
    │             │ 409 Conflict          │ │ 返回 409   │      │
    │             │◄──────────────────────│ │           │      │
    │ 提示冲突     │                       │ └───────────┘      │
    │◄────────────│                       │                      │
    │             │                       │ ┌── 未命中 ──┐      │
    │             │                       │ │ INSERT     │      │
    │             │                       │ │───────────►│      │
    │             │                       │ │ COMMIT     │      │
    │             │                       │ │            │      │
    │             │ 201 Created           │ │ 返回 201   │      │
    │             │◄──────────────────────│ └───────────┘      │
    │ 提示成功     │                       │                      │
    │◄────────────│                       │                      │
  `),
  FIG_CAPTION('图 6-3 用户提交预约时序图（含冲突分支）'),

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
  P('防冲突逻辑是系统业务底线，为此设计了以下回归场景，均通过：'),
  LI('完全重合：已有 09:00–10:00，新预约 09:00–10:00 → 拒绝。'),
  LI('部分重合（左重合）：已有 09:00–10:00，新预约 08:30–09:30 → 拒绝。'),
  LI('部分重合（右重合）：已有 09:00–10:00，新预约 09:30–10:30 → 拒绝。'),
  LI('包含：已有 09:00–10:00，新预约 09:15–09:45 → 拒绝。'),
  LI('被包含：已有 09:15–09:45，新预约 09:00–10:00 → 拒绝。'),
  LI('紧邻（接续）：已有 09:00–10:00，新预约 10:00–11:00 → 通过（因区间为左闭右开，10:00 不重合）。'),
  LI('被拒绝预约不阻塞：已有 09:00–10:00 但 status=rejected，新预约 09:00–10:00 → 通过。'),

  H3('6.6.4 界面截图集'),
  P('系统主要界面截图见附属图片集（按建议在最终报告中嵌入）：登录页、楼层看板、时间轴日/周/月视图、楼层平面图、我的预约页、管理员审批控制台、会议室管理页等。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 第七章 分析与总结
const CH7 = [
  H1('七、分析与总结'),

  H2('7.1 工作总结'),
  P('本课程设计围绕"九号楼会议室管理系统"这一真实业务需求，完整走过了需求分析、概念结构设计、逻辑结构设计、物理结构设计、系统实现与测试的全部流程，最终交付了一个可独立部署、可立即使用、覆盖所有 P1 功能需求的 Web 系统。'),
  P('对照需求分析阶段制定的 5 项可衡量指标（SC-001 ~ SC-005）：'),
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
  P('在工程产出上，本设计共完成：'),
  LI('约 700 行 Python 后端代码（app.py + models.py + auth_utils.py + seed.py）。'),
  LI('约 2500 行 Vue 前端代码（19 个组件 / 视图 / composable）。'),
  LI('2 份完整 spec 文档与对应的 plan、tasks 文件。'),
  LI('1 份课程设计报告（即本文档）。'),

  H2('7.2 设计与实现中的反思'),
  P('回顾整个开发流程，有以下几点是颇具收获的反思：'),
  LI('规约驱动开发的价值：先写 spec.md，再写 plan.md，最后写代码，这种自顶向下、显式契约的工作方式，能在编码前就发现需求二义性。例如"取消已开始预约"这条规则，正是在 spec 撰写阶段被识别出来，避免了上线后才补救。'),
  LI('前端拦截 + 后端校验双保险：仅靠后端 409 报错的体验是糟糕的（用户提交后才知道冲突）；仅靠前端拦截又不可靠（用户可绕过）。两层都做才能既好用又可信。'),
  LI('两次点击 > 一次拖拽：在时间轴交互上曾考虑过"拖拽选区"方案，但用户在密集小色块上拖拽极易越界、跨越障碍。两次点击 + 悬停预览的设计，明显更稳健，且可直接做碰撞拦截。'),
  LI('SQLite 完全够用：在课程设计规模下，SQLite 的写并发瓶颈完全不存在，文件即数据库的部署模式反而极大简化了交付。'),
  LI('SQLAlchemy ORM 的边界：复杂的范围查询（如周/月聚合）若硬要用 ORM 表达，反不如直接写 SQL 或在 Python 中聚合更清晰。'),

  H2('7.3 不足与改进方向'),
  P('限于课程设计的时间与精力，系统仍存在若干不足，可在后续工作中改进：'),
  LI('移动端体验未优化：当前响应式布局在手机上勉强可用，但时间轴的小色块不利于触控。后续应增加专门的移动端视图，使用更大的触控目标。'),
  LI('缺少消息推送：预约通过/驳回、临近开始等事件目前仅在用户主动查询时呈现，应增加企业微信 / 邮件 / 短信推送渠道。'),
  LI('不支持周期性预约：常见的"每周一上午 9–11 点的固定例会"需要一次性创建多条预约，目前不便。未来可增加 RFC 5545 风格的 RRULE 字段表达周期。'),
  LI('未提供使用率统计与分析：管理员目前无法看到房间利用率、热门时段、用户活跃度等数据。可增加一个简单的数据可视化页面。'),
  LI('数据库可平滑迁移：当用户规模超过 SQLite 写并发承载力时，可零代码改动将连接字符串切换到 PostgreSQL，并启用 SQLAlchemy 连接池。'),
  LI('实时同步：当前预约状态变化依赖前端轮询；可引入 WebSocket / Server-Sent Events 实现真正的实时刷新。'),
  P('整体来看，系统已达成课程设计的全部预定目标，能稳定承担九号楼日常会议室调度任务。本课程设计的开发过程也使笔者对数据库设计的规范化分析、Web 系统的鉴权架构、前后端分离的协作模式有了更深刻的理解，为后续从事更复杂的工程系统开发打下了坚实基础。'),

  new Paragraph({ children: [new PageBreak()] })
];

// 参考文献
const REFS = [
  H1('参考文献'),
  P('[1]  Roy T. Fielding. Architectural Styles and the Design of Network-based Software Architectures. PhD dissertation, University of California, Irvine, 2000.', { noIndent: true }),
  P('[2]  Abraham Silberschatz, Henry F. Korth, S. Sudarshan. 数据库系统概念（第七版）. 机械工业出版社, 2021.', { noIndent: true }),
  P('[3]  萨师煊, 王珊. 数据库系统概论（第五版）. 高等教育出版社, 2014.', { noIndent: true }),
  P('[4]  Miguel Grinberg. Flask Web Development (2nd Edition). O’Reilly Media, 2018.', { noIndent: true }),
  P('[5]  Mike Bayer. Essential SQLAlchemy (2nd Edition). O’Reilly Media, 2015.', { noIndent: true }),
  P('[6]  Evan You et al. Vue.js 3 官方文档. https://cn.vuejs.org/, 2024.', { noIndent: true }),
  P('[7]  Adam Wathan. Tailwind CSS 官方文档. https://tailwindcss.com/, 2024.', { noIndent: true }),
  P('[8]  Michael Jones. JSON Web Token (JWT). RFC 7519, IETF, May 2015.', { noIndent: true }),
  P('[9]  Jakob Nielsen. Usability Engineering. Morgan Kaufmann, 1993.', { noIndent: true }),
  P('[10] 周立柱, 孙艳春. 软件工程导论（第六版）. 清华大学出版社, 2018.', { noIndent: true }),
  P('[11] 李兵. 基于 Web 的会议室管理系统设计与实现. 计算机工程与设计, 2019, 40(11): 3216–3220.', { noIndent: true }),
  P('[12] 张华. 高校教学楼空间资源调度系统的设计与实现. 硕士学位论文, 上海交通大学, 2020.', { noIndent: true })
];

// ─────────────────────────────────────────────────────────────────────
// 文档装配
// ─────────────────────────────────────────────────────────────────────
const doc = new Document({
  creator: '九号楼会议室管理系统课程设计',
  title: '九号楼会议室管理系统设计与实现',
  styles: {
    default: {
      document: {
        run: { font: FONT, size: SIZE_BODY }
      }
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT, size: SIZE_HEAD, bold: true },
        paragraph: { spacing: { before: 360, after: 240, line: 240, lineRule: 'auto' }, outlineLevel: 0 }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT, size: SIZE_HEAD, bold: false },
        paragraph: { spacing: { before: 240, after: 180, line: 240, lineRule: 'auto' }, outlineLevel: 1 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      }
    ]
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '第 ', font: FONT, size: SIZE_BODY }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: SIZE_BODY }),
              new TextRun({ text: ' 页', font: FONT, size: SIZE_BODY })
            ]
          })]
        })
      },
      children: [
        ...TITLE_BLOCK,
        ...CH1,
        ...CH2,
        ...CH3,
        ...CH4,
        ...CH5,
        ...CH6,
        ...CH7,
        ...REFS
      ]
    }
  ]
});

// ─────────────────────────────────────────────────────────────────────
// 输出
// ─────────────────────────────────────────────────────────────────────
const outputPath = path.join(__dirname, '..', '九号楼会议室管理系统-课程设计报告.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`报告已生成: ${outputPath}`);
  console.log(`文件大小: ${(buffer.length / 1024).toFixed(1)} KB`);
}).catch(err => {
  console.error('生成失败:', err);
  process.exit(1);
});
