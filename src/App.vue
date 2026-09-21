<script setup lang="ts">
/**
 * App 根组件。
 * 目前仅提供 1920×1080 定屏容器与空的挂载点，作为所有 UI 任务的前置骨架。
 * 后续视觉基础层、功能卡片与主页面将挂载在 ScreenScaler 插槽内。
 */
import ScreenScaler from '@/components/ScreenScaler.vue'
</script>

<template>
  <ScreenScaler>
    <!-- UI 内容挂载点：后续任务在此填充风景背景、毛玻璃卡片与主页面 -->
    <div class="app-root" />
  </ScreenScaler>
</template>

<style scoped>
.app-root {
  width: 100%;
  height: 100%;
}
</style>
