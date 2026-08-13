import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.js';
import { getSystemTheme, subscribeSystemTheme } from './systemTheme.js';
import './tokens.css';

// SSR 无 DOM 时退化为普通 effect，避免 useLayoutEffect 警告。
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * 全局主题 Provider。
 * - 启动时按系统 prefers-color-scheme 选定初始主题。
 * - 订阅系统深浅色变化并实时跟随切换。
 * - 将当前主题写入 <html data-theme>，驱动 tokens.css 中的 CSS 变量整页生效。
 * - 通过 ThemeContext 暴露 { theme, isDark } 供任意组件消费。
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function ThemeProvider({ children }) {
  // 初始值在首次渲染即读取系统偏好，保证启动主题与系统一致。
  const [theme, setTheme] = useState(getSystemTheme);

  // 跟随系统深浅色变化。
  useEffect(() => {
    // 订阅前再取一次，弥补挂载与初始化之间可能发生的变化。
    setTheme(getSystemTheme());
    return subscribeSystemTheme(setTheme);
  }, []);

  // 把主题落到 <html data-theme>，让 CSS 变量作用于全局。
  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, isDark: theme === 'dark' }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
