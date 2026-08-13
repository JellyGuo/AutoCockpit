import { createContext } from 'react';

/**
 * 全局主题上下文。
 * @typedef {Object} ThemeContextValue
 * @property {'light' | 'dark'} theme  当前生效主题（跟随系统）
 * @property {boolean} isDark          是否为深色主题的便捷布尔
 *
 * 默认值为 null，供 useTheme 检测是否被 ThemeProvider 包裹。
 * @type {import('react').Context<ThemeContextValue | null>}
 */
export const ThemeContext = createContext(null);
