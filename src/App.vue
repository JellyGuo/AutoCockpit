<script setup lang="ts">
// 最小演示挂载点：用于香氛卡片（任务 #6）的独立自测。
// 说明：App 根组件与主页面组装属于任务 #1/#9，此处仅提供最小承载以便本卡片可独立构建预览；
// 集成时以主页面 RestModeView 为准。
import FragranceCard from './cards/fragrance/FragranceCard.vue'
</script>

<template>
  <main class="stage">
    <FragranceCard />
  </main>
</template>

<style scoped>
.stage {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 120% at 70% 10%, #2a4a52, #14232b 60%, #0d181e);
  font-family: var(--font-family);
}
</style>
