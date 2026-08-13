import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.js';

/**
 * 消费全局主题上下文。必须在 <ThemeProvider> 内使用。
 * @returns {import('./ThemeContext.js').ThemeContextValue}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error('useTheme 必须在 <ThemeProvider> 内使用');
  }
  return ctx;
}
