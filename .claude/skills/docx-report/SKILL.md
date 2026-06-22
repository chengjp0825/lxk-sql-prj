---
name: docx-report
description: Generate an academic course design report (.docx) from project code and specs
---

# Academic Course Design Report Generator

Generate a `.docx` course design report for database/software engineering projects.

## Prerequisites

```bash
cd scripts && npm install
```

The project must have `scripts/docx-kit.js` and `scripts/render_mermaid.js` available.

## Report Structure (7 chapters + appendix)

1. **摘要 (Abstract)** — System overview, tech stack, key innovations, results
2. **课程设计的目的和需求 (Requirements)** — Purpose, user roles, use cases, functional/non-functional requirements
3. **概念结构设计 (Conceptual Design)** — Entity identification, attributes, relationships, E-R diagram
4. **逻辑结构设计 (Logical Design)** — E-R to relational mapping, relation schemas, integrity constraints, normalization
5. **物理结构设计 (Physical Design)** — DBMS selection, field types, index design, DDL
6. **系统功能实现与测试 (Implementation & Testing)** — Architecture, backend core, frontend components, API design, sequence diagrams, test cases
7. **分析与总结 (Summary)** — Success metrics, reflections, future improvements
8. **附录 (Appendix)** — AI-assisted development methods (models, prompts, workflow)
9. **参考文献 (References)** — Academic citation format

## How to Write `build_report.js`

Import the toolkit:

```js
const { P, PR, run, H1, H2, H3, CODE, TABLE, TAB_CAPTION, IMG, FIG_CAPTION, REF, REF_HEADING, buildDocx, FONT_OBJ, SIZE_BODY, SIZE_HEAD, SIZE_TABLE, AlignmentType, Paragraph, TextRun, PageBreak } = require('./docx-kit');
```

### Available Helpers

| Function | Purpose |
|----------|---------|
| `P(text)` | Body paragraph with first-line indent |
| `PR(runs)` | Paragraph with mixed formatting (bold/italic via `run()`) |
| `H1(text)` / `H2(text)` / `H3(text)` | Section headings |
| `CODE(text)` | Monospace code block |
| `TABLE(headers, rows, colWidths)` | Three-line academic table |
| `TAB_CAPTION(text)` | Table caption (centered, 五号) |
| `IMG(filename)` | Insert PNG from `scripts/figures/` with auto-fit |
| `FIG_CAPTION(text)` | Figure caption (centered, 宋体小四) |
| `REF(text)` | Reference entry (五号, hanging indent) |
| `REF_HEADING()` | "参考文献" heading |
| `PAGE_BREAK()` | Page break |
| `buildDocx({title, creator, chapters, outputPath})` | Assemble and output .docx |

### Chapter Assembly Pattern

Each chapter is a `const CH_N = [...]` array of paragraph/table/image elements. The final document assembles them:

```js
buildDocx({
  title: '项目名课程设计',
  creator: '项目名课程设计',
  chapters: [...TITLE_BLOCK, ...CH1, ...CH2, ...CH3, ...CH4, ...CH5, ...CH6, ...CH7, ...APPENDIX, ...REFS],
  outputPath: path.join(__dirname, '..', '项目名-课程设计报告.docx')
});
```

## Mermaid Diagrams

Place `.mmd` source files in `scripts/figures/`. Render with:

```bash
node scripts/render_mermaid.js
```

Use `IMG('filename.png')` to insert the rendered PNG. All diagrams should use a consistent theme:

```
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#dce8fc', ...}}}%%
```

## Formatting Rules

- Body text: 宋体 + Times New Roman, 小四 (12pt), single line spacing, first-line indent
- H1: 四号 (14pt) bold; H2: 四号 unbold; H3: 小四 bold
- Code: Consolas 五号 (10pt)
- Tables: three-line borders (thick top/bottom, thin header separator), 五号 (10.5pt)
- References: 五号, hanging indent
- Images: auto-scaled to 460px max width (≈A4 text area)

## Verification

After writing `build_report.js`:

```bash
cd scripts && node build_report.js
```

Output shows file path and size. Open the .docx to verify formatting.
