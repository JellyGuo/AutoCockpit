<script setup lang="ts">
/**
 * AmbientMediaCard —— 氛围灯与背景音乐 / 白噪音卡片（任务 #5）
 *
 * 在毛玻璃卡片内提供两块联动能力，全部状态变更经 restSession store 的 action 完成：
 *  1. 氛围灯：开关、颜色（预设色板 + 自定义取色）、亮度滑杆；卡片内实时预览灯光效果，
 *     且颜色 / 亮度经 `setLightColor` / `setLightBrightness` 联动驱动整体氛围（store.ambiance），
 *     从而影响背景遮罩等联动消费方（“氛围灯颜色可影响整体氛围”）。
 *  2. 背景音乐 / 白噪音：按类别切换音源列表、选择音源、播放 / 暂停、音量调节。
 *
 * 本组件为纯前端 UI/UE，不接真实音频硬件；播放态以 store 状态 + 视觉表现模拟。
 */
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import GlassCard from '@/components/base/GlassCard.vue'
import { useRestSessionStore, type AudioCategory } from '@/stores/restSession'

const store = useRestSessionStore()
const { ambientLight, audio } = storeToRefs(store)

/* ------------------------------ 氛围灯：预设 ------------------------------ */

/** 放松风格氛围灯预设色板。 */
const LIGHT_PRESETS: { label: string; color: string }[] = [
  { label: '暖霞', color: '#e6b8a2' },
  { label: '青蓝', color: '#7fb8c4' },
  { label: '暮紫', color: '#8a7fc4' },
  { label: '森绿', color: '#8fc4a0' },
  { label: '珊瑚', color: '#e8917f' },
  { label: '月白', color: '#dfe6f0' },
]

/** 当前氛围灯颜色是否命中某个预设（用于高亮选中态）。 */
function isActiveColor(color: string): boolean {
  return ambientLight.value.color.toLowerCase() === color.toLowerCase()
}

/** 灯光实时预览样式：颜色 + 亮度映射到发光强度；关灯时收敛为暗态。 */
const previewStyle = computed(() => {
  const { on, color, brightness } = ambientLight.value
  if (!on) {
    return {
      background: 'rgba(255, 255, 255, 0.06)',
      boxShadow: 'none',
      opacity: '0.35',
    }
  }
  // 亮度 0~100 映射到 0.35~1 的可见强度，兼顾低亮度下仍可辨识。
  const intensity = 0.35 + (brightness / 100) * 0.65
  const glow = 12 + (brightness / 100) * 56
  return {
    background: color,
    opacity: String(intensity),
    boxShadow: `0 0 ${glow}px ${Math.round(glow * 0.5)}px ${color}`,
  }
})

/* --------------------------- 氛围灯：事件处理 --------------------------- */

function onToggleLight(): void {
  store.setLightOn(!ambientLight.value.on)
}

function onPickColor(color: string): void {
  if (!ambientLight.value.on) store.setLightOn(true)
  store.setLightColor(color)
}

function onCustomColor(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  if (!ambientLight.value.on) store.setLightOn(true)
  store.setLightColor(value)
}

function onBrightness(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  store.setLightBrightness(value)
}

/* --------------------------- 背景音乐 / 白噪音 --------------------------- */

interface Track {
  id: string
  label: string
  /** 简短描述，用于列表副标题。 */
  hint: string
}

/** 各类别可选音源（前端模拟音源库）。 */
const TRACKS: Record<AudioCategory, Track[]> = {
  music: [
    { id: 'music-lofi', label: '慵懒午后', hint: 'Lo-Fi 轻音乐' },
    { id: 'music-piano', label: '静夜钢琴', hint: '舒缓钢琴曲' },
    { id: 'music-guitar', label: '木吉他晨光', hint: '原声吉他' },
    { id: 'music-ambient', label: '空灵氛围', hint: 'Ambient' },
  ],
  whiteNoise: [
    { id: 'noise-rain', label: '细雨', hint: '雨声白噪音' },
    { id: 'noise-ocean', label: '海浪', hint: '潮汐白噪音' },
    { id: 'noise-forest', label: '林间', hint: '鸟鸣与风声' },
    { id: 'noise-fire', label: '壁炉', hint: '柴火噼啪声' },
  ],
}

const CATEGORY_TABS: { value: AudioCategory; label: string }[] = [
  { value: 'music', label: '背景音乐' },
  { value: 'whiteNoise', label: '白噪音' },
]

/** 当前浏览的类别（本地视图状态；选中音源时同步进 store.audio.category）。 */
const viewCategory = ref<AudioCategory>(store.audio.category)

/** 当前类别下的音源列表。 */
const currentTracks = computed<Track[]>(() => TRACKS[viewCategory.value])

/** 当前选中音源标题（用于“正在播放”展示）。 */
const currentTrackLabel = computed<string>(() => {
  const id = audio.value.trackId
  if (!id) return '未选择音源'
  for (const list of Object.values(TRACKS)) {
    const hit = list.find((t) => t.id === id)
    if (hit) return hit.label
  }
  return '未知音源'
})

function switchCategory(category: AudioCategory): void {
  viewCategory.value = category
}

function isSelectedTrack(id: string): boolean {
  return audio.value.trackId === id
}

/** 选择音源：写入 store 并立即开始播放。 */
function onSelectTrack(track: Track): void {
  store.selectAudio(viewCategory.value, track.id)
  store.setPlaying(true)
}

function onTogglePlay(): void {
  store.togglePlay()
}

function onVolume(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  store.setVolume(value)
}

/** 是否可播放（已选中音源）。 */
const canPlay = computed<boolean>(() => audio.value.trackId !== null)
</script>

<template>
  <GlassCard class="ambient-media-card" padding="lg">
    <template #header>
      <div class="amc-title">
        <span>氛围灯与音乐</span>
        <span class="amc-subtitle">营造放松氛围</span>
      </div>
    </template>

    <!-- ============================ 氛围灯 ============================ -->
    <section class="amc-section">
      <div class="amc-section__head">
        <h4 class="amc-section__title">氛围灯</h4>
        <button
          type="button"
          class="amc-switch"
          :class="{ 'amc-switch--on': ambientLight.on }"
          role="switch"
          :aria-checked="ambientLight.on"
          aria-label="氛围灯开关"
          @click="onToggleLight"
        >
          <span class="amc-switch__knob" />
        </button>
      </div>

      <!-- 实时预览 -->
      <div class="amc-light-preview">
        <div class="amc-light-orb" :style="previewStyle" aria-hidden="true" />
        <div class="amc-light-meta">
          <span class="amc-light-value">{{ ambientLight.color.toUpperCase() }}</span>
          <span class="amc-light-value">亮度 {{ ambientLight.brightness }}%</span>
        </div>
      </div>

      <!-- 颜色色板 -->
      <div class="amc-swatches" role="group" aria-label="氛围灯颜色">
        <button
          v-for="preset in LIGHT_PRESETS"
          :key="preset.color"
          type="button"
          class="amc-swatch"
          :class="{ 'amc-swatch--active': isActiveColor(preset.color) }"
          :style="{ background: preset.color }"
          :title="preset.label"
          :aria-label="`氛围灯颜色 ${preset.label}`"
          :aria-pressed="isActiveColor(preset.color)"
          @click="onPickColor(preset.color)"
        />
        <label class="amc-swatch amc-swatch--custom" title="自定义颜色">
          <input
            type="color"
            class="amc-swatch__input"
            :value="ambientLight.color"
            aria-label="自定义氛围灯颜色"
            @input="onCustomColor"
          />
          <span class="amc-swatch__plus">+</span>
        </label>
      </div>

      <!-- 亮度 -->
      <label class="amc-slider">
        <span class="amc-slider__label">亮度</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="ambientLight.brightness"
          :disabled="!ambientLight.on"
          aria-label="氛围灯亮度"
          @input="onBrightness"
        />
        <span class="amc-slider__value">{{ ambientLight.brightness }}</span>
      </label>
    </section>

    <!-- ==================== 背景音乐 / 白噪音 ==================== -->
    <section class="amc-section">
      <div class="amc-section__head">
        <h4 class="amc-section__title">背景音乐 / 白噪音</h4>
      </div>

      <!-- 类别切换 -->
      <div class="amc-tabs" role="tablist" aria-label="音频类别">
        <button
          v-for="tab in CATEGORY_TABS"
          :key="tab.value"
          type="button"
          role="tab"
          class="amc-tab"
          :class="{ 'amc-tab--active': viewCategory === tab.value }"
          :aria-selected="viewCategory === tab.value"
          @click="switchCategory(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 音源列表 -->
      <ul class="amc-tracks">
        <li v-for="track in currentTracks" :key="track.id">
          <button
            type="button"
            class="amc-track"
            :class="{ 'amc-track--selected': isSelectedTrack(track.id) }"
            :aria-pressed="isSelectedTrack(track.id)"
            @click="onSelectTrack(track)"
          >
            <span class="amc-track__label">{{ track.label }}</span>
            <span class="amc-track__hint">{{ track.hint }}</span>
            <span
              v-if="isSelectedTrack(track.id) && audio.playing"
              class="amc-track__eq"
              aria-hidden="true"
            >
              <i /><i /><i />
            </span>
          </button>
        </li>
      </ul>

      <!-- 播放控制 + 音量 -->
      <div class="amc-transport">
        <button
          type="button"
          class="amc-play"
          :class="{ 'amc-play--playing': audio.playing }"
          :disabled="!canPlay"
          :aria-label="audio.playing ? '暂停' : '播放'"
          @click="onTogglePlay"
        >
          <span v-if="audio.playing" class="amc-icon-pause" aria-hidden="true" />
          <span v-else class="amc-icon-play" aria-hidden="true" />
        </button>

        <div class="amc-now-playing">
          <span class="amc-now-playing__state">
            {{ audio.playing ? '正在播放' : canPlay ? '已暂停' : '待选择' }}
          </span>
          <span class="amc-now-playing__track">{{ currentTrackLabel }}</span>
        </div>

        <label class="amc-slider amc-slider--volume">
          <span class="amc-slider__label">音量</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="audio.volume"
            aria-label="音量"
            @input="onVolume"
          />
          <span class="amc-slider__value">{{ audio.volume }}</span>
        </label>
      </div>
    </section>
  </GlassCard>
</template>

<style scoped>
.ambient-media-card {
  width: 420px;
}

.amc-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.amc-subtitle {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
}

.amc-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}
.amc-section + .amc-section {
  border-top: 1px solid var(--color-glass-border);
  margin-top: var(--space-xs);
}

.amc-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.amc-section__title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}

/* -------- 开关 -------- */
.amc-switch {
  width: 46px;
  height: 26px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-glass-border);
  background: rgba(255, 255, 255, 0.12);
  padding: 2px;
  cursor: pointer;
  transition: background var(--motion-fast) var(--motion-easing);
}
.amc-switch__knob {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transform: translateX(0);
  transition: transform var(--motion-fast) var(--motion-easing);
}
.amc-switch--on {
  background: var(--color-accent);
}
.amc-switch--on .amc-switch__knob {
  transform: translateX(20px);
}

/* -------- 灯光预览 -------- */
.amc-light-preview {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}
.amc-light-orb {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex: 0 0 auto;
  transition:
    background var(--motion-normal) var(--motion-easing),
    box-shadow var(--motion-normal) var(--motion-easing),
    opacity var(--motion-normal) var(--motion-easing);
}
.amc-light-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.amc-light-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
}

/* -------- 色板 -------- */
.amc-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.amc-swatch {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  box-shadow: 0 2px 8px var(--color-shadow);
  transition:
    transform var(--motion-fast) var(--motion-easing),
    border-color var(--motion-fast) var(--motion-easing);
}
.amc-swatch:hover {
  transform: scale(1.08);
}
.amc-swatch--active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--color-accent);
}
.amc-swatch--custom {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px dashed var(--color-glass-border);
  overflow: hidden;
}
.amc-swatch__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: none;
  padding: 0;
}
.amc-swatch__plus {
  font-size: 20px;
  line-height: 1;
  color: var(--color-text-primary);
  pointer-events: none;
}

/* -------- 滑杆 -------- */
.amc-slider {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.amc-slider__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  flex: 0 0 auto;
  width: 36px;
}
.amc-slider input[type='range'] {
  flex: 1 1 auto;
  accent-color: var(--color-accent);
  cursor: pointer;
}
.amc-slider input[type='range']:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.amc-slider__value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  flex: 0 0 auto;
  width: 30px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* -------- 类别切换 -------- */
.amc-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-pill);
}
.amc-tab {
  flex: 1 1 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: 6px 0;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition:
    background var(--motion-fast) var(--motion-easing),
    color var(--motion-fast) var(--motion-easing);
}
.amc-tab--active {
  background: var(--color-glass-fill-strong);
  color: var(--color-text-primary);
}

/* -------- 音源列表 -------- */
.amc-tracks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}
.amc-track {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-glass-border);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition:
    background var(--motion-fast) var(--motion-easing),
    border-color var(--motion-fast) var(--motion-easing);
}
.amc-track:hover {
  background: var(--color-glass-fill-strong);
}
.amc-track--selected {
  border-color: var(--color-accent);
  background: var(--color-glass-fill-strong);
}
.amc-track__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.amc-track__hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.amc-track__eq {
  position: absolute;
  top: 10px;
  right: 12px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.amc-track__eq i {
  width: 3px;
  background: var(--color-accent);
  border-radius: 2px;
  animation: amc-eq 0.9s ease-in-out infinite;
}
.amc-track__eq i:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}
.amc-track__eq i:nth-child(2) {
  height: 12px;
  animation-delay: 0.2s;
}
.amc-track__eq i:nth-child(3) {
  height: 8px;
  animation-delay: 0.4s;
}
@keyframes amc-eq {
  0%,
  100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}

/* -------- 播放控制 -------- */
.amc-transport {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xs);
}
.amc-play {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--color-accent);
  color: #10202a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform var(--motion-fast) var(--motion-easing),
    opacity var(--motion-fast) var(--motion-easing);
}
.amc-play:hover:not(:disabled) {
  transform: scale(1.06);
}
.amc-play:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.amc-icon-play {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 9px 0 9px 15px;
  border-color: transparent transparent transparent currentColor;
  margin-left: 3px;
}
.amc-icon-pause {
  width: 14px;
  height: 16px;
  border-left: 5px solid currentColor;
  border-right: 5px solid currentColor;
  box-sizing: border-box;
}

.amc-now-playing {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.amc-now-playing__state {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.amc-now-playing__track {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.amc-slider--volume {
  flex: 1 1 auto;
  max-width: 170px;
}
</style>
