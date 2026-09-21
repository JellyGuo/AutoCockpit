<script setup lang="ts">
/**
 * GlassCard —— 可复用毛玻璃卡片
 *
 * 以 backdrop-filter 实现磨砂半透明层次，配大圆角与顶部高光描边，
 * 通过默认插槽包裹任意内容；可选具名插槽 `header` / `footer`。
 * 全部视觉来自集中主题令牌（theme.css 的 CSS 自定义属性）。
 */
withDefaults(
  defineProps<{
    /** 模糊强度档位，映射到主题模糊令牌 */
    blur?: 'sm' | 'md' | 'lg'
    /** 内边距档位，映射到主题间距令牌 */
    padding?: 'sm' | 'md' | 'lg'
    /** 圆角档位，映射到主题圆角令牌 */
    radius?: 'sm' | 'md' | 'lg'
    /** 是否使用更高不透明度的强填充（激活/悬浮强调态） */
    strong?: boolean
    /** 是否开启悬浮交互反馈（轻微上浮 + 高亮） */
    interactive?: boolean
  }>(),
  {
    blur: 'md',
    padding: 'md',
    radius: 'lg',
    strong: false,
    interactive: false,
  },
)
</script>

<template>
  <section
    class="glass-card"
    :class="[
      `glass-card--blur-${blur}`,
      `glass-card--pad-${padding}`,
      `glass-card--radius-${radius}`,
      { 'glass-card--strong': strong, 'glass-card--interactive': interactive },
    ]"
  >
    <header v-if="$slots.header" class="glass-card__header">
      <slot name="header" />
    </header>

    <div class="glass-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="glass-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.glass-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  box-sizing: border-box;
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  line-height: var(--line-height);

  /* 半透明磨砂层次 */
  background: var(--color-glass-fill);
  border: 1px solid var(--color-glass-border);
  /* 顶部高光 + 底部投影，营造玻璃厚度 */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 12px 32px var(--color-shadow);

  /* 磨砂：模糊并轻微提亮背后景象 */
  -webkit-backdrop-filter: blur(var(--blur-md)) saturate(140%);
  backdrop-filter: blur(var(--blur-md)) saturate(140%);

  transition:
    transform var(--motion-fast) var(--motion-easing),
    background var(--motion-normal) var(--motion-easing),
    box-shadow var(--motion-normal) var(--motion-easing);
}

/* 模糊档位 */
.glass-card--blur-sm {
  -webkit-backdrop-filter: blur(var(--blur-sm)) saturate(140%);
  backdrop-filter: blur(var(--blur-sm)) saturate(140%);
}
.glass-card--blur-md {
  -webkit-backdrop-filter: blur(var(--blur-md)) saturate(140%);
  backdrop-filter: blur(var(--blur-md)) saturate(140%);
}
.glass-card--blur-lg {
  -webkit-backdrop-filter: blur(var(--blur-lg)) saturate(140%);
  backdrop-filter: blur(var(--blur-lg)) saturate(140%);
}

/* 圆角档位 */
.glass-card--radius-sm {
  border-radius: var(--radius-sm);
}
.glass-card--radius-md {
  border-radius: var(--radius-md);
}
.glass-card--radius-lg {
  border-radius: var(--radius-lg);
}

/* 内边距档位 */
.glass-card--pad-sm {
  padding: var(--space-sm);
}
.glass-card--pad-md {
  padding: var(--space-md);
}
.glass-card--pad-lg {
  padding: var(--space-lg);
}

/* 强填充态 */
.glass-card--strong {
  background: var(--color-glass-fill-strong);
}

/* 交互反馈 */
.glass-card--interactive {
  cursor: pointer;
}
.glass-card--interactive:hover {
  transform: translateY(-2px);
  background: var(--color-glass-fill-strong);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    0 18px 40px var(--color-shadow);
}

.glass-card__header {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.glass-card__body {
  flex: 1 1 auto;
  min-height: 0;
}

.glass-card__footer {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 不支持 backdrop-filter 时的降级：加深填充以维持可读性 */
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .glass-card {
    background: rgba(27, 36, 49, 0.72);
  }
}
</style>
