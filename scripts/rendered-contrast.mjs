/**
 * 渲染态可读性校验（任务 #7）——直接在浏览器中量测真实渲染结果。
 * ------------------------------------------------------------------
 * 相比只解析 tokens.css，本脚本在 16:9 视口、分别模拟系统浅/深偏好下加载整页，
 * 读取关键文本节点的 computed color 与其“有效背景色”（沿祖先链做 alpha 合成，
 * 兜底到 body 背景），据此计算 WCAG 相对对比度并断言 ≥ 4.5:1（AA 正文阈值）。
 * 这样能捕获「卡片背景 token 缺失导致暗色主题下浅字浮于浅底」这类集成缺陷。
 *
 * 依赖已构建的 dist/（先 npm run build）。退出码：全部达标 0，否则 1。
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const AA = 4.5;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = join(DIST, p);
  const target = existsSync(fp) ? fp : join(DIST, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[extname(target)] || 'application/octet-stream' });
  res.end(readFileSync(target));
});

// 关键文本节点选择器（四卡 + 地图浮层的核心可读文本）
const SELECTORS = [
  '.vehicle-status-card__header',
  '.vehicle-status-card__value',
  '.vehicle-status-card__label',
  '.time-weather-card__time',
  '.time-weather-card__date',
  '.time-weather-card__weather-temp',
  '.climate-card__header',
  '.climate-card__temp-value',
  '.media-card__title',
  '.media-card__artist',
  '.map-panel__overlay-title',
  '.map-panel__overlay-sub',
  '.map-panel__badge',
];

// 浏览器内执行：量测某选择器文本的真实对比度
const PROBE = (selectors) => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const effBg = (el) => {
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    const chain = [];
    let n = el;
    while (n) { chain.push(n); n = n.parentElement; }
    // 从最外层往内合成
    let acc = parse(getComputedStyle(document.body).backgroundColor) || bg;
    if (acc.a === 0) acc = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = chain.length - 1; i >= 0; i--) {
      const c = parse(getComputedStyle(chain[i]).backgroundColor);
      if (c && c.a > 0) acc = over(c, acc);
    }
    return acc;
  };
  const lum = ({ r, g, b }) => {
    const f = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const out = [];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) { out.push({ sel, found: false }); continue; }
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const bg = effBg(el);
    const composedFg = fg.a < 1 ? over(fg, bg) : fg;
    out.push({ sel, found: true, ratio: ratio(composedFg, bg), color: cs.color });
  }
  return out;
};

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const browser = await chromium.launch();

let allPass = true;
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.card-carousel');
  // 依次切到每张卡片量测（翻页容器仅渲染当前页文本）
  const label = scheme === 'light' ? '日间 light' : '夜间 dark';
  console.log(`\n== ${label} ==`);
  const dots = await page.$$('.card-carousel__dot');
  const seen = new Set();
  for (let d = 0; d < dots.length; d++) {
    await dots[d].click();
    await page.waitForTimeout(150);
    const res = await page.evaluate(PROBE, SELECTORS);
    for (const r of res) {
      if (!r.found || seen.has(r.sel)) continue;
      seen.add(r.sel);
      const pass = r.ratio >= AA;
      if (!pass) allPass = false;
      console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${r.sel.padEnd(34)} ${r.ratio.toFixed(2)}:1  (${r.color})`);
    }
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`\n渲染态结果：${allPass ? '全部关键文本对比度达到 WCAG AA (>=4.5:1)' : '存在未达标项'}`);
process.exit(allPass ? 0 : 1);
