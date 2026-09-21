<script setup lang="ts">
/**
 * App 根组件 —— 占位级最小实现，用于让本任务分支可独立自测 / 预览氛围灯与音乐卡片。
 * 权威的 1920×1080 定屏容器与主页面组装由脚手架 #1 / 集成任务 #9 负责，
 * 集成阶段将以其版本为准替换此占位。
 */
import AmbientMediaCard from '@/components/cards/AmbientMediaCard.vue'
</script>

<template>
  <main class="app-stage">
    <AmbientMediaCard />
  </main>
</template>

<style scoped>
.app-stage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(140deg, #2b3a67 0%, #55407a 55%, #1b2431 100%);
}
</style>
