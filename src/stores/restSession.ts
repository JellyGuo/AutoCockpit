/**
 * 小憩会话状态与联动核心（Pinia Store）
 *
 * 统一管理驻车小憩场景的全部可联动状态，并作为跨卡片集成的**单一数据契约**：
 *  - 时段 / 背景：当前时段与其对应的风景背景源，切换时段即联动切换风景。
 *  - 氛围参数：氛围灯颜色 / 亮度驱动的整体氛围（供背景遮罩、灯光预览联动消费）。
 *  - 各功能卡片状态：座椅角度 / 按摩、氛围灯、背景音乐 / 白噪音、香氛、遮阳帘 / 车窗。
 *  - 会话生命周期：小憩时长、运行 / 结束状态、倒计时剩余与唤醒阶段。
 *
 * 采用 setup 风格 store 以获得最佳 TS 推断；所有状态变更均通过导出的 action 完成，
 * 供功能卡片点击 / 拖动时驱动背景、氛围与时段风景切换。
 */
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

/* -------------------------------------------------------------------------- */
/*                              数据契约：类型定义                              */
/* -------------------------------------------------------------------------- */

/** 时段：黎明 / 白昼 / 黄昏 / 夜晚，决定风景背景与整体色调。 */
export type TimePeriod = 'dawn' | 'day' | 'dusk' | 'night'

/** 会话阶段：空闲 → 运行（倒计时）→ 唤醒（渐亮 + 舒缓音乐）→ 结束。 */
export type SessionPhase = 'idle' | 'running' | 'waking' | 'finished'

/** 按摩模式；`off` 表示未选择具体模式（按摩关闭时）。 */
export type MassageMode = 'off' | 'wave' | 'knead' | 'pulse' | 'shiatsu'

/** 音频类别：背景音乐 / 白噪音。 */
export type AudioCategory = 'music' | 'whiteNoise'

/** 座椅与按摩状态。 */
export interface SeatState {
  /** 座椅靠背角度（度），90=直立，180=全平。 */
  angle: number
  /** 按摩开关。 */
  massageOn: boolean
  /** 按摩模式。 */
  massageMode: MassageMode
  /** 按摩强度 0~3。 */
  massageIntensity: number
}

/** 氛围灯状态；其颜色 / 亮度同时驱动整体氛围（ambiance）。 */
export interface AmbientLightState {
  /** 氛围灯开关。 */
  on: boolean
  /** 灯光颜色（合法 CSS 颜色，通常为 hex）。 */
  color: string
  /** 灯光亮度 0~100。 */
  brightness: number
}

/** 背景音乐 / 白噪音状态。 */
export interface AudioState {
  /** 当前类别。 */
  category: AudioCategory
  /** 当前曲目 / 音源标识（无选择时为 null）。 */
  trackId: string | null
  /** 是否正在播放。 */
  playing: boolean
  /** 音量 0~100。 */
  volume: number
}

/** 香氛状态。 */
export interface FragranceState {
  /** 香氛开关。 */
  on: boolean
  /** 香型标识（如 'forest' | 'ocean' | 'citrus'）。 */
  scent: string
  /** 释放强度 0~100。 */
  intensity: number
}

/** 遮阳帘 / 车窗开合状态（0=全关，100=全开）。 */
export interface ShadeWindowState {
  /** 遮阳帘开合度 0~100。 */
  shade: number
  /** 车窗升降度 0~100（0=升到顶/全关，100=降到底/全开）。 */
  window: number
}

/** 整体氛围参数（联动消费方读取此处，而非直接耦合氛围灯卡片）。 */
export interface AmbianceState {
  /** 氛围主色。 */
  color: string
  /** 氛围强度 0~100（映射灯光亮度，唤醒时由暗渐亮）。 */
  brightness: number
}

/* -------------------------------------------------------------------------- */
/*                                默认值 / 常量                                */
/* -------------------------------------------------------------------------- */

/** 时段顺序，供 `cyclePeriod` 循环推进与 UI 遍历。 */
export const TIME_PERIODS: readonly TimePeriod[] = ['dawn', 'day', 'dusk', 'night'] as const

/**
 * 各时段默认风景背景源。
 * 使用 CSS 渐变字符串作为无图片资源时的兜底，直接可被 `BackgroundScene` 的 `src` 消费；
 * 集成阶段可用真实风景图片 URL 覆盖（见 `setPeriodBackground` / `setBackground`）。
 */
export const DEFAULT_SCENE_BY_PERIOD: Record<TimePeriod, string> = {
  dawn: 'linear-gradient(160deg, #f6d3b5 0%, #e6a1a8 45%, #7d6ea8 100%)',
  day: 'linear-gradient(160deg, #8ec5e6 0%, #6fa8d6 50%, #4a7bb0 100%)',
  dusk: 'linear-gradient(160deg, #f0a978 0%, #c96b8e 50%, #55407a 100%)',
  night: 'linear-gradient(160deg, #2b3a67 0%, #1b2431 60%, #0d1420 100%)',
}

/** 各时段对应的氛围主色（时段切换时联动更新氛围）。 */
export const DEFAULT_AMBIANCE_BY_PERIOD: Record<TimePeriod, string> = {
  dawn: '#e6b8a2',
  day: '#7fb8c4',
  dusk: '#d98a6a',
  night: '#5566a8',
}

/** 小憩时长边界（分钟）。 */
export const MIN_DURATION_MINUTES = 1
export const MAX_DURATION_MINUTES = 120
/** 默认小憩时长（分钟）。 */
export const DEFAULT_DURATION_MINUTES = 20

/** 将数值夹到 [min, max] 区间。 */
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

/* -------------------------------------------------------------------------- */
/*                                   Store                                    */
/* -------------------------------------------------------------------------- */

export const useRestSessionStore = defineStore('restSession', () => {
  /* ------------------------------ 时段 / 背景 ------------------------------ */

  /** 当前时段。 */
  const period = ref<TimePeriod>('dusk')

  /** 各时段风景背景源（可被集成阶段替换为真实图片）。 */
  const sceneByPeriod = reactive<Record<TimePeriod, string>>({ ...DEFAULT_SCENE_BY_PERIOD })

  /** 手动覆盖的背景源；为 null 时跟随当前时段。 */
  const backgroundOverride = ref<string | null>(null)

  /** 当前生效的背景源：优先手动覆盖，否则取当前时段的风景。 */
  const currentBackground = computed<string>(
    () => backgroundOverride.value ?? sceneByPeriod[period.value],
  )

  /* -------------------------------- 氛围参数 -------------------------------- */

  const ambiance = reactive<AmbianceState>({
    color: DEFAULT_AMBIANCE_BY_PERIOD.dusk,
    brightness: 70,
  })

  /* ------------------------------ 功能卡片状态 ------------------------------ */

  const seat = reactive<SeatState>({
    angle: 120,
    massageOn: false,
    massageMode: 'off',
    massageIntensity: 1,
  })

  const ambientLight = reactive<AmbientLightState>({
    on: true,
    color: DEFAULT_AMBIANCE_BY_PERIOD.dusk,
    brightness: 70,
  })

  const audio = reactive<AudioState>({
    category: 'music',
    trackId: null,
    playing: false,
    volume: 40,
  })

  const fragrance = reactive<FragranceState>({
    on: false,
    scent: 'forest',
    intensity: 50,
  })

  const shadeWindow = reactive<ShadeWindowState>({
    shade: 0,
    window: 0,
  })

  /* ------------------------------ 会话生命周期 ------------------------------ */

  /** 小憩时长（分钟）。 */
  const durationMinutes = ref<number>(DEFAULT_DURATION_MINUTES)

  /** 会话阶段。 */
  const phase = ref<SessionPhase>('idle')

  /** 倒计时剩余秒数。 */
  const remainingSeconds = ref<number>(0)

  /** 是否处于运行（倒计时）中。 */
  const isRunning = computed(() => phase.value === 'running')

  /** 是否处于唤醒阶段。 */
  const isWaking = computed(() => phase.value === 'waking')

  /** 倒计时进度 0~1（已流逝比例）。 */
  const progress = computed(() => {
    const total = durationMinutes.value * 60
    if (total <= 0) return 0
    return clamp((total - remainingSeconds.value) / total, 0, 1)
  })

  /* -------------------------------------------------------------------------- */
  /*                              Actions（状态变更）                             */
  /* -------------------------------------------------------------------------- */

  /* ---- 时段 / 背景：驱动风景与氛围联动切换 ---- */

  /** 设置时段，联动切换风景背景（清除手动覆盖）与氛围主色。 */
  function setPeriod(next: TimePeriod): void {
    period.value = next
    backgroundOverride.value = null
    const moodColor = DEFAULT_AMBIANCE_BY_PERIOD[next]
    ambiance.color = moodColor
    ambientLight.color = moodColor
  }

  /** 循环推进到下一个时段（黎明→白昼→黄昏→夜晚→黎明）。 */
  function cyclePeriod(): void {
    const idx = TIME_PERIODS.indexOf(period.value)
    const next = TIME_PERIODS[(idx + 1) % TIME_PERIODS.length]
    setPeriod(next)
  }

  /** 手动覆盖当前背景源（点击卡片实时改变背景时使用）。 */
  function setBackground(src: string): void {
    backgroundOverride.value = src
  }

  /** 更新指定时段的风景背景源（如集成阶段注入真实图片）。 */
  function setPeriodBackground(target: TimePeriod, src: string): void {
    sceneByPeriod[target] = src
  }

  /** 清除手动背景覆盖，恢复跟随时段。 */
  function clearBackgroundOverride(): void {
    backgroundOverride.value = null
  }

  /* ---- 氛围参数 ---- */

  /** 设置氛围主色。 */
  function setAmbianceColor(color: string): void {
    ambiance.color = color
  }

  /** 设置氛围强度 0~100。 */
  function setAmbianceBrightness(value: number): void {
    ambiance.brightness = clamp(value, 0, 100)
  }

  /* ---- 座椅 / 按摩 ---- */

  /** 设置座椅角度（90~180 度）。 */
  function setSeatAngle(angle: number): void {
    seat.angle = clamp(angle, 90, 180)
  }

  /** 开关按摩；关闭时模式复位为 off。 */
  function setMassageOn(on: boolean): void {
    seat.massageOn = on
    if (!on) seat.massageMode = 'off'
    else if (seat.massageMode === 'off') seat.massageMode = 'wave'
  }

  /** 选择按摩模式（选择具体模式时自动开启按摩）。 */
  function setMassageMode(mode: MassageMode): void {
    seat.massageMode = mode
    seat.massageOn = mode !== 'off'
  }

  /** 设置按摩强度 0~3。 */
  function setMassageIntensity(intensity: number): void {
    seat.massageIntensity = clamp(Math.round(intensity), 0, 3)
  }

  /* ---- 氛围灯（联动整体氛围）---- */

  /** 开关氛围灯。 */
  function setLightOn(on: boolean): void {
    ambientLight.on = on
  }

  /** 设置氛围灯颜色，并联动更新整体氛围主色。 */
  function setLightColor(color: string): void {
    ambientLight.color = color
    ambiance.color = color
  }

  /** 设置氛围灯亮度 0~100，并联动更新整体氛围强度。 */
  function setLightBrightness(value: number): void {
    const b = clamp(value, 0, 100)
    ambientLight.brightness = b
    ambiance.brightness = b
  }

  /* ---- 背景音乐 / 白噪音 ---- */

  /** 选择音频（指定类别与音源），选择后进入待播放状态。 */
  function selectAudio(category: AudioCategory, trackId: string): void {
    audio.category = category
    audio.trackId = trackId
  }

  /** 播放 / 暂停切换（无选中音源时不生效）。 */
  function togglePlay(): void {
    if (audio.trackId === null) return
    audio.playing = !audio.playing
  }

  /** 显式设置播放状态。 */
  function setPlaying(playing: boolean): void {
    if (playing && audio.trackId === null) return
    audio.playing = playing
  }

  /** 设置音量 0~100。 */
  function setVolume(value: number): void {
    audio.volume = clamp(value, 0, 100)
  }

  /* ---- 香氛 ---- */

  /** 开关香氛。 */
  function setFragranceOn(on: boolean): void {
    fragrance.on = on
  }

  /** 选择香型（选择后自动开启香氛）。 */
  function selectScent(scent: string): void {
    fragrance.scent = scent
    fragrance.on = true
  }

  /** 设置香氛释放强度 0~100。 */
  function setFragranceIntensity(value: number): void {
    fragrance.intensity = clamp(value, 0, 100)
  }

  /* ---- 遮阳帘 / 车窗 ---- */

  /** 设置遮阳帘开合度 0~100。 */
  function setShade(value: number): void {
    shadeWindow.shade = clamp(value, 0, 100)
  }

  /** 设置车窗升降度 0~100。 */
  function setWindow(value: number): void {
    shadeWindow.window = clamp(value, 0, 100)
  }

  /* ---- 会话生命周期编排 ---- */

  /** 设置小憩时长（分钟，夹取到合法区间）。 */
  function setDuration(minutes: number): void {
    durationMinutes.value = clamp(Math.round(minutes), MIN_DURATION_MINUTES, MAX_DURATION_MINUTES)
  }

  /** 启动小憩：进入运行态并按时长初始化倒计时。 */
  function startSession(): void {
    remainingSeconds.value = durationMinutes.value * 60
    phase.value = 'running'
  }

  /** 取消小憩：回到空闲态并清零倒计时。 */
  function cancelSession(): void {
    phase.value = 'idle'
    remainingSeconds.value = 0
  }

  /**
   * 倒计时推进（默认步进 1 秒）；仅在运行态生效。
   * 倒计时归零时自动进入唤醒阶段（渐亮灯光 + 舒缓音乐由 UI 依据 phase 表现）。
   */
  function tick(deltaSeconds = 1): void {
    if (phase.value !== 'running') return
    remainingSeconds.value = Math.max(0, remainingSeconds.value - deltaSeconds)
    if (remainingSeconds.value === 0) {
      phase.value = 'waking'
    }
  }

  /** 结束唤醒流程，回到结束态。 */
  function finishSession(): void {
    phase.value = 'finished'
    remainingSeconds.value = 0
  }

  /** 复位会话到空闲态（结束后回到初始可再次启动）。 */
  function resetSession(): void {
    phase.value = 'idle'
    remainingSeconds.value = 0
  }

  return {
    // 时段 / 背景
    period,
    sceneByPeriod,
    backgroundOverride,
    currentBackground,
    // 氛围
    ambiance,
    // 卡片状态
    seat,
    ambientLight,
    audio,
    fragrance,
    shadeWindow,
    // 会话
    durationMinutes,
    phase,
    remainingSeconds,
    isRunning,
    isWaking,
    progress,
    // actions：时段 / 背景
    setPeriod,
    cyclePeriod,
    setBackground,
    setPeriodBackground,
    clearBackgroundOverride,
    // actions：氛围
    setAmbianceColor,
    setAmbianceBrightness,
    // actions：座椅 / 按摩
    setSeatAngle,
    setMassageOn,
    setMassageMode,
    setMassageIntensity,
    // actions：氛围灯
    setLightOn,
    setLightColor,
    setLightBrightness,
    // actions：音频
    selectAudio,
    togglePlay,
    setPlaying,
    setVolume,
    // actions：香氛
    setFragranceOn,
    selectScent,
    setFragranceIntensity,
    // actions：遮阳帘 / 车窗
    setShade,
    setWindow,
    // actions：会话生命周期
    setDuration,
    startSession,
    cancelSession,
    tick,
    finishSession,
    resetSession,
  }
})

/** store 实例类型，供组件 / 联动模块标注引用。 */
export type RestSessionStore = ReturnType<typeof useRestSessionStore>
