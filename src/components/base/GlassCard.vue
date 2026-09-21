<script setup lang="ts">
/**
 * GlassCard — 毛玻璃卡片基础组件（对应任务 #2 契约的最小实现）。
 * 承载功能内容：磨砂半透明 + 圆角 + 半透明边框层次。
 * 说明：本文件为使遮阳帘/车窗卡片可独立自测与呈现而提供的最小实现，
 * 集成阶段（#2/#9）若已有权威 GlassCard，可按目录约定合并去重。
 */
defineProps<{
  title?: string
}>()
</script>

<template>
  <section class="glass-card">
    <header v-if="title || $slots.header" class="glass-card__header">
      <slot name="header">
        <h3 class="glass-card__title">{{ title }}</h3>
      </slot>
    </header>
    <div class="glass-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.glass-card {
  display: flex;
  flex-direction: column;
  gap: var(--ac-space-md);
  padding: var(--ac-space-lg);
  border-radius: var(--ac-radius-lg);
  background: var(--ac-glass-bg);
  border: 1px solid var(--ac-glass-border);
  backdrop-filter: blur(var(--ac-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--ac-blur)) saturate(140%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  color: var(--ac-text);
  font-family: var(--ac-font);
}
.glass-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.glass-card__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.glass-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--ac-space-md);
}
</style>
