/**
 * 系统主题（prefers-color-scheme）读取与订阅的纯逻辑。
 * 抽离为不依赖 React 的模块，便于单元测试与在 ThemeProvider 中复用。
 */

/** @typedef {'light' | 'dark'} ThemeName */

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * 获取当前系统主题。无 matchMedia（如 SSR/老环境）时降级为 'light'。
 * @param {Window | undefined} [win]
 * @returns {ThemeName}
 */
export function getSystemTheme(win = typeof window !== 'undefined' ? window : undefined) {
  if (!win || typeof win.matchMedia !== 'function') return 'light';
  return win.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/**
 * 订阅系统深浅色变化。系统偏好切换时以最新主题回调。
 * 返回取消订阅函数；无 matchMedia 时为无操作。
 * @param {(theme: ThemeName) => void} onChange
 * @param {Window | undefined} [win]
 * @returns {() => void}
 */
export function subscribeSystemTheme(
  onChange,
  win = typeof window !== 'undefined' ? window : undefined
) {
  if (!win || typeof win.matchMedia !== 'function') return () => {};

  const mql = win.matchMedia(DARK_QUERY);
  const handler = (event) => onChange(event.matches ? 'dark' : 'light');

  // 新标准用 addEventListener；Safari <14 等旧环境降级用 addListener。
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }
  if (typeof mql.addListener === 'function') {
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }
  return () => {};
}
