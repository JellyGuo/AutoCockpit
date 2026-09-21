<script setup lang="ts">
/**
 * ScreenScaler
 * 1920×1080 固定画布的等比缩放容器。
 * 以 transform: scale 对固定尺寸画布做等比缩放，并在视口内水平/垂直居中，
 * 随窗口尺寸变化实时更新缩放比例，画布始终完整可见且不产生滚动条。
 * 插槽内容在 1920×1080 的设计坐标系下按像素布局，无需关心真实视口尺寸。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const scale = ref(1)

function updateScale() {
  const scaleX = window.innerWidth / DESIGN_WIDTH
  const scaleY = window.innerHeight / DESIGN_HEIGHT
  // 取较小者以保证画布完整落入视口（等比、留边不裁切）
  scale.value = Math.min(scaleX, scaleY)
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
})
</script>

<template>
  <div class="screen-scaler">
    <div
      class="screen-scaler__canvas"
      :style="{ transform: `translate(-50%, -50%) scale(${scale})` }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.screen-scaler {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}

.screen-scaler__canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  overflow: hidden;
}
</style>
