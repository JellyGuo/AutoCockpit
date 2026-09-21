<script setup lang="ts">
/**
 * NapTimerCard —— 小憩时长设置与会话控制卡片（任务 #8 控件）
 *
 * - 连续滑动设置时长：`<input type="range">` 连续拖动，实时把分钟数写入 store 并即时显示。
 * - 启动 / 取消：启动后会话进入倒计时（store.phase='running'），提供取消回到空闲。
 * - 运行态实时呈现剩余时间 mm:ss 与进度条。
 * - 唤醒态给出温和提示（主视觉由 WakeUpScene 覆盖层承担）。
 *
 * 会话状态一律取自 restSession store（单一数据契约），实时驱动由 useNapSession 提供。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import GlassCard from '@/components/base/GlassCard.vue'
import {
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  useRestSessionStore,
} from '@/stores/restSession'
import type { NapSession } from '@/composables/useNapSession'

/** 由集成层创建的单例会话运行时（保证只有一个倒计时驱动）。 */
const props = defineProps<{ session: NapSession }>()

const store = useRestSessionStore()
const { durationMinutes, phase, remainingSeconds, progress, isRunning, isWaking } =
  storeToRefs(store)

/** 剩余时间格式化为 mm:ss。 */
const remainingLabel = computed(() => {
  const total = remainingSeconds.value
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

/** 进度条已流逝百分比。 */
const progressPercent = computed(() => Math.round(progress.value * 100))

/** 滑块输入 → 连续写入时长（实时显示）。 */
function onSlide(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  props.session.setDuration(value)
}
</script>

<template>
  <GlassCard padding="lg" class="nap-card">
    <template #header>
      <span class="nap-card__title">小憩时长</span>
    </template>

    <!-- 空闲 / 结束：连续滑动设置时长 -->
    <div v-if="!isRunning && !isWaking" class="nap-card__setup">
      <div class="nap-card__readout" aria-live="polite">
        <span class="nap-card__minutes">{{ durationMinutes }}</span>
        <span class="nap-card__unit">分钟</span>
      </div>

      <input
        class="nap-slider"
        type="range"
        :min="MIN_DURATION_MINUTES"
        :max="MAX_DURATION_MINUTES"
        step="1"
        :value="durationMinutes"
        aria-label="小憩时长（分钟）"
        @input="onSlide"
      />

      <div class="nap-slider__scale">
        <span>{{ MIN_DURATION_MINUTES }} 分</span>
        <span>{{ MAX_DURATION_MINUTES }} 分</span>
      </div>

      <button class="nap-btn nap-btn--start" type="button" @click="session.startNap()">
        开始小憩
      </button>
    </div>

    <!-- 运行：倒计时 + 取消 -->
    <div v-else-if="isRunning" class="nap-card__running">
      <div class="nap-card__countdown" aria-live="polite">{{ remainingLabel }}</div>
      <div class="nap-progress">
        <div class="nap-progress__fill" :style="{ width: progressPercent + '%' }" />
      </div>
      <div class="nap-card__hint">小憩中 · 计划 {{ durationMinutes }} 分钟</div>
      <button class="nap-btn nap-btn--cancel" type="button" @click="session.cancelNap()">
        取消小憩
      </button>
    </div>

    <!-- 唤醒：温和提示（主视觉见 WakeUpScene） -->
    <div v-else class="nap-card__waking">
      <div class="nap-card__waking-title">正在温柔唤醒…</div>
      <div class="nap-card__hint">灯光渐亮 · 舒缓音乐</div>
    </div>

    <template #footer>
      <span>{{ phase === 'waking' ? '唤醒中' : phase === 'running' ? '进行中' : '待开始' }}</span>
    </template>
  </GlassCard>
</template>

<style scoped>
.nap-card {
  width: 420px;
}

.nap-card__title {
  letter-spacing: 0.04em;
}

.nap-card__setup {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.nap-card__readout {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-xs);
}

.nap-card__minutes {
  font-size: 64px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.nap-card__unit {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

/* 连续滑动条 */
.nap-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.22);
  outline: none;
  cursor: pointer;
}
.nap-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px var(--color-shadow);
  transition: transform var(--motion-fast) var(--motion-easing);
}
.nap-slider::-webkit-slider-thumb:active {
  transform: scale(1.12);
}
.nap-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-accent);
  border: 3px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.nap-slider__scale {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.nap-btn {
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-pill);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    transform var(--motion-fast) var(--motion-easing),
    background var(--motion-normal) var(--motion-easing);
}
.nap-btn:hover {
  transform: translateY(-1px);
}
.nap-btn--start {
  background: linear-gradient(135deg, var(--color-accent), #5f9aa8);
}
.nap-btn--cancel {
  background: rgba(255, 255, 255, 0.18);
}

.nap-card__running {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  align-items: center;
}

.nap-card__countdown {
  font-size: 72px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.nap-progress {
  width: 100%;
  height: 8px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}
.nap-progress__fill {
  height: 100%;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  transition: width 1s linear;
}

.nap-card__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.nap-card__waking {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-md) 0;
}
.nap-card__waking-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}
</style>
