<script setup lang="ts">
/**
 * RestModeView —— 座舱小憩主页面（任务 #9 收口组装）
 *
 * 面向驻车驾驶员单人小憩的单屏（1920×1080）布局，把以下部件组装为一个联动整体：
 *  - 全屏风景背景 BackgroundScene（随时段切换、交叉淡入淡出）；
 *  - 氛围色调层：随 store.ambiance（由氛围灯 / 香氛等卡片驱动）实时改变背景氛围；
 *  - 五类功能卡片：座椅/按摩、氛围灯与音乐、香氛、遮阳帘/车窗；
 *  - 小憩时长 / 会话控件 NapTimerCard；
 *  - 结束唤醒视觉层 WakeUpScene。
 *
 * 联动核心（全部经 restSession store 的单一数据契约）：
 *  - 操作卡片 → 实时改变背景 / 氛围（氛围灯颜色/亮度、香型色注入 store.ambiance）；
 *  - 时段变化 → 风景背景平滑切换（初始按真实时钟取时段，并可自动/手动切换）。
 *
 * 单屏适配复用脚手架的 ScreenScaler（等比缩放、无滚动）；卡片板再按可用区域
 * 等比自适应缩放（measure + ResizeObserver），保证全部卡片在 1080 高度内完整呈现、不裁切。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ScreenScaler from '@/components/ScreenScaler.vue'
import BackgroundScene from '@/components/base/BackgroundScene.vue'
import SeatMassageCard from '@/components/cards/SeatMassageCard.vue'
import AmbientMediaCard from '@/components/cards/AmbientMediaCard.vue'
import FragranceCard from '@/components/cards/FragranceCard.vue'
import ShadeWindowCard from '@/components/cards/ShadeWindowCard.vue'
import NapTimerCard from '@/components/session/NapTimerCard.vue'
import WakeUpScene from '@/components/session/WakeUpScene.vue'
import { useRestSessionStore, TIME_PERIODS, type TimePeriod } from '@/stores/restSession'
import { useNapSession } from '@/composables/useNapSession'

const store = useRestSessionStore()
const { currentBackground, ambiance, ambientLight, period } = storeToRefs(store)

/** 单例会话运行时（保证只有一个倒计时驱动，下发给时长卡与唤醒层）。 */
const session = useNapSession()

/* ----------------------------- 背景 / 氛围联动 ----------------------------- */

/** 背景整体亮度随氛围灯亮度联动（关灯时压暗、唤醒渐亮时同步变亮）。 */
const sceneFilter = computed(() => {
  const on = ambientLight.value.on
  const b = on ? ambientLight.value.brightness : 20
  const brightness = 0.5 + (b / 100) * 0.6
  return `brightness(${brightness.toFixed(2)})`
})

/** 氛围色调层：以 store.ambiance.color 作径向柔光，强度随氛围灯亮度联动。 */
const ambianceTint = computed(() => {
  const alpha = ambientLight.value.on ? 0.18 + (ambiance.value.brightness / 100) * 0.3 : 0.06
  const color = ambiance.value.color
  return {
    background: `radial-gradient(120% 90% at 50% 18%, ${color} 0%, transparent 62%)`,
    opacity: String(alpha.toFixed(2)),
  }
})

/* ------------------------------- 时段 / 背景 ------------------------------- */

const PERIOD_LABELS: Record<TimePeriod, string> = {
  dawn: '黎明',
  day: '白昼',
  dusk: '黄昏',
  night: '夜晚',
}

/** 由真实时钟推导时段：黎明 5-8、白昼 8-17、黄昏 17-20、夜晚 其余。 */
function periodFromClock(date = new Date()): TimePeriod {
  const h = date.getHours()
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

/** 是否随真实时钟自动切换时段（手动切换后暂停自动，避免与用户选择冲突）。 */
const autoByClock = ref(true)
let clockTimer: ReturnType<typeof setInterval> | null = null

function selectPeriod(next: TimePeriod): void {
  autoByClock.value = false
  store.setPeriod(next)
}

function enableAutoClock(): void {
  autoByClock.value = true
  store.setPeriod(periodFromClock())
}

/* ------------------------------ 卡片板自适应缩放 ------------------------------ */

const boardRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const fitScale = ref(1)

/** 依据可用区域测量卡片板自然尺寸，等比缩放使其在 1080 内完整呈现、不裁切。 */
function updateFit(): void {
  const board = boardRef.value
  const stage = stageRef.value
  if (!board || !stage) return
  // 可用区域：舞台减去内边距与头部占用
  const paddingX = 96
  const paddingY = 40
  const headerH = headerRef.value?.offsetHeight ?? 0
  const availW = stage.clientWidth - paddingX
  const availH = stage.clientHeight - paddingY * 2 - headerH - 24
  // 卡片板自然尺寸（当前 scale 下的实际尺寸还原为自然尺寸）
  const naturalW = board.offsetWidth
  const naturalH = board.offsetHeight
  if (naturalW === 0 || naturalH === 0) return
  const next = Math.min(1, availW / naturalW, availH / naturalH)
  fitScale.value = Number(next.toFixed(4))
}

let ro: ResizeObserver | null = null

onMounted(() => {
  // 初始按真实时钟取时段
  store.setPeriod(periodFromClock())
  // 自动时段：每分钟按真实时钟复核一次
  clockTimer = setInterval(() => {
    if (autoByClock.value) store.setPeriod(periodFromClock())
  }, 60_000)

  updateFit()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => updateFit())
    if (boardRef.value) ro.observe(boardRef.value)
    if (stageRef.value) ro.observe(stageRef.value)
  }
  window.addEventListener('resize', updateFit)
})

onBeforeUnmount(() => {
  if (clockTimer !== null) clearInterval(clockTimer)
  ro?.disconnect()
  window.removeEventListener('resize', updateFit)
})

// 会话阶段变化会改变卡片高度，重新测量以保持完整呈现
watch(
  () => store.phase,
  () => {
    // 等 DOM 更新后再测量
    requestAnimationFrame(updateFit)
  },
)
</script>

<template>
  <ScreenScaler>
    <div ref="stageRef" class="stage">
      <!-- 全屏风景背景（随时段交叉淡入淡出） -->
      <div class="stage__bg" :style="{ filter: sceneFilter }">
        <BackgroundScene :src="currentBackground" />
      </div>
      <!-- 氛围色调层（随卡片操作实时改变氛围） -->
      <div class="stage__tint" :style="ambianceTint" aria-hidden="true" />

      <!-- 前景内容 -->
      <div class="stage__content">
        <header ref="headerRef" class="topbar">
          <div class="topbar__brand">
            <h1 class="topbar__title">座舱小憩</h1>
            <p class="topbar__subtitle">驻车 · 单人放松模式</p>
          </div>

          <div class="topbar__period" role="group" aria-label="时段切换">
            <span class="topbar__period-label">时段</span>
            <button
              v-for="p in TIME_PERIODS"
              :key="p"
              type="button"
              class="period-chip"
              :class="{ 'period-chip--active': period === p }"
              :aria-pressed="period === p"
              @click="selectPeriod(p)"
            >
              {{ PERIOD_LABELS[p] }}
            </button>
            <button
              type="button"
              class="period-chip period-chip--auto"
              :class="{ 'period-chip--active': autoByClock }"
              :aria-pressed="autoByClock"
              title="随真实时钟自动切换时段"
              @click="enableAutoClock"
            >
              自动
            </button>
          </div>
        </header>

        <div class="board-wrap">
          <div
            ref="boardRef"
            class="board"
            :style="{ transform: `scale(${fitScale})` }"
          >
            <SeatMassageCard class="board__card" />
            <AmbientMediaCard class="board__card" />
            <FragranceCard class="board__card" />
            <ShadeWindowCard class="board__card" />
            <NapTimerCard class="board__card" :session="session" />
          </div>
        </div>
      </div>

      <!-- 结束唤醒覆盖层 -->
      <WakeUpScene :session="session" />
    </div>
  </ScreenScaler>
</template>

<style scoped>
.stage {
  position: relative;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  font-family: var(--font-family);
  color: var(--color-text-primary);
}

.stage__bg {
  position: absolute;
  inset: 0;
  transition: filter var(--motion-crossfade) var(--motion-easing);
}

.stage__tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  transition:
    background var(--motion-crossfade) var(--motion-easing),
    opacity var(--motion-crossfade) var(--motion-easing);
}

.stage__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  box-sizing: border-box;
}

/* -------------------------------- 顶栏 -------------------------------- */
.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex: 0 0 auto;
}
.topbar__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.06em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.topbar__subtitle {
  margin: 4px 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.topbar__period {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(var(--blur-sm));
  backdrop-filter: blur(var(--blur-sm));
}
.topbar__period-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: 0 4px;
}
.period-chip {
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  cursor: pointer;
  transition: background var(--motion-fast) var(--motion-easing);
}
.period-chip:hover {
  background: rgba(255, 255, 255, 0.14);
}
.period-chip--active {
  background: var(--color-accent);
  color: #06302b;
  font-weight: var(--font-weight-medium);
}
.period-chip--auto {
  border: 1px dashed var(--color-glass-border);
}

/* ------------------------------ 卡片板 ------------------------------ */
.board-wrap {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}
.board {
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 28px;
  align-items: start;
  justify-items: center;
  transform-origin: center center;
}
.board__card {
  align-self: stretch;
}
</style>
