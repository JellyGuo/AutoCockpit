<script setup lang="ts">
/**
 * ShadeWindowCard — 遮阳帘 / 车窗调节卡片（任务 #7 核心交付）。
 * - 遮阳帘：连续滑动 + 档位快捷，实时百分比显示 + 车窗上方帘幕下拉可视化。
 * - 车窗：连续滑动 + 档位快捷，实时百分比显示 + 玻璃下降可视化。
 * - 所有交互实时写入 restSession store，界面即时可视化反馈开合度/升降度。
 */
import { computed } from 'vue'
import GlassCard from '@/components/base/GlassCard.vue'
import {
  useRestSessionStore,
  OPENNESS_MIN,
  OPENNESS_MAX,
  SHADE_PRESETS,
  WINDOW_PRESETS,
} from '@/stores/restSession'

const store = useRestSessionStore()

/** 遮阳帘开合度双向绑定：读 store、写 action（滑块 input 实时触发） */
const shadeOpenness = computed({
  get: () => store.shadeOpenness,
  set: (v: number) => store.setShadeOpenness(Number(v)),
})

/** 车窗升降度双向绑定：读 store、写 action */
const windowOpenness = computed({
  get: () => store.windowOpenness,
  set: (v: number) => store.setWindowOpenness(Number(v)),
})

/** 帘幕下拉高度百分比（随开合度增大而覆盖更多车窗） */
const shadeCoverPct = computed(() => `${store.shadeRatio * 100}%`)

/** 玻璃可见高度百分比（车窗降得越低，玻璃可见部分越少） */
const glassVisiblePct = computed(() => `${(1 - store.windowRatio) * 100}%`)

const shadeLabel = computed(() => `${store.shadeOpenness}%`)
const windowLabel = computed(() => `${store.windowOpenness}%`)

function selectShadePreset(value: number) {
  store.setShadeOpenness(value)
}
function selectWindowPreset(value: number) {
  store.setWindowOpenness(value)
}
</script>

<template>
  <GlassCard title="遮阳帘 · 车窗" class="sw-card">
    <!-- 车门/车窗可视化：帘幕自上覆盖 + 玻璃自下降 -->
    <div
      class="sw-visual"
      role="img"
      :aria-label="`遮阳帘开合 ${shadeLabel}，车窗升降 ${windowLabel}`"
    >
      <div class="sw-window">
        <!-- 车窗外景（车窗降下后露出的开口） -->
        <div class="sw-window__scene" />
        <!-- 玻璃：高度随车窗升降度变化，越降越矮 -->
        <div class="sw-window__glass" :style="{ height: glassVisiblePct }">
          <span class="sw-window__glare" />
        </div>
        <!-- 遮阳帘：自顶部下拉，覆盖高度随开合度变化 -->
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
          :class="{ 'chip--active': store.shadeOpenness === p.value }"
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
          :class="{ 'chip--active': store.windowOpenness === p.value }"
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
  gap: var(--ac-space-lg);
  padding: var(--ac-space-md);
  border-radius: var(--ac-radius-md);
  background: rgba(0, 0, 0, 0.16);
}
.sw-window {
  position: relative;
  width: 150px;
  height: 110px;
  flex: 0 0 auto;
  border-radius: var(--ac-radius-sm);
  border: 3px solid var(--ac-text-dim);
  overflow: hidden;
  background: #0e2a33;
}
/* 车窗开口露出的外景（车窗降下时可见） */
.sw-window__scene {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #8fd3ff 0%, #b9e6c9 60%, #d8efc4 100%);
}
/* 玻璃层：贴顶，高度随车窗升降度变化 */
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
  transition: height 0.18s ease;
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
/* 遮阳帘层：贴顶下拉，高度随开合度变化，压在玻璃之上 */
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
  transition: height 0.18s ease;
}
.sw-window__shade-hem {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--ac-accent);
  box-shadow: 0 0 6px var(--ac-accent-soft);
}
.sw-readout {
  display: flex;
  flex-direction: column;
  gap: var(--ac-space-sm);
}
.sw-readout__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ac-space-md);
  min-width: 110px;
}
.sw-readout__key {
  font-size: 14px;
  color: var(--ac-text-dim);
}
.sw-readout__val {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--ac-accent);
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
.chip:hover {
  background: rgba(255, 255, 255, 0.12);
}
.chip--active {
  background: var(--ac-accent);
  border-color: var(--ac-accent);
  color: #06302b;
  font-weight: 600;
}
</style>
