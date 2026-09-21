<script setup lang="ts">
/**
 * 香氛释放卡片（任务 #6）
 * - 香氛开关
 * - 香型选择（即时反馈当前香型）
 * - 释放强度连续调节（实时更新并显示强度状态）
 * - 状态写入 Pinia store（fragranceStore）
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import GlassCard from '@/components/GlassCard.vue'
import { useFragranceStore } from './fragranceStore'
import { INTENSITY_MAX, INTENSITY_MIN, INTENSITY_STEP, type ScentId } from './types'

const store = useFragranceStore()
const { on, scent, intensity, currentPreset, presets, effectiveIntensity } = storeToRefs(store)

/** 强度档位文案，用于即时反馈 */
const intensityLabel = computed(() => {
  if (!on.value) return '已关闭'
  const v = intensity.value
  if (v === 0) return '待机'
  if (v <= 33) return '轻柔'
  if (v <= 66) return '适中'
  return '浓郁'
})

/** 卡片氛围色：随当前香型与是否开启变化，作为实时视觉反馈 */
const ambientColor = computed(() => (on.value ? currentPreset.value.color : 'var(--color-text-dim)'))

/** 香雾动画的透明度，随有效强度联动 */
const mistOpacity = computed(() => (effectiveIntensity.value / INTENSITY_MAX) * 0.85)

function onIntensityInput(event: Event) {
  const target = event.target as HTMLInputElement
  store.setIntensity(Number(target.value))
}

function onSelectScent(id: ScentId) {
  store.selectScent(id)
}
</script>

<template>
  <GlassCard
    class="fragrance-card"
    title="香氛"
    :style="{ '--ambient': ambientColor }"
  >
    <template #actions>
      <button
        class="switch"
        type="button"
        role="switch"
        :aria-checked="on"
        :class="{ 'switch--on': on }"
        @click="store.toggle()"
      >
        <span class="switch__track"><span class="switch__thumb" /></span>
        <span class="switch__label">{{ on ? '开' : '关' }}</span>
      </button>
    </template>

    <!-- 即时反馈：当前香型与强度 -->
    <div class="feedback" :class="{ 'feedback--off': !on }">
      <div class="feedback__mist" :style="{ opacity: mistOpacity }" aria-hidden="true" />
      <div class="feedback__icon" aria-hidden="true">{{ currentPreset.icon }}</div>
      <div class="feedback__text">
        <div class="feedback__name">{{ currentPreset.label }}</div>
        <div class="feedback__desc">{{ on ? currentPreset.desc : '香氛已关闭' }}</div>
      </div>
      <div class="feedback__intensity">
        <span class="feedback__intensity-value">{{ on ? intensity : 0 }}</span>
        <span class="feedback__intensity-tag">{{ intensityLabel }}</span>
      </div>
    </div>

    <!-- 香型选择 -->
    <div class="scents" role="radiogroup" aria-label="香型选择">
      <button
        v-for="p in presets"
        :key="p.id"
        type="button"
        role="radio"
        class="scent"
        :class="{ 'scent--active': p.id === scent && on }"
        :aria-checked="p.id === scent"
        :style="{ '--scent-color': p.color }"
        @click="onSelectScent(p.id)"
      >
        <span class="scent__icon">{{ p.icon }}</span>
        <span class="scent__label">{{ p.label }}</span>
      </button>
    </div>

    <!-- 释放强度调节 -->
    <div class="intensity" :class="{ 'intensity--disabled': !on }">
      <div class="intensity__head">
        <label for="fragrance-intensity">释放强度</label>
        <span class="intensity__readout">{{ intensity }}%</span>
      </div>
      <input
        id="fragrance-intensity"
        class="intensity__slider"
        type="range"
        :min="INTENSITY_MIN"
        :max="INTENSITY_MAX"
        :step="INTENSITY_STEP"
        :value="intensity"
        :disabled="!on"
        aria-label="释放强度"
        @input="onIntensityInput"
      />
    </div>
  </GlassCard>
</template>

<style scoped>
.fragrance-card {
  width: 420px;
}

/* 开关 */
.switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}
.switch__track {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  border-radius: 999px;
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border);
  transition: background 0.25s ease;
}
.switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s ease;
}
.switch--on .switch__track {
  background: var(--ambient, var(--color-accent));
}
.switch--on .switch__thumb {
  transform: translateX(24px);
}

/* 即时反馈区 */
.feedback {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--ambient) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--ambient) 45%, transparent);
  overflow: hidden;
  transition: background 0.4s ease, border-color 0.4s ease;
}
.feedback--off {
  background: var(--color-surface);
  border-color: var(--color-border);
}
.feedback__mist {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 140% at 15% 0%, var(--ambient), transparent 60%);
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.feedback__icon {
  position: relative;
  font-size: 34px;
  line-height: 1;
}
.feedback__text {
  position: relative;
  flex: 1;
  min-width: 0;
}
.feedback__name {
  font-size: var(--font-size-lg);
  font-weight: 600;
}
.feedback__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.feedback__intensity {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.feedback__intensity-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.feedback__intensity-tag {
  font-size: var(--font-size-sm);
  color: var(--color-text-dim);
}

/* 香型选择 */
.scents {
  display: flex;
  gap: var(--space-2);
}
.scent {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s ease, background 0.2s ease;
}
.scent:hover {
  transform: translateY(-2px);
}
.scent--active {
  background: color-mix(in srgb, var(--scent-color) 26%, transparent);
  border-color: var(--scent-color);
  box-shadow: 0 0 0 1px var(--scent-color) inset;
}
.scent__icon {
  font-size: 22px;
}
.scent__label {
  font-size: var(--font-size-sm);
}

/* 强度调节 */
.intensity {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: opacity 0.2s ease;
}
.intensity--disabled {
  opacity: 0.5;
}
.intensity__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--font-size-sm);
  color: var(--color-text-dim);
}
.intensity__readout {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}
.intensity__slider {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(
    to right,
    var(--ambient, var(--color-accent)) 0%,
    var(--ambient, var(--color-accent)) calc(var(--pct, 0) * 1%),
    var(--color-surface-strong) 0%
  );
  cursor: pointer;
}
.intensity__slider:disabled {
  cursor: not-allowed;
}
.intensity__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--ambient, var(--color-accent));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
.intensity__slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--ambient, var(--color-accent));
}
</style>
