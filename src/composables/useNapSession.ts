/**
 * useNapSession —— 小憩会话运行时编排（Composable）
 *
 * store（restSession）持有会话状态的**单一数据契约**：时长、阶段、剩余秒数、氛围灯亮度等。
 * 本 composable 负责把「墙上时钟」与「唤醒表现」接到 store 之上，实现任务 #8 的生命周期编排：
 *
 *  1. 倒计时驱动：运行态下每秒调用 `store.tick(1)`，剩余归零时 store 自动切到 `waking`。
 *  2. 唤醒表现：进入 `waking` 阶段时——
 *     - 背景灯光「由暗渐亮」：把 `ambientLight.brightness` 从低值平滑抬升到高值，并点亮氛围灯；
 *     - 播放「舒缓音乐」：用 Web Audio 合成一段柔和的大三和弦 + 缓慢起伏，无需外部音频资源；
 *     - 暴露 `wakeGlow`（0→1）供唤醒视觉层做渐亮光晕。
 *  3. 结束：`dismissWake()` 停止音乐、复位氛围灯并让 store 收尾（finish/reset）。
 *
 * 所有状态变更仍通过 store action 完成——本模块只提供实时驱动与浏览器侧的声/光副作用。
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRestSessionStore } from '@/stores/restSession'

/** 唤醒「渐亮」总时长（毫秒）：灯光由暗到亮、光晕 0→1 的爬升时间。 */
const WAKE_RAMP_MS = 8000
/** 唤醒起始灯光亮度（暗）。 */
const WAKE_START_BRIGHTNESS = 4
/** 唤醒目标灯光亮度（亮）。 */
const WAKE_END_BRIGHTNESS = 100
/** 舒缓音乐峰值音量（0~1，保持轻柔）。 */
const MUSIC_PEAK_GAIN = 0.12
/** 舒缓和弦频率（C4 大三和弦 + 高八度点缀），营造温和明亮的唤醒音色。 */
const CHORD_FREQUENCIES = [261.63, 329.63, 392.0, 523.25]

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext }

export function useNapSession() {
  const store = useRestSessionStore()

  /** 倒计时定时器句柄。 */
  let tickTimer: ReturnType<typeof setInterval> | null = null
  /** 唤醒渐亮动画帧句柄。 */
  let rampRaf: number | null = null
  /** Web Audio 上下文与节点，唤醒音乐播放期间存活。 */
  let audioCtx: AudioContext | null = null
  let masterGain: GainNode | null = null
  let oscillators: OscillatorNode[] = []

  /** 唤醒光晕强度 0~1（供 WakeUpScene 做由暗渐亮的视觉表现）。 */
  const wakeGlow = ref(0)
  /** 舒缓音乐是否正在播放（供 UI 指示）。 */
  const musicPlaying = ref(false)

  /* ------------------------------ 倒计时驱动 ------------------------------ */

  function startTicking(): void {
    stopTicking()
    tickTimer = setInterval(() => store.tick(1), 1000)
  }

  function stopTicking(): void {
    if (tickTimer !== null) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  }

  /* ------------------------------ 唤醒：渐亮灯光 ------------------------------ */

  function startWakeRamp(): void {
    cancelWakeRamp()
    store.setLightOn(true)
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / WAKE_RAMP_MS)
      // easeInOutSine：由暗到亮更「温和」的爬升曲线
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * t)
      wakeGlow.value = eased
      const brightness =
        WAKE_START_BRIGHTNESS + (WAKE_END_BRIGHTNESS - WAKE_START_BRIGHTNESS) * eased
      store.setLightBrightness(brightness)
      if (t < 1) {
        rampRaf = requestAnimationFrame(step)
      } else {
        rampRaf = null
      }
    }
    // 先压到最暗，再逐帧渐亮
    store.setLightBrightness(WAKE_START_BRIGHTNESS)
    wakeGlow.value = 0
    rampRaf = requestAnimationFrame(step)
  }

  function cancelWakeRamp(): void {
    if (rampRaf !== null) {
      cancelAnimationFrame(rampRaf)
      rampRaf = null
    }
  }

  /* ------------------------------ 唤醒：舒缓音乐 ------------------------------ */

  function startMusic(): void {
    if (typeof window === 'undefined') return
    stopMusic()
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return
    audioCtx = new Ctor()
    masterGain = audioCtx.createGain()
    // 音量随唤醒同步「由弱渐强」，与灯光渐亮呼应
    masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime)
    masterGain.gain.exponentialRampToValueAtTime(
      MUSIC_PEAK_GAIN,
      audioCtx.currentTime + WAKE_RAMP_MS / 1000,
    )
    masterGain.connect(audioCtx.destination)

    // 缓慢的振幅起伏（LFO）让和弦更「呼吸」、更舒缓
    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.frequency.value = 0.15
    lfoGain.gain.value = 0.03
    lfo.connect(lfoGain).connect(masterGain.gain)
    lfo.start()

    oscillators = CHORD_FREQUENCIES.map((freq, i) => {
      const osc = audioCtx!.createOscillator()
      const g = audioCtx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      // 高音点缀更轻，避免刺耳
      g.gain.value = i === CHORD_FREQUENCIES.length - 1 ? 0.4 : 1
      osc.connect(g).connect(masterGain!)
      osc.start()
      return osc
    })
    oscillators.push(lfo)
    musicPlaying.value = true
  }

  function stopMusic(): void {
    if (audioCtx) {
      const ctx = audioCtx
      const gain = masterGain
      // 轻柔淡出后关闭，避免爆音
      try {
        if (gain) {
          gain.gain.cancelScheduledValues(ctx.currentTime)
          gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)
        }
        oscillators.forEach((o) => o.stop(ctx.currentTime + 0.45))
      } catch {
        /* 忽略已停止节点的重复 stop */
      }
      const toClose = ctx
      setTimeout(() => {
        void toClose.close().catch(() => undefined)
      }, 500)
    }
    oscillators = []
    masterGain = null
    audioCtx = null
    musicPlaying.value = false
  }

  /* ------------------------------ 对外操作 ------------------------------ */

  /** 设置时长（分钟，连续）。 */
  function setDuration(minutes: number): void {
    store.setDuration(minutes)
  }

  /** 启动小憩：进入倒计时。 */
  function startNap(): void {
    store.startSession()
  }

  /** 取消小憩：停止倒计时并回到空闲。 */
  function cancelNap(): void {
    store.cancelSession()
  }

  /** 结束唤醒：停止声/光副作用并让 store 收尾复位。 */
  function dismissWake(): void {
    cancelWakeRamp()
    stopMusic()
    wakeGlow.value = 0
    store.finishSession()
    store.resetSession()
  }

  /* --------------------------- 阶段变化 → 副作用编排 --------------------------- */

  const stopWatch = watch(
    () => store.phase,
    (phase, prev) => {
      if (phase === prev) return
      // 离开运行态一律停表
      if (prev === 'running' && phase !== 'running') {
        stopTicking()
      }
      if (phase === 'running') {
        startTicking()
      } else if (phase === 'waking') {
        startWakeRamp()
        startMusic()
      } else {
        // idle / finished：清理唤醒副作用
        cancelWakeRamp()
        stopMusic()
        wakeGlow.value = 0
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stopWatch()
    stopTicking()
    cancelWakeRamp()
    stopMusic()
  })

  return {
    /** 唤醒光晕 0~1（视觉渐亮）。 */
    wakeGlow,
    /** 舒缓音乐播放中。 */
    musicPlaying,
    setDuration,
    startNap,
    cancelNap,
    dismissWake,
  }
}

export type NapSession = ReturnType<typeof useNapSession>
