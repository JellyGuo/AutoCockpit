import { defineStore } from 'pinia'

/**
 * 小憩会话 store（对应任务 #3 的座椅/按摩状态切片）。
 * 说明：本任务（#4）仅落座椅角度与按摩相关的状态与 action；
 * 其余会话字段（背景/时段/氛围/时长/会话生命周期）由 #3/#9 在同一 store 内扩展。
 * 字段命名保持独立、语义清晰，便于集成阶段合并去重。
 */

/** 按摩模式枚举 */
export type MassageMode = 'wave' | 'pulse' | 'knead'

export const MASSAGE_MODES: { value: MassageMode; label: string }[] = [
  { value: 'wave', label: '波浪' },
  { value: 'pulse', label: '脉冲' },
  { value: 'knead', label: '揉捏' },
]

/** 座椅角度可调区间（度）：90 直立 ~ 160 平躺 */
export const SEAT_ANGLE_MIN = 90
export const SEAT_ANGLE_MAX = 160

/** 座椅角度档位预设 */
export const SEAT_ANGLE_PRESETS: { value: number; label: string }[] = [
  { value: 95, label: '直立' },
  { value: 115, label: '倚靠' },
  { value: 135, label: '半躺' },
  { value: 158, label: '平躺' },
]

/** 按摩强度区间（1~5 档） */
export const MASSAGE_INTENSITY_MIN = 1
export const MASSAGE_INTENSITY_MAX = 5

interface SeatMassageState {
  /** 当前座椅靠背角度（度） */
  seatAngle: number
  /** 按摩是否开启 */
  massageOn: boolean
  /** 按摩强度档位（1~5） */
  massageIntensity: number
  /** 按摩模式 */
  massageMode: MassageMode
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export const useRestSessionStore = defineStore('restSession', {
  state: (): SeatMassageState => ({
    seatAngle: 115,
    massageOn: false,
    massageIntensity: 2,
    massageMode: 'wave',
  }),
  getters: {
    /** 座椅角度在可调区间内的归一化进度 0~1，供可视化使用 */
    seatAngleRatio(state): number {
      return (state.seatAngle - SEAT_ANGLE_MIN) / (SEAT_ANGLE_MAX - SEAT_ANGLE_MIN)
    },
    /** 当前是否命中某个角度档位 */
    activeSeatPreset(state): number | null {
      const hit = SEAT_ANGLE_PRESETS.find((p) => p.value === state.seatAngle)
      return hit ? hit.value : null
    },
  },
  actions: {
    /** 设置座椅角度（滑动/档位统一入口），自动 clamp 到合法区间并取整 */
    setSeatAngle(angle: number) {
      this.seatAngle = clamp(Math.round(angle), SEAT_ANGLE_MIN, SEAT_ANGLE_MAX)
    },
    /** 开关按摩 */
    setMassageOn(on: boolean) {
      this.massageOn = on
    },
    toggleMassage() {
      this.massageOn = !this.massageOn
    },
    /** 设置按摩强度，clamp 到 1~5；设置强度视为已开启按摩 */
    setMassageIntensity(level: number) {
      this.massageIntensity = clamp(
        Math.round(level),
        MASSAGE_INTENSITY_MIN,
        MASSAGE_INTENSITY_MAX,
      )
    },
    /** 选择按摩模式 */
    setMassageMode(mode: MassageMode) {
      this.massageMode = mode
    },
  },
})
