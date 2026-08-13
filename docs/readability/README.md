# 可读性证据（任务 #7 页面集成联调）

本目录留存日/夜双主题整页截图对比，作为「所有卡片与地图占位内容清晰可读」的客观证据。

| 主题 | 截图 |
| ---- | ---- |
| 日间（light，模拟 `prefers-color-scheme: light`） | `day.png` |
| 夜间（dark，模拟 `prefers-color-scheme: dark`） | `night.png` |

截图在 1280×720（16:9）视口下、由无头 Chromium 加载整页构建产物生成，两次分别模拟系统浅色/深色偏好。

## 可量化对比度校验

关键文本对比度均达到 WCAG AA（≥ 4.5:1），两条脚本可复现：

- `npm run verify:contrast` — 解析 `src/theme/tokens.css` 中日/夜两套 token，
  计算关键「文本/背景」组合的 WCAG 对比度。
- `npm run verify:readability` — 构建后由无头浏览器加载整页，逐张卡片读取
  **真实渲染**的 computed color 与有效背景（含 alpha 合成），计算对比度。
  这条能捕获「跨组件 token 命名不一致导致暗色主题浅字浮浅底」这类集成缺陷。

## 集成期修正记录

集成联调中发现四张卡片与地图浮层消费的若干 CSS 变量
（`--color-card-bg`、`--color-map-surface`、`--color-map-overlay-bg`、
`--color-on-accent`、`--color-surface-strong` 等）未在主题系统中定义，
导致暗色主题下背景仍走浅色兜底、浅色文本浮于浅底（实测对比度低至 1.05:1）。
已在 `src/theme/tokens.css` 为日/夜两套主题补齐这些对齐 token，
修正后全部关键文本在两套主题下对比度均 ≥ 4.5:1。

## 重新生成

```bash
npm install
npx playwright install chromium   # 首次需要
npm run screenshots               # 重新生成 day.png / night.png
```
