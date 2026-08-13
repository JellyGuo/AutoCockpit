/**
 * 可量化可读性校验：WCAG AA 关键文本对比度检查（任务 #7）
 * ------------------------------------------------------------------
 * 直接解析 src/theme/tokens.css 中的日(light)/夜(dark)两套 CSS 变量真实取值，
 * 对「关键文本 / 背景」组合计算 WCAG 相对对比度，断言均 ≥ 4.5:1（AA 正文阈值）。
 * 无第三方依赖，纯 Node ESM，可在 CI/本地作为客观可读性证据运行。
 *
 * 退出码：全部达标 -> 0；任一未达标 -> 1。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, '../src/theme/tokens.css');
const AA_THRESHOLD = 4.5; // WCAG AA 正文对比度阈值

// ---- 颜色解析与 WCAG 对比度计算 ----
function hexToRgb(hex) {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function relativeLuminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexToRgb(hexA));
  const l2 = relativeLuminance(hexToRgb(hexB));
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---- 从 tokens.css 中提取某个选择器块内的变量 ----
function extractVars(css, selector) {
  const idx = css.indexOf(selector);
  if (idx === -1) throw new Error(`未找到选择器：${selector}`);
  const open = css.indexOf('{', idx);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const vars = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

const css = readFileSync(TOKENS_PATH, 'utf8');
// 浅色：默认块同时挂在 :root 与 :root[data-theme='light']
const light = extractVars(css, ":root[data-theme='light']");
const dark = extractVars(css, ":root[data-theme='dark']");

// ---- 关键文本 / 背景组合（各主题）----
function keyPairs(vars) {
  return [
    { name: '正文主文本 / 卡片表面', fg: vars['--color-text-primary'], bg: vars['--color-surface'] },
    { name: '正文主文本 / 页面背景', fg: vars['--color-text-primary'], bg: vars['--color-bg'] },
    { name: '次级文本 / 卡片表面', fg: vars['--color-text-secondary'], bg: vars['--color-surface'] },
    { name: '弱化文本 / 卡片表面', fg: vars['--color-text-muted'], bg: vars['--color-surface'] },
    { name: '强调按钮文字 / 强调色', fg: vars['--color-accent-contrast'], bg: vars['--color-accent'] },
  ];
}

const themes = [
  { label: '日间 light', pairs: keyPairs(light) },
  { label: '夜间 dark', pairs: keyPairs(dark) },
];

let allPass = true;
for (const theme of themes) {
  console.log(`\n== ${theme.label} ==`);
  for (const p of theme.pairs) {
    const ratio = contrastRatio(p.fg, p.bg);
    const pass = ratio >= AA_THRESHOLD;
    if (!pass) allPass = false;
    console.log(
      `  [${pass ? 'PASS' : 'FAIL'}] ${p.name.padEnd(20)} ` +
        `${p.fg} on ${p.bg} = ${ratio.toFixed(2)}:1 (阈值 ${AA_THRESHOLD}:1)`
    );
  }
}

console.log(
  `\n结果：${allPass ? '全部关键文本对比度达到 WCAG AA (>=4.5:1)' : '存在未达标项'}`
);
process.exit(allPass ? 0 : 1);
