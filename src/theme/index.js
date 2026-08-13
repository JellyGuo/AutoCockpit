/**
 * 主题系统对外入口。
 * 集成/组件侧统一从此处消费：
 *   import { ThemeProvider, useTheme } from './theme';
 */
export { ThemeProvider } from './ThemeProvider.jsx';
export { useTheme } from './useTheme.js';
export { ThemeContext } from './ThemeContext.js';
export { getSystemTheme, subscribeSystemTheme } from './systemTheme.js';
