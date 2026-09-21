<script setup lang="ts">
/**
 * ShadeWindowCard —— 遮阳帘 / 车窗调节卡片（任务 #7）
 *
 * - 遮阳帘：连续滑动 + 档位快捷，实时百分比显示 + 帘幕自上覆盖可视化。
 * - 车窗：连续滑动 + 档位快捷，实时百分比显示 + 玻璃自下降可视化。
 * - 所有交互实时经 restSession store 的 action 写入，界面即时可视化反馈开合度/升降度。
 *
 * 已对齐集成基线的 canonical store：状态位于 `store.shadeWindow`，
 * 变更走 `setShade / setWindow`（0~100）。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import GlassCard from '@/components/base/GlassCard.vue'
import { useRestSessionStore } from '@/stores/restSession'

/** 开合度边界（0=全关，100=全开）。 */
const OPENNESS_MIN = 0
const OPENNESS_MAX = 100

const SHADE_PRESETS: { label: string; value: number }[] = [
  { label: '收起', value: 0 },
  { label: '半遮', value: 50 },
  { label: '全遮', value: 100 },
]
const WINDOW_PRESETS: { label: string; value: number }[] = [
  { label: '关闭', value: 0 },
  { label: '透气', value: 30 },
  { label: '半开', value: 60 },
  { label: '全开', value: 100 },
]

const store = useRestSessionStore()
const { shadeWindow } = storeToRefs(store)

/** 遮阳帘开合度双向绑定：读 store、写 action（滑块 input 实时触发）。 */
const shadeOpenness = computed({
  get: () => shadeWindow.value.shade,
  set: (v: number) => store.setShade(Number(v)),
})

/** 车窗升降度双向绑定。 */
const windowOpenness = computed({
  get: () => shadeWindow.value.window,
  set: (v: number) => store.setWindow(Number(v)),
})

/** 帘幕下拉高度百分比（随开合度增大而覆盖更多车窗）。 */
const shadeCoverPct = computed(() => `${shadeWindow.value.shade}%`)

/** 玻璃可见高度百分比（车窗降得越低，玻璃可见部分越少）。 */
const glassVisiblePct = computed(() => `${100 - shadeWindow.value.window}%`)

const shadeLabel = computed(() => `${shadeWindow.value.shade}%`)
const windowLabel = computed(() => `${shadeWindow.value.window}%`)

function selectShadePreset(value: number): void {
  store.setShade(value)
}
function selectWindowPreset(value: number): void {
  store.setWindow(value)
}
</script>

<template>
  <GlassCard padding="lg" class="sw-card">
    <template #header>
      <span>遮阳帘 · 车窗</span>
    </template>

    <!-- 车门/车窗可视化：帘幕自上覆盖 + 玻璃自下降 -->
    <div
      class="sw-visual"
      role="img"
      :aria-label="`遮阳帘开合 ${shadeLabel}，车窗升降 ${windowLabel}`"
    >
      <div class="sw-window">
        <div class="sw-window__scene" />
        <div class="sw-window__glass" :style="{ height: glassVisiblePct }">
          <span class="sw-window__glare" />
        </div>
        <div class="sw-window__shade" :style="{ height: shadeCoverPct }">
          <span class="sw-window__shade-hem" />
        </div>
      </div>
      <div class="sw-readout">
        <div class="sw-readout__row">
          <span class="sw-readout__key">遮阳帘</span>
          <span class="sw-readout__val">{{ shadeLabel }}</span>
        </div>
        <div class="sw-readout__row">
          <span class="sw-readout__key">车窗</span>
          <span class="sw-readout__val">{{ windowLabel }}</span>
        </div>
      </div>
    </div>

    <!-- 遮阳帘调节 -->
    <div class="ctrl">
      <div class="ctrl__label">
        <span>遮阳帘开合度</span>
        <span class="ctrl__value">{{ shadeLabel }}</span>
      </div>
      <input
        class="slider"
        type="range"
        :min="OPENNESS_MIN"
        :max="OPENNESS_MAX"
        step="1"
        v-model.number="shadeOpenness"
        aria-label="遮阳帘开合度滑动调节"
      />
      <div class="presets">
        <button
          v-for="p in SHADE_PRESETS"
          :key="p.value"
          type="button"
          class="chip"
          :class="{ 'chip--active': shadeWindow.shade === p.value }"
          @click="selectShadePreset(p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- 车窗调节 -->
    <div class="ctrl">
      <div class="ctrl__label">
        <span>车窗升降度</span>
        <span class="ctrl__value">{{ windowLabel }}</span>
      </div>
      <input
        class="slider"
        type="range"
        :min="OPENNESS_MIN"
        :max="OPENNESS_MAX"
        step="1"
        v-model.number="windowOpenness"
        aria-label="车窗升降度滑动调节"
      />
      <div class="presets">
        <button
          v-for="p in WINDOW_PRESETS"
          :key="p.value"
          type="button"
          class="chip"
          :class="{ 'chip--active': shadeWindow.window === p.value }"
          @click="selectWindowPreset(p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
  </GlassCard>
</template>

<style scoped>
.sw-card {
  width: 420px;
}

/* ---- 车窗可视化 ---- */
.sw-visual {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.16);
}
.sw-window {
  position: relative;
  width: 150px;
  height: 110px;
  flex: 0 0 auto;
  border-radius: var(--radius-sm);
  border: 3px solid var(--color-text-secondary);
  overflow: hidden;
  background: #0e2a33;
}
.sw-window__scene {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #8fd3ff 0%, #b9e6c9 60%, #d8efc4 100%);
}
.sw-window__glass {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    180deg,
    rgba(150, 200, 220, 0.55) 0%,
    rgba(110, 170, 195, 0.72) 100%
  );
  border-bottom: 2px solid rgba(255, 255, 255, 0.35);
  transition: height var(--motion-fast) var(--motion-easing);
  overflow: hidden;
}
.sw-window__glare {
  position: absolute;
  top: -20%;
  left: 30%;
  width: 40%;
  height: 160%;
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(18deg);
}
.sw-window__shade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: repeating-linear-gradient(
    180deg,
    rgba(58, 46, 38, 0.94) 0px,
    rgba(58, 46, 38, 0.94) 8px,
    rgba(74, 60, 48, 0.94) 8px,
    rgba(74, 60, 48, 0.94) 16px
  );
  transition: height var(--motion-fast) var(--motion-easing);
}
.sw-window__shade-hem {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-accent);
  box-shadow: 0 0 6px var(--color-accent-soft);
}
.sw-readout {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.sw-readout__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  min-width: 110px;
}
.sw-readout__key {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.sw-readout__val {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
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
.chip:hover {
  background: rgba(255, 255, 255, 0.12);
}
.chip--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #06302b;
  font-weight: var(--font-weight-medium);
}
</style>
