/**
 * 日/夜双主题整页截图（任务 #7 可读性证据）
 * ------------------------------------------------------------------
 * 以预览服务器加载已构建的整页，在 16:9 视口下分别模拟系统浅色 / 深色偏好，
 * 各截取一张整页截图，作为「日/夜双主题内容清晰可读」的客观对比证据。
 * 输出：docs/readability/day.png、docs/readability/night.png
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const OUT = resolve(__dirname, '../docs/readability');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

// 极简静态服务器，托管 dist/
const server = createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = join(DIST, urlPath);
  if (!existsSync(filePath)) {
    // SPA 回退到 index.html
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync(join(DIST, 'index.html')));
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

const VIEWPORT = { width: 1280, height: 720 }; // 16:9

async function shoot(browser, scheme, file) {
  const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: scheme });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
  // 等待卡片与地图挂载
  await page.waitForSelector('.card-carousel', { timeout: 5000 });
  await page.waitForSelector('.map-panel', { timeout: 5000 });
  await page.waitForTimeout(300);
  const theme = await page.getAttribute('html', 'data-theme');
  await page.screenshot({ path: join(OUT, file) });
  await context.close();
  return { scheme, theme, errors };
}

let PORT = 0;
await new Promise((r) => server.listen(0, '127.0.0.1', r));
PORT = server.address().port;

const browser = await chromium.launch();
const results = [];
results.push(await shoot(browser, 'light', 'day.png'));
results.push(await shoot(browser, 'dark', 'night.png'));
await browser.close();
server.close();

let ok = true;
for (const r of results) {
  const clean = r.errors.length === 0;
  if (!clean) ok = false;
  console.log(
    `[${clean ? 'OK' : 'CONSOLE-ERROR'}] scheme=${r.scheme} -> data-theme=${r.theme}` +
      (clean ? ' 无控制台报错' : ` errors=${JSON.stringify(r.errors)}`)
  );
}
console.log(ok ? '\n日/夜截图已生成，且渲染无控制台报错。' : '\n检测到控制台报错。');
process.exit(ok ? 0 : 1);
