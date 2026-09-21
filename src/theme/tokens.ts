/**
 * 放松风格主题令牌（单一事实来源）
 *
 * 集中定义配色、间距、圆角、模糊度与字体等设计令牌，供全部视觉组件引用。
 * 同一批令牌以 CSS 自定义属性形式镜像在 `theme.css` 中（键名与本文件保持一致），
 * 组件样式优先通过 `var(--xxx)` 消费；本 TS 模块用于脚本侧读取与类型约束。
 */

/** 放松风格配色 —— 低饱和、暖冷过渡的沉浸底色，配合毛玻璃层次。 */
export const colors = {
  /** 主强调色：舒缓青蓝 */
  accent: '#7fb8c4',
  /** 次强调色：暖霞粉 */
  accentSoft: '#e6b8a2',
  /** 前景文字（浅色，用于深色风景背景之上） */
  textPrimary: 'rgba(255, 255, 255, 0.92)',
  /** 次级前景文字 */
  textSecondary: 'rgba(255, 255, 255, 0.68)',
  /** 毛玻璃卡片填充（半透明白，磨砂层次） */
  glassFill: 'rgba(255, 255, 255, 0.14)',
  /** 毛玻璃卡片高亮填充（悬浮/激活态） */
  glassFillStrong: 'rgba(255, 255, 255, 0.22)',
  /** 毛玻璃描边（顶部高光边界） */
  glassBorder: 'rgba(255, 255, 255, 0.28)',
  /** 卡片投影颜色 */
  shadow: 'rgba(16, 24, 40, 0.35)',
  /** 背景兜底底色（图片加载前/淡入过渡时） */
  backdrop: '#1b2431',
} as const

/** 间距刻度（px），用于内外边距与栅格间隙。 */
export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '20px',
  lg: '32px',
  xl: '48px',
} as const

/** 圆角刻度（px），放松风格偏大圆角。 */
export const radius = {
  sm: '12px',
  md: '20px',
  lg: '28px',
  pill: '999px',
} as const

/** 毛玻璃模糊度（backdrop-filter blur 半径）。 */
export const blur = {
  sm: '8px',
  md: '16px',
  lg: '24px',
} as const

/** 字体令牌。 */
export const typography = {
  fontFamily:
    "'Inter', 'PingFang SC', 'Helvetica Neue', 'Segoe UI', system-ui, -apple-system, sans-serif",
  /** 字号刻度 */
  sizeSm: '14px',
  sizeMd: '18px',
  sizeLg: '24px',
  sizeXl: '36px',
  /** 字重 */
  weightRegular: 400,
  weightMedium: 500,
  weightBold: 700,
  /** 行高 */
  lineHeight: 1.5,
} as const

/** 过渡时长令牌（背景交叉淡入淡出等动效复用）。 */
export const motion = {
  /** 快速反馈（悬浮/点击态） */
  fast: '180ms',
  /** 常规过渡 */
  normal: '320ms',
  /** 背景交叉淡入淡出时长 */
  crossfade: '900ms',
  /** 缓动曲线 */
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

/** 汇总导出，便于整体引用。 */
export const theme = {
  colors,
  spacing,
  radius,
  blur,
  typography,
  motion,
} as const

export type Theme = typeof theme
