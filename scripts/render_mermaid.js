/**
 * 将 figures/*.mmd 文件渲染为 PNG，通过 mermaid.ink 在线 API
 * 用法: node render_mermaid.js
 *
 * 特殊处理：序列图等含中文/换行的用 POST 方式提交；
 * 简单的 E-R/流程图用 GET 方式（base64-url）。
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FIG_DIR = path.join(__dirname, 'figures');

function encodeMermaid(graph) {
  return Buffer.from(graph, 'utf-8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fetchPng(url, outPath) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPng(res.headers.location, outPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', c => body += c.toString());
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`)));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(outPath, buffer);
        resolve(buffer.length);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function postPng(graph, outPath) {
  return new Promise((resolve, reject) => {
    // kroki.io 支持 mermaid POST 接口，对中文更友好
    const url = new URL('https://kroki.io/mermaid/png');
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(graph, 'utf-8'),
      }
    }, res => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', c => body += c.toString());
        res.on('end', () => reject(new Error(`Kroki HTTP ${res.statusCode}: ${body.slice(0, 300)}`)));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(outPath, buffer);
        resolve(buffer.length);
      });
      res.on('error', reject);
    });
    req.write(graph, 'utf-8');
    req.end();
  });
}

async function main() {
  const mmds = fs.readdirSync(FIG_DIR).filter(f => f.endsWith('.mmd'));
  console.log(`找到 ${mmds.length} 个 mermaid 源文件`);

  for (const file of mmds) {
    const src = fs.readFileSync(path.join(FIG_DIR, file), 'utf-8');
    const outPath = path.join(FIG_DIR, file.replace('.mmd', '.png'));
    // 统一使用 kroki.io POST（中文兼容、无 URL 长度限制）
    try {
      const size = await postPng(src, outPath);
      console.log(`  ✓ ${file} → ${path.basename(outPath)} (${(size/1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  ✗ ${file} 失败: ${err.message}`);
      process.exit(1);
    }
  }
  console.log('全部渲染完成');
}

main();
