<script setup lang="ts">
/**
 * FragranceCard —— 香氛释放卡片（任务 #6）
 *
 * - 香氛开关。
 * - 香型选择（即时反馈当前香型）。
 * - 释放强度连续调节（实时更新并显示强度状态）。
 * - 状态经 restSession store 的 action 写入（canonical 单一数据契约）；
 *   选择香型时同时把香型代表色注入整体氛围（store.setAmbianceColor），
 *   实现「操作卡片实时改变氛围/背景」的联动。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import GlassCard from '@/components/base/GlassCard.vue'
import { useRestSessionStore } from '@/stores/restSession'

/** 香型预设定义。 */
interface ScentPreset {
  id: string
  label: string
  desc: string
  color: string
  icon: string
}

const INTENSITY_MIN = 0
const INTENSITY_MAX = 100
const INTENSITY_STEP = 1

/** 可选香型预设列表。 */
const SCENT_PRESETS: readonly ScentPreset[] = [
  { id: 'forest', label: '森林', desc: '雪松与松针的清冽木质香', color: '#4c9a6b', icon: '🌲' },
  { id: 'ocean', label: '海洋', desc: '咸润海风的通透水生香', color: '#3d8bd6', icon: '🌊' },
  { id: 'citrus', label: '柑橘', desc: '佛手柑与甜橙的明亮果香', color: '#e6a33e', icon: '🍊' },
  { id: 'lavender', label: '薰衣草', desc: '安神舒缓的紫调花香', color: '#8b7ad0', icon: '💜' },
  { id: 'tea', label: '白茶', desc: '淡雅回甘的清新茶香', color: '#8fb98a', icon: '🍃' },
] as const

function getScentPreset(id: string): ScentPreset {
  return SCENT_PRESETS.find((s) => s.id === id) ?? SCENT_PRESETS[0]
}

const store = useRestSessionStore()
const { fragrance } = storeToRefs(store)

/** 当前香型预设。 */
const currentPreset = computed(() => getScentPreset(fragrance.value.scent))

/** 有效强度：关闭时为 0。 */
const effectiveIntensity = computed(() => (fragrance.value.on ? fragrance.value.intensity : 0))

/** 强度档位文案，用于即时反馈。 */
const intensityLabel = computed(() => {
  if (!fragrance.value.on) return '已关闭'
  const v = fragrance.value.intensity
  if (v === 0) return '待机'
  if (v <= 33) return '轻柔'
  if (v <= 66) return '适中'
  return '浓郁'
})

/** 卡片氛围色：随当前香型与是否开启变化。 */
const ambientColor = computed(() =>
  fragrance.value.on ? currentPreset.value.color : 'var(--color-text-secondary)',
)

/** 香雾动画透明度，随有效强度联动。 */
const mistOpacity = computed(() => (effectiveIntensity.value / INTENSITY_MAX) * 0.85)

function onIntensityInput(event: Event): void {
  const target = event.target as HTMLInputElement
  store.setFragranceIntensity(Number(target.value))
}

function onToggle(): void {
  store.setFragranceOn(!fragrance.value.on)
}

/** 选择香型：写入 store 并把香型色注入整体氛围（联动背景/氛围）。 */
function onSelectScent(id: string): void {
  store.selectScent(id)
  store.setAmbianceColor(getScentPreset(id).color)
}
</script>

<template>
  <GlassCard padding="lg" class="fragrance-card" :style="{ '--ambient': ambientColor }">
    <template #header>
      <div class="frag-header">
        <span>香氛</span>
        <button
          class="switch"
          type="button"
          role="switch"
          :aria-checked="fragrance.on"
          :class="{ 'switch--on': fragrance.on }"
          @click="onToggle"
        >
          <span class="switch__track"><span class="switch__thumb" /></span>
          <span class="switch__label">{{ fragrance.on ? '开' : '关' }}</span>
        </button>
      </div>
    </template>

    <!-- 即时反馈：当前香型与强度 -->
    <div class="feedback" :class="{ 'feedback--off': !fragrance.on }">
      <div class="feedback__mist" :style="{ opacity: mistOpacity }" aria-hidden="true" />
      <div class="feedback__icon" aria-hidden="true">{{ currentPreset.icon }}</div>
      <div class="feedback__text">
        <div class="feedback__name">{{ currentPreset.label }}</div>
        <div class="feedback__desc">{{ fragrance.on ? currentPreset.desc : '香氛已关闭' }}</div>
      </div>
      <div class="feedback__intensity">
        <span class="feedback__intensity-value">{{ fragrance.on ? fragrance.intensity : 0 }}</span>
        <span class="feedback__intensity-tag">{{ intensityLabel }}</span>
      </div>
    </div>

    <!-- 香型选择 -->
    <div class="scents" role="radiogroup" aria-label="香型选择">
      <button
        v-for="p in SCENT_PRESETS"
        :key="p.id"
        type="button"
        role="radio"
        class="scent"
        :class="{ 'scent--active': p.id === fragrance.scent && fragrance.on }"
        :aria-checked="p.id === fragrance.scent"
        :style="{ '--scent-color': p.color }"
        @click="onSelectScent(p.id)"
      >
        <span class="scent__icon">{{ p.icon }}</span>
        <span class="scent__label">{{ p.label }}</span>
      </button>
    </div>

    <!-- 释放强度调节 -->
    <div class="intensity" :class="{ 'intensity--disabled': !fragrance.on }">
      <div class="intensity__head">
        <label for="fragrance-intensity">释放强度</label>
        <span class="intensity__readout">{{ fragrance.intensity }}%</span>
      </div>
      <input
        id="fragrance-intensity"
        class="intensity__slider"
        type="range"
        :min="INTENSITY_MIN"
        :max="INTENSITY_MAX"
        :step="INTENSITY_STEP"
        :value="fragrance.intensity"
        :disabled="!fragrance.on"
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

.frag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 开关 */
.switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
.switch__track {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid var(--color-glass-border);
  transition: background var(--motion-normal) var(--motion-easing);
}
.switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--motion-normal) var(--motion-easing);
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
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--ambient) 22%, transparent);
  border: 1px solid color-mix(in srgb, var(--ambient) 45%, transparent);
  overflow: hidden;
  transition:
    background var(--motion-normal) var(--motion-easing),
    border-color var(--motion-normal) var(--motion-easing);
}
.feedback--off {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--color-glass-border);
}
.feedback__mist {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 140% at 15% 0%, var(--ambient), transparent 60%);
  transition: opacity var(--motion-normal) var(--motion-easing);
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
  font-weight: var(--font-weight-medium);
}
.feedback__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
}
.feedback__intensity-tag {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 香型选择 */
.scents {
  display: flex;
  gap: var(--space-xs);
}
.scent {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) 4px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-family);
  transition:
    transform var(--motion-fast) var(--motion-easing),
    border-color var(--motion-normal) var(--motion-easing),
    background var(--motion-normal) var(--motion-easing);
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
  gap: var(--space-xs);
  transition: opacity var(--motion-fast) var(--motion-easing);
}
.intensity--disabled {
  opacity: 0.5;
}
.intensity__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.intensity__readout {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.intensity__slider {
  width: 100%;
  height: 6px;
  border-radius: var(--radius-pill);
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.24);
  accent-color: var(--ambient, var(--color-accent));
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
