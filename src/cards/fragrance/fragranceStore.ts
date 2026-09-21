import { defineStore } from 'pinia'
import {
  DEFAULT_INTENSITY,
  DEFAULT_SCENT,
  INTENSITY_MAX,
  INTENSITY_MIN,
  SCENT_PRESETS,
  getScentPreset,
  type ScentId,
  type ScentPreset,
} from './types'

/**
 * 香氛释放状态（任务 #6）。
 *
 * 作为香氛卡片的状态契约，独立的 Pinia store 模块，便于并行开发与集成时被主 store 组合。
 * 满足验收标准「状态同步到 store」。
 */
interface FragranceState {
  /** 香氛总开关 */
  on: boolean
  /** 当前选中的香型 */
  scent: ScentId
  /** 释放强度 0-100（连续调节） */
  intensity: number
}

function clampIntensity(value: number): number {
  if (Number.isNaN(value)) return INTENSITY_MIN
  return Math.min(INTENSITY_MAX, Math.max(INTENSITY_MIN, Math.round(value)))
}

export const useFragranceStore = defineStore('fragrance', {
  state: (): FragranceState => ({
    on: false,
    scent: DEFAULT_SCENT,
    intensity: DEFAULT_INTENSITY,
  }),

  getters: {
    /** 当前香型的完整预设，供界面即时反馈 */
    currentPreset(state): ScentPreset {
      return getScentPreset(state.scent)
    },
    /** 可选香型列表 */
    presets(): readonly ScentPreset[] {
      return SCENT_PRESETS
    },
    /** 有效释放（开启且强度大于 0）时的实际输出强度，供联动/可视化使用 */
    effectiveIntensity(state): number {
      return state.on ? state.intensity : 0
    },
  },

  actions: {
    /** 切换香氛开关 */
    toggle() {
      this.on = !this.on
    },
    /** 显式设置开关状态 */
    setOn(on: boolean) {
      this.on = on
    },
    /** 选择香型；若当前关闭则自动开启，符合「开启香氛并选择香型」场景 */
    selectScent(scent: ScentId) {
      this.scent = scent
      if (!this.on) this.on = true
    },
    /** 调节释放强度（连续），自动夹取到合法范围 */
    setIntensity(value: number) {
      this.intensity = clampIntensity(value)
    },
  },
})
