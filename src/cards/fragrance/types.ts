// 香氛释放卡片相关类型与预设（任务 #6）
// 仅前端状态模拟，不对接真实车控硬件。

/** 香型标识 */
export type ScentId = 'forest' | 'ocean' | 'citrus' | 'lavender' | 'tea'

/** 香型预设定义 */
export interface ScentPreset {
  id: ScentId
  /** 展示名称 */
  label: string
  /** 简短描述，用于即时反馈文案 */
  desc: string
  /** 代表色，用于卡片氛围反馈 */
  color: string
  /** emoji 图标，纯视觉点缀 */
  icon: string
}

/** 释放强度范围（连续调节） */
export const INTENSITY_MIN = 0
export const INTENSITY_MAX = 100
export const INTENSITY_STEP = 1
export const DEFAULT_INTENSITY = 40

/** 可选香型预设列表 */
export const SCENT_PRESETS: readonly ScentPreset[] = [
  { id: 'forest', label: '森林', desc: '雪松与松针的清冽木质香', color: '#4c9a6b', icon: '🌲' },
  { id: 'ocean', label: '海洋', desc: '咸润海风的通透水生香', color: '#3d8bd6', icon: '🌊' },
  { id: 'citrus', label: '柑橘', desc: '佛手柑与甜橙的明亮果香', color: '#e6a33e', icon: '🍊' },
  { id: 'lavender', label: '薰衣草', desc: '安神舒缓的紫调花香', color: '#8b7ad0', icon: '💜' },
  { id: 'tea', label: '白茶', desc: '淡雅回甘的清新茶香', color: '#8fb98a', icon: '🍃' },
] as const

/** 默认香型 */
export const DEFAULT_SCENT: ScentId = 'forest'

/** 根据 id 获取香型预设 */
export function getScentPreset(id: ScentId): ScentPreset {
  return SCENT_PRESETS.find((s) => s.id === id) ?? SCENT_PRESETS[0]
}
