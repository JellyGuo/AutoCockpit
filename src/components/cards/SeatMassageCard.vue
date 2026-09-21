<script setup lang="ts">
/**
 * SeatMassageCard — 座椅角度 / 按摩调节卡片（任务 #4 核心交付）。
 * - 座椅角度：连续滑动 + 档位快捷，实时数字显示 + 座椅侧视可视化。
 * - 按摩：开关 + 强度（1~5 档）+ 模式选择。
 * - 所有交互实时写入 restSession store，界面即时反馈。
 */
import { computed } from 'vue'
import GlassCard from '@/components/base/GlassCard.vue'
import {
  useRestSessionStore,
  MASSAGE_MODES,
  SEAT_ANGLE_MIN,
  SEAT_ANGLE_MAX,
  SEAT_ANGLE_PRESETS,
  MASSAGE_INTENSITY_MIN,
  MASSAGE_INTENSITY_MAX,
  type MassageMode,
} from '@/stores/restSession'

const store = useRestSessionStore()

/** 座椅角度双向绑定：读 store、写 action（滑块 input 实时触发） */
const seatAngle = computed({
  get: () => store.seatAngle,
  set: (v: number) => store.setSeatAngle(Number(v)),
})

const massageIntensity = computed({
  get: () => store.massageIntensity,
  set: (v: number) => store.setMassageIntensity(Number(v)),
})

/** 座椅靠背相对竖直方向的旋转角：角度越大越接近平躺 */
const backrestRotation = computed(() => store.seatAngle - 90)

/** 可视化里靠背高度随角度略缩，增强“放倒”观感 */
const seatAngleLabel = computed(() => `${store.seatAngle}°`)

const intensityDots = computed(() =>
  Array.from({ length: MASSAGE_INTENSITY_MAX }, (_, i) => i + 1),
)

function selectPreset(angle: number) {
  store.setSeatAngle(angle)
}

function selectMode(mode: MassageMode) {
  store.setMassageMode(mode)
}
</script>

<template>
  <GlassCard title="座椅 · 角度 / 按摩" class="seat-card">
    <!-- 座椅状态可视化 -->
    <div class="seat-visual" role="img" :aria-label="`当前座椅角度 ${seatAngleLabel}`">
      <div class="seat-visual__frame">
        <div class="seat-visual__base" />
        <div
          class="seat-visual__backrest"
          :style="{ transform: `rotate(${backrestRotation}deg)` }"
          :class="{ 'is-massaging': store.massageOn }"
        >
          <span
            v-if="store.massageOn"
            class="seat-visual__massage-glow"
            :style="{ opacity: 0.25 + store.massageIntensity * 0.14 }"
          />
        </div>
      </div>
      <div class="seat-visual__readout">
        <span class="seat-visual__angle">{{ seatAngleLabel }}</span>
        <span class="seat-visual__status">
          {{ store.massageOn ? `按摩中 · ${store.massageIntensity} 档` : '按摩关闭' }}
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
          :class="{ 'chip--active': store.seatAngle === p.value }"
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
          :aria-checked="store.massageOn"
          :class="{ 'switch--on': store.massageOn }"
          @click="store.toggleMassage()"
        >
          <span class="switch__knob" />
          <span class="switch__text">{{ store.massageOn ? '开' : '关' }}</span>
        </button>
      </div>

      <div class="massage-body" :class="{ 'is-disabled': !store.massageOn }">
        <div class="ctrl__label ctrl__label--sub">
          <span>强度</span>
          <span class="ctrl__value">{{ store.massageIntensity }} / {{ MASSAGE_INTENSITY_MAX }}</span>
        </div>
        <input
          class="slider"
          type="range"
          :min="MASSAGE_INTENSITY_MIN"
          :max="MASSAGE_INTENSITY_MAX"
          step="1"
          v-model.number="massageIntensity"
          :disabled="!store.massageOn"
          aria-label="按摩强度调节"
        />
        <div class="dots">
          <span
            v-for="d in intensityDots"
            :key="d"
            class="dot"
            :class="{ 'dot--on': store.massageOn && d <= store.massageIntensity }"
          />
        </div>

        <div class="ctrl__label ctrl__label--sub"><span>模式</span></div>
        <div class="presets">
          <button
            v-for="m in MASSAGE_MODES"
            :key="m.value"
            type="button"
            class="chip"
            :class="{ 'chip--active': store.massageMode === m.value }"
            :disabled="!store.massageOn"
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
  gap: var(--ac-space-lg);
  padding: var(--ac-space-md);
  border-radius: var(--ac-radius-md);
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
  background: var(--ac-text-dim);
}
.seat-visual__backrest {
  position: absolute;
  bottom: 16px;
  left: 24px;
  width: 20px;
  height: 62px;
  border-radius: 10px;
  background: var(--ac-accent);
  transform-origin: bottom center;
  transition: transform 0.18s ease;
}
.seat-visual__backrest.is-massaging {
  animation: massage-pulse 0.9s ease-in-out infinite;
}
.seat-visual__massage-glow {
  position: absolute;
  inset: -6px;
  border-radius: 14px;
  background: var(--ac-accent);
  filter: blur(8px);
}
.seat-visual__readout {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.seat-visual__angle {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}
.seat-visual__status {
  font-size: 14px;
  color: var(--ac-text-dim);
}

@keyframes massage-pulse {
  0%, 100% { transform: rotate(var(--r, 0deg)) translateX(0); }
  50% { transform: translateX(1.5px); }
}

/* ---- 通用控件 ---- */
.ctrl {
  display: flex;
  flex-direction: column;
  gap: var(--ac-space-sm);
}
.ctrl__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
}
.ctrl__label--sub {
  font-size: 13px;
  color: var(--ac-text-dim);
}
.ctrl__value {
  font-variant-numeric: tabular-nums;
  color: var(--ac-accent);
  font-weight: 600;
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
  background: var(--ac-accent);
  box-shadow: 0 0 0 4px var(--ac-accent-soft);
  cursor: pointer;
}
.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: var(--ac-accent);
  cursor: pointer;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ac-space-sm);
}
.chip {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--ac-glass-border);
  background: transparent;
  color: var(--ac-text);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.chip:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}
.chip--active {
  background: var(--ac-accent);
  border-color: var(--ac-accent);
  color: #06302b;
  font-weight: 600;
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
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: background 0.18s ease;
}
.switch--on {
  background: var(--ac-accent);
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
  font-weight: 600;
  color: var(--ac-text);
}
.switch--on .switch__text {
  color: #06302b;
}

.massage-body {
  display: flex;
  flex-direction: column;
  gap: var(--ac-space-sm);
  transition: opacity 0.18s ease;
}
.massage-body.is-disabled {
  opacity: 0.5;
}

.dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 100%;
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.15s ease;
}
.dot--on {
  background: var(--ac-accent);
}
</style>
