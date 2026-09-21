<script setup lang="ts">
/**
 * SeatMassageCard —— 座椅角度 / 按摩调节卡片（任务 #4）
 *
 * - 座椅角度：连续滑动 + 档位快捷，实时数字显示 + 座椅侧视可视化。
 * - 按摩：开关 + 强度（0~3 档）+ 模式选择。
 * - 所有交互实时经 restSession store 的 action 写入（单一数据契约），界面即时反馈。
 *
 * 已对齐集成基线的 canonical store：座椅状态位于 `store.seat`，
 * 变更统一走 `setSeatAngle / setMassageOn / setMassageMode / setMassageIntensity`。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import GlassCard from '@/components/base/GlassCard.vue'
import { useRestSessionStore, type MassageMode } from '@/stores/restSession'

/** 座椅角度边界（度）：90=直立，180=全平（与 store.setSeatAngle 的夹取区间一致）。 */
const SEAT_ANGLE_MIN = 90
const SEAT_ANGLE_MAX = 180
/** 按摩强度边界（0~3，与 store.setMassageIntensity 一致）。 */
const MASSAGE_INTENSITY_MIN = 0
const MASSAGE_INTENSITY_MAX = 3

/** 座椅角度快捷档位。 */
const SEAT_ANGLE_PRESETS: { label: string; value: number }[] = [
  { label: '直立', value: 95 },
  { label: '小憩', value: 120 },
  { label: '半躺', value: 150 },
  { label: '全平', value: 180 },
]

/** 按摩模式档位（value 对齐 store 的 MassageMode）。 */
const MASSAGE_MODES: { label: string; value: MassageMode }[] = [
  { label: '波浪', value: 'wave' },
  { label: '揉捏', value: 'knead' },
  { label: '脉冲', value: 'pulse' },
  { label: '指压', value: 'shiatsu' },
]

const store = useRestSessionStore()
const { seat } = storeToRefs(store)

/** 座椅角度双向绑定：读 store、写 action（滑块 input 实时触发）。 */
const seatAngle = computed({
  get: () => seat.value.angle,
  set: (v: number) => store.setSeatAngle(Number(v)),
})

/** 按摩强度双向绑定。 */
const massageIntensity = computed({
  get: () => seat.value.massageIntensity,
  set: (v: number) => store.setMassageIntensity(Number(v)),
})

/** 座椅靠背相对竖直方向的旋转角：角度越大越接近平躺。 */
const backrestRotation = computed(() => seat.value.angle - 90)

const seatAngleLabel = computed(() => `${seat.value.angle}°`)

const intensityDots = computed(() =>
  Array.from({ length: MASSAGE_INTENSITY_MAX }, (_, i) => i + 1),
)

function selectPreset(angle: number): void {
  store.setSeatAngle(angle)
}

function toggleMassage(): void {
  store.setMassageOn(!seat.value.massageOn)
}

function selectMode(mode: MassageMode): void {
  store.setMassageMode(mode)
}
</script>

<template>
  <GlassCard padding="lg" class="seat-card">
    <template #header>
      <span>座椅 · 角度 / 按摩</span>
    </template>

    <!-- 座椅状态可视化 -->
    <div class="seat-visual" role="img" :aria-label="`当前座椅角度 ${seatAngleLabel}`">
      <div class="seat-visual__frame">
        <div class="seat-visual__base" />
        <div
          class="seat-visual__backrest"
          :style="{ transform: `rotate(${backrestRotation}deg)` }"
          :class="{ 'is-massaging': seat.massageOn }"
        >
          <span
            v-if="seat.massageOn"
            class="seat-visual__massage-glow"
            :style="{ opacity: 0.25 + seat.massageIntensity * 0.2 }"
          />
        </div>
      </div>
      <div class="seat-visual__readout">
        <span class="seat-visual__angle">{{ seatAngleLabel }}</span>
        <span class="seat-visual__status">
          {{ seat.massageOn ? `按摩中 · ${seat.massageIntensity} 档` : '按摩关闭' }}
        </span>
      </div>
    </div>

    <!-- 座椅角度调节 -->
    <div class="ctrl">
      <div class="ctrl__label">
        <span>座椅角度</span>
        <span class="ctrl__value">{{ seatAngleLabel }}</span>
      </div>
      <input
        class="slider"
        type="range"
        :min="SEAT_ANGLE_MIN"
        :max="SEAT_ANGLE_MAX"
        step="1"
        v-model.number="seatAngle"
        aria-label="座椅角度滑动调节"
      />
      <div class="presets">
        <button
          v-for="p in SEAT_ANGLE_PRESETS"
          :key="p.value"
          type="button"
          class="chip"
          :class="{ 'chip--active': seat.angle === p.value }"
          @click="selectPreset(p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- 按摩调节 -->
    <div class="ctrl">
      <div class="ctrl__label">
        <span>按摩</span>
        <button
          type="button"
          class="switch"
          role="switch"
          :aria-checked="seat.massageOn"
          :class="{ 'switch--on': seat.massageOn }"
          @click="toggleMassage"
        >
          <span class="switch__knob" />
          <span class="switch__text">{{ seat.massageOn ? '开' : '关' }}</span>
        </button>
      </div>

      <div class="massage-body" :class="{ 'is-disabled': !seat.massageOn }">
        <div class="ctrl__label ctrl__label--sub">
          <span>强度</span>
          <span class="ctrl__value">{{ seat.massageIntensity }} / {{ MASSAGE_INTENSITY_MAX }}</span>
        </div>
        <input
          class="slider"
          type="range"
          :min="MASSAGE_INTENSITY_MIN"
          :max="MASSAGE_INTENSITY_MAX"
          step="1"
          v-model.number="massageIntensity"
          :disabled="!seat.massageOn"
          aria-label="按摩强度调节"
        />
        <div class="dots">
          <span
            v-for="d in intensityDots"
            :key="d"
            class="dot"
            :class="{ 'dot--on': seat.massageOn && d <= seat.massageIntensity }"
          />
        </div>

        <div class="ctrl__label ctrl__label--sub"><span>模式</span></div>
        <div class="presets">
          <button
            v-for="m in MASSAGE_MODES"
            :key="m.value"
            type="button"
            class="chip"
            :class="{ 'chip--active': seat.massageMode === m.value }"
            :disabled="!seat.massageOn"
            @click="selectMode(m.value)"
          >
            {{ m.label }}
          </button>
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<style scoped>
.seat-card {
  width: 420px;
}

/* ---- 座椅可视化 ---- */
.seat-visual {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.16);
}
.seat-visual__frame {
  position: relative;
  width: 120px;
  height: 90px;
  flex: 0 0 auto;
}
.seat-visual__base {
  position: absolute;
  bottom: 8px;
  left: 24px;
  width: 84px;
  height: 16px;
  border-radius: 8px;
  background: var(--color-text-secondary);
}
.seat-visual__backrest {
  position: absolute;
  bottom: 16px;
  left: 24px;
  width: 20px;
  height: 62px;
  border-radius: 10px;
  background: var(--color-accent);
  transform-origin: bottom center;
  transition: transform var(--motion-fast) var(--motion-easing);
}
.seat-visual__backrest.is-massaging {
  animation: massage-pulse 0.9s ease-in-out infinite;
}
.seat-visual__massage-glow {
  position: absolute;
  inset: -6px;
  border-radius: 14px;
  background: var(--color-accent);
  filter: blur(8px);
}
.seat-visual__readout {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.seat-visual__angle {
  font-size: 34px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}
.seat-visual__status {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@keyframes massage-pulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(1.5px); }
}

/* ---- 通用控件 ---- */
.ctrl {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.ctrl__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
}
.ctrl__label--sub {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.ctrl__value {
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
  font-weight: var(--font-weight-medium);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.24);
  outline: none;
  cursor: pointer;
}
.slider:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(127, 184, 196, 0.3);
  cursor: pointer;
}
.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: var(--color-accent);
  cursor: pointer;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.chip {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-glass-border);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 13px;
  font-family: var(--font-family);
  cursor: pointer;
  transition:
    background var(--motion-fast) var(--motion-easing),
    border-color var(--motion-fast) var(--motion-easing);
}
.chip:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}
.chip--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #06302b;
  font-weight: var(--font-weight-medium);
}
.chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ---- 开关 ---- */
.switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 3px 10px 3px 3px;
  width: 62px;
  height: 30px;
  border-radius: var(--radius-pill);
  border: none;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: background var(--motion-fast) var(--motion-easing);
}
.switch--on {
  background: var(--color-accent);
  justify-content: flex-end;
  padding: 3px 3px 3px 10px;
}
.switch__knob {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  order: 0;
}
.switch--on .switch__knob {
  order: 1;
}
.switch__text {
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}
.switch--on .switch__text {
  color: #06302b;
}

.massage-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  transition: opacity var(--motion-fast) var(--motion-easing);
}
.massage-body.is-disabled {
  opacity: 0.5;
}

.dots {
  display: flex;
  gap: 6px;
}
.dot {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  transition: background var(--motion-fast) var(--motion-easing);
}
.dot--on {
  background: var(--color-accent);
}
</style>
