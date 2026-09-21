<script setup lang="ts">
/**
 * GlassCard 毛玻璃卡片（契约占位版本）
 * 说明：权威实现属于任务 #2（视觉基础层）。此处按约定的 props/slot 契约提供最小可用版本，
 * 使香氛卡片可独立自测；集成时以任务 #2 的权威组件为准（同路径 @/components/GlassCard.vue 直接替换）。
 */
withDefaults(
  defineProps<{
    /** 卡片标题 */
    title?: string
  }>(),
  { title: '' },
)
</script>

<template>
  <section class="glass-card">
    <header v-if="title || $slots.header" class="glass-card__header">
      <slot name="header">
        <h2 class="glass-card__title">{{ title }}</h2>
      </slot>
      <div class="glass-card__actions">
        <slot name="actions" />
      </div>
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
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(var(--blur-glass)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--blur-glass)) saturate(140%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
  color: var(--color-text);
}
.glass-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.glass-card__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.glass-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.glass-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
