<script setup lang="ts">
/**
 * BackgroundScene —— 全屏大幅风景背景层
 *
 * 铺满 1920×1080 定屏画布；当背景源 `src` 变化时，新旧两层交叉淡入淡出平滑过渡。
 * 借助 Vue <Transition> 默认（enter/leave 同时进行）+ 绝对定位堆叠实现真正的 crossfade。
 * 可叠加一层暗化/渐变遮罩，保证其上毛玻璃卡片与文字的可读性。
 * 视觉参数（兜底底色、过渡时长/缓动）均引用集中主题令牌。
 */
withDefaults(
  defineProps<{
    /** 当前背景源（图片 URL 或任意合法 CSS background 值，如 gradient） */
    src: string
    /** 背景填充方式 */
    fit?: 'cover' | 'contain'
    /** 是否叠加暗化渐变遮罩以提升前景可读性 */
    overlay?: boolean
    /** 遮罩强度 0~1 */
    overlayStrength?: number
  }>(),
  {
    fit: 'cover',
    overlay: true,
    overlayStrength: 0.35,
  },
)

/** 将 src 归一化为合法的 CSS background-image 值：URL 走 url()，函数式（gradient）原样使用。 */
function toBackgroundImage(src: string): string {
  const value = src.trim()
  if (/^(linear-gradient|radial-gradient|conic-gradient|url|var)\(/i.test(value)) {
    return value
  }
  return `url("${value}")`
}
</script>

<template>
  <div class="bg-scene">
    <!-- 交叉淡入淡出：以 src 为 key，enter/leave 同时进行形成 crossfade -->
    <Transition name="bg-fade">
      <div
        :key="src"
        class="bg-scene__layer"
        :class="`bg-scene__layer--${fit}`"
        :style="{ backgroundImage: toBackgroundImage(src) }"
      />
    </Transition>

    <!-- 可读性遮罩 -->
    <div
      v-if="overlay"
      class="bg-scene__overlay"
      :style="{ opacity: overlayStrength }"
    />

    <!-- 前景内容（如整页卡片布局）通过默认插槽叠加在背景之上 -->
    <div class="bg-scene__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bg-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* 图片加载前/过渡间隙的兜底底色 */
  background-color: var(--color-backdrop);
}

.bg-scene__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  /* 兜底底色，避免透明图片露出 */
  background-color: var(--color-backdrop);
  will-change: opacity;
}

.bg-scene__layer--cover {
  background-size: cover;
}
.bg-scene__layer--contain {
  background-size: contain;
}

/* crossfade：进入与离开同时进行，两层叠加过渡不透明度 */
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity var(--motion-crossfade) var(--motion-easing);
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}
.bg-fade-enter-to,
.bg-fade-leave-from {
  opacity: 1;
}

.bg-scene__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(9, 14, 22, 0.15) 0%,
    rgba(9, 14, 22, 0.55) 100%
  );
  transition: opacity var(--motion-normal) var(--motion-easing);
}

.bg-scene__content {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
