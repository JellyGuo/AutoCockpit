import { defineStore } from 'pinia'

/**
 * 小憩会话 store（对应任务 #3 的遮阳帘/车窗状态切片）。
 * 说明：本任务（#7）仅落遮阳帘开合度与车窗升降度相关的状态与 action；
 * 其余会话字段（背景/时段/氛围/时长/会话生命周期/座椅/香氛等）由 #3/#9
 * 在同一 store 内扩展。字段命名保持独立、语义清晰，便于集成阶段合并去重。
 */

/** 遮阳帘/车窗百分比区间：0 = 完全关闭（帘全开/窗全升），100 = 完全打开（帘全合/窗全降） */
export const OPENNESS_MIN = 0
export const OPENNESS_MAX = 100

/** 遮阳帘开合度档位预设（0 全开 ~ 100 全合） */
export const SHADE_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: '全开' },
  { value: 50, label: '半遮' },
  { value: 100, label: '全合' },
]

/** 车窗升降度档位预设（0 全升/关闭 ~ 100 全降/开启） */
export const WINDOW_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: '关闭' },
  { value: 25, label: '通风' },
  { value: 50, label: '半降' },
  { value: 100, label: '全开' },
]

interface ShadeWindowState {
  /** 遮阳帘开合度（0~100，越大越遮蔽） */
  shadeOpenness: number
  /** 车窗升降度（0~100，越大车窗降得越低/开得越大） */
  windowOpenness: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export const useRestSessionStore = defineStore('restSession', {
  state: (): ShadeWindowState => ({
    shadeOpenness: 0,
    windowOpenness: 0,
  }),
  getters: {
    /** 遮阳帘开合度归一化比例 0~1，供可视化使用 */
    shadeRatio(state): number {
      return (state.shadeOpenness - OPENNESS_MIN) / (OPENNESS_MAX - OPENNESS_MIN)
    },
    /** 车窗升降度归一化比例 0~1，供可视化使用 */
    windowRatio(state): number {
      return (state.windowOpenness - OPENNESS_MIN) / (OPENNESS_MAX - OPENNESS_MIN)
    },
    /** 当前遮阳帘是否命中某个档位 */
    activeShadePreset(state): number | null {
      const hit = SHADE_PRESETS.find((p) => p.value === state.shadeOpenness)
      return hit ? hit.value : null
    },
    /** 当前车窗是否命中某个档位 */
    activeWindowPreset(state): number | null {
      const hit = WINDOW_PRESETS.find((p) => p.value === state.windowOpenness)
      return hit ? hit.value : null
    },
  },
  actions: {
    /** 设置遮阳帘开合度（滑动/档位统一入口），自动 clamp 到合法区间并取整 */
    setShadeOpenness(value: number) {
      this.shadeOpenness = clamp(Math.round(value), OPENNESS_MIN, OPENNESS_MAX)
    },
    /** 设置车窗升降度（滑动/档位统一入口），自动 clamp 到合法区间并取整 */
    setWindowOpenness(value: number) {
      this.windowOpenness = clamp(Math.round(value), OPENNESS_MIN, OPENNESS_MAX)
    },
  },
})
