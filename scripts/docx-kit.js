/**
 * docx-kit.js — 学术课程设计报告 .docx 生成工具包（可复用）
 *
 * 字体规范（默认）：
 *   - 正文：中文宋体 + 英文/数字 Times New Roman 小四号（12pt），单倍行距
 *   - 一级标题：宋体+Times New Roman 四号（14pt），加粗，靠左
 *   - 二级标题：宋体+Times New Roman 四号（14pt），不加粗，靠左
 *   - 代码：Consolas 五号（10pt）
 *
 * 用法：
 *   const kit = require('./docx-kit');
 *   const { P, H1, H2, H3, TABLE, IMG, buildDocx } = kit;
 *   // … 定义章节内容数组 …
 *   buildDocx({
 *     title: '项目名',
 *     creator: '作者',
 *     chapters: [...TITLE_BLOCK, ...CH1, ...CH7, ...REFS],
 *     outputPath: 'output.docx'
 *   });
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, PageNumber, Header, Footer, ImageRun
} = require('docx');

// ──────────────────────────────────────────────────────────
// 通用样式常量
// ──────────────────────────────────────────────────────────
const FONT_OBJ = { ascii: 'Times New Roman', eastAsia: '宋体', hAnsi: 'Times New Roman', cs: 'Times New Roman' };
const FONT_MONO = 'Consolas';
const SIZE_BODY = 24;     // 小四 12pt
const SIZE_HEAD = 28;     // 四号 14pt
const SIZE_CODE = 20;     // 五号 10pt
const SIZE_TABLE = 21;    // 五号 10.5pt
const SINGLE_SPACING = { line: 240, lineRule: 'auto' };

// ──────────────────────────────────────────────────────────
// 三线表边框（学术规范）
// ──────────────────────────────────────────────────────────
const NO_BORDER     = { style: BorderStyle.NONE,   size: 0,  color: 'FFFFFF' };
const THICK_BORDER  = { style: BorderStyle.SINGLE, size: 12, color: '000000' };
const THIN_BORDER   = { style: BorderStyle.SINGLE, size: 4,  color: '000000' };
const HEADER_CELL_BORDERS = { top: THICK_BORDER, bottom: THIN_BORDER, left: NO_BORDER, right: NO_BORDER };
const MIDDLE_CELL_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
const LAST_CELL_BORDERS   = { top: NO_BORDER, bottom: THICK_BORDER, left: NO_BORDER, right: NO_BORDER };
const TABLE_TOTAL_WIDTH = 9000; // A4 可用正文宽度

// ──────────────────────────────────────────────────────────
// 段落工具函数
// ──────────────────────────────────────────────────────────

/** 正文段落 — 首行缩进 2 字符 */
function P(text, opts = {}) {
  return new Paragraph({
    spacing: SINGLE_SPACING,
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_BODY })]
  });
}

/** 多 TextRun 段落 */
function PR(runs, opts = {}) {
  return new Paragraph({
    spacing: SINGLE_SPACING,
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: runs
  });
}

function run(text, opts = {}) {
  return new TextRun({ text, font: opts.font || FONT_OBJ, size: opts.size || SIZE_BODY, bold: opts.bold || false, italics: opts.italics || false });
}

/** 一级标题 — 四号加粗靠左 */
function H1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_HEAD, bold: true })]
  });
}

/** 二级标题 — 四号不加粗靠左 */
function H2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 180, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_HEAD, bold: false })]
  });
}

/** 三级标题 — 小四加粗 */
function H3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 120, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_BODY, bold: true })]
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

/** 无序列表 */
function LI(text) {
  return new Paragraph({
    spacing: SINGLE_SPACING,
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_BODY })]
  });
}

/** 三线表 */
function TABLE(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const widths = colWidths.map(w => Math.round(w / totalW * TABLE_TOTAL_WIDTH));
  const makeCell = (text, rowIndex, isLastRow) => {
    const colW = widths.shift() || 1000; // fallback if widths exhausted
    return new TableCell({
    width: { size: colW, type: WidthType.DXA },
    borders: rowIndex === 0 ? HEADER_CELL_BORDERS : (isLastRow ? LAST_CELL_BORDERS : MIDDLE_CELL_BORDERS),
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 260, lineRule: 'auto', before: 40, after: 40 },
      children: [new TextRun({ text: String(text), font: FONT_OBJ, size: SIZE_TABLE })]
    })]
  });
  };
  const hRow = new TableRow({ children: headers.map(h => makeCell(h, 0, false)), tableHeader: true });
  const dRows = rows.map((row, ri) => new TableRow({ children: row.map(c => makeCell(c, ri + 1, ri === rows.length - 1)) }));
  return new Table({ rows: [hRow, ...dRows], width: { size: TABLE_TOTAL_WIDTH, type: WidthType.DXA } });
}

/** 表题 — 居中五号 */
function TAB_CAPTION(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_TABLE, bold: false })]
  });
}

/** 图片插入 — 自动缩放至 maxWidth（默认 460px ≈ A4 可用宽度） */
function IMG(file, maxWidth = 460) {
  const imgPath = path.join(__dirname, 'figures', file);
  const data = fs.readFileSync(imgPath);
  const realW = data.readUInt32BE(16);
  const realH = data.readUInt32BE(20);
  const scale = Math.min(maxWidth / realW, 1);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 80, line: 240, lineRule: 'auto' },
    children: [new ImageRun({ data, transformation: { width: Math.round(realW * scale), height: Math.round(realH * scale) } })]
  });
}

/** 图题 — 居中宋体小四 */
function FIG_CAPTION(text) {
  return new Paragraph({
    spacing: { before: 120, after: 240, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_BODY, bold: false })]
  });
}

/** 参考文献条目 — 五号字、悬挂缩进 */
function REF(text) {
  return new Paragraph({
    spacing: { line: 240, lineRule: 'auto', before: 0, after: 0 },
    indent: { left: 480, hanging: 480 },
    children: [new TextRun({ text, font: FONT_OBJ, size: SIZE_TABLE })]
  });
}

/** 参考文献标题 — 五号宋体加粗居中 */
function REF_HEADING() {
  return new Paragraph({
    spacing: { before: 360, after: 240, line: 240, lineRule: 'auto' },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: '参考文献', font: FONT_OBJ, size: SIZE_TABLE, bold: true })]
  });
}

/** 分页符 */
const PAGE_BREAK = () => new Paragraph({ children: [new PageBreak()] });

// ──────────────────────────────────────────────────────────
// 文档组装
// ──────────────────────────────────────────────────────────
function buildDocx(opts = {}) {
  const {
    title = '课程设计报告',
    creator = '课程设计',
    chapters = [],
    outputPath = '课程设计报告.docx'
  } = opts;

  const doc = new Document({
    creator,
    title,
    styles: {
      default: { document: { run: { font: FONT_OBJ, size: SIZE_BODY } } },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT_OBJ, size: SIZE_HEAD, bold: true },
          paragraph: { spacing: { before: 360, after: 240, line: 240, lineRule: 'auto' }, outlineLevel: 0 }
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT_OBJ, size: SIZE_HEAD, bold: false },
          paragraph: { spacing: { before: 240, after: 180, line: 240, lineRule: 'auto' }, outlineLevel: 1 }
        }
      ]
    },
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }]
    },
    sections: [{
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
              new TextRun({ text: '第 ', font: FONT_OBJ, size: SIZE_BODY }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT_OBJ, size: SIZE_BODY }),
              new TextRun({ text: ' 页', font: FONT_OBJ, size: SIZE_BODY })
            ]
          })]
        })
      },
      children: chapters
    }]
  });

  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`报告已生成: ${outputPath}`);
    console.log(`文件大小: ${(buffer.length / 1024).toFixed(1)} KB`);
  }).catch(err => { console.error('生成失败:', err); process.exit(1); });
}

module.exports = { P, PR, run, H1, H2, H3, CODE, LI, TABLE, TAB_CAPTION, IMG, FIG_CAPTION, REF, REF_HEADING, PAGE_BREAK, FONT_OBJ, FONT_MONO, SIZE_BODY, SIZE_HEAD, SIZE_CODE, SIZE_TABLE, SINGLE_SPACING, NO_BORDER, THICK_BORDER, THIN_BORDER, HEADER_CELL_BORDERS, MIDDLE_CELL_BORDERS, LAST_CELL_BORDERS, TABLE_TOTAL_WIDTH, buildDocx, Paragraph, TextRun, PageBreak, HeadingLevel, AlignmentType };
