<script setup lang="ts">
/**
 * App 根组件 —— 占位级最小实现，用于让本任务分支可独立自测/预览座椅卡片。
 * 权威的 1920×1080 定屏容器与主页面组装由脚手架 #1 / 集成任务 #9 负责，
 * 集成阶段将以其版本为准替换此占位。
 */
import SeatMassageCard from '@/components/cards/SeatMassageCard.vue'
</script>

<template>
  <main class="app-stage">
    <SeatMassageCard />
  </main>
</template>

<style scoped>
.app-stage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(135deg, #2b4a5a 0%, #4a6b6f 60%, #6b8f7a 100%);
}
</style>
