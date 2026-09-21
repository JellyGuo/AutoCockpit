<script setup lang="ts">
/**
 * WakeUpScene —— 结束唤醒视觉层（任务 #8 唤醒表现）
 *
 * 仅在 store.phase==='waking' 时呈现，覆盖全屏画布：
 *  - 背景灯光「由暗渐亮」：一层暖色光晕，其不透明度随 useNapSession 的 `wakeGlow`（0→1）上升。
 *  - 舒缓音乐指示：与 useNapSession 合成的柔和和弦同步，给出「正在播放舒缓音乐」的视觉反馈。
 *  - 视觉唤醒提示：呼吸光点 + 文案，引导用户平缓醒来。
 *  - 完成按钮：结束唤醒（停止声/光、复位会话）。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRestSessionStore } from '@/stores/restSession'
import type { NapSession } from '@/composables/useNapSession'

const props = defineProps<{ session: NapSession }>()

const store = useRestSessionStore()
const { phase } = storeToRefs(store)

const visible = computed(() => phase.value === 'waking')
/** 光晕不透明度直接映射唤醒进度（由暗渐亮）。 */
const glowOpacity = computed(() => props.session.wakeGlow.value)
</script>

<template>
  <Transition name="wake-fade">
    <div v-if="visible" class="wake" role="dialog" aria-label="小憩结束唤醒">
      <!-- 由暗渐亮的暖色光晕层 -->
      <div class="wake__glow" :style="{ opacity: glowOpacity }" />

      <div class="wake__center">
        <div class="wake__pulse" />
        <h2 class="wake__title">小憩结束</h2>
        <p class="wake__subtitle">灯光正缓缓亮起，愿你带着松弛醒来</p>

        <div class="wake__music" :class="{ 'wake__music--on': session.musicPlaying.value }">
          <span class="wake__music-bars" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          <span>{{ session.musicPlaying.value ? '舒缓音乐播放中' : '准备唤醒…' }}</span>
        </div>

        <button class="wake__btn" type="button" @click="session.dismissWake()">
          我已醒来
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.wake {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 起始为暗场，光晕层负责由暗渐亮 */
  background: rgba(6, 9, 14, 0.86);
  overflow: hidden;
}

/* 暖色渐亮光晕：从中心向外扩散的柔光，opacity 随 wakeGlow 上升 */
.wake__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 50% 42%,
      rgba(255, 236, 200, 0.9) 0%,
      rgba(255, 214, 170, 0.5) 28%,
      rgba(255, 190, 150, 0.12) 55%,
      rgba(255, 190, 150, 0) 75%
    );
  transition: opacity 400ms var(--motion-easing);
}

.wake__center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  text-align: center;
  color: var(--color-text-primary);
  font-family: var(--font-family);
}

/* 呼吸光点：温和的视觉唤醒提示 */
.wake__pulse {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 245, 225, 0.95), rgba(255, 210, 160, 0.4));
  box-shadow: 0 0 48px rgba(255, 224, 178, 0.75);
  animation: wake-breathe 3.2s var(--motion-easing) infinite;
}

@keyframes wake-breathe {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.12);
    opacity: 1;
  }
}

.wake__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.wake__subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
}

/* 舒缓音乐指示 */
.wake__music {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  opacity: 0.6;
}
.wake__music--on {
  opacity: 1;
  color: var(--color-text-primary);
}
.wake__music-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}
.wake__music-bars i {
  width: 3px;
  height: 6px;
  border-radius: 2px;
  background: var(--color-accent-soft);
}
.wake__music--on .wake__music-bars i {
  animation: wake-eq 1s ease-in-out infinite;
}
.wake__music-bars i:nth-child(2) {
  animation-delay: 0.2s;
}
.wake__music-bars i:nth-child(3) {
  animation-delay: 0.4s;
}
.wake__music-bars i:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes wake-eq {
  0%,
  100% {
    height: 6px;
  }
  50% {
    height: 18px;
  }
}

.wake__btn {
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-family: var(--font-family);
  cursor: pointer;
  transition: background var(--motion-normal) var(--motion-easing);
}
.wake__btn:hover {
  background: rgba(255, 255, 255, 0.32);
}

/* 覆盖层淡入淡出 */
.wake-fade-enter-active,
.wake-fade-leave-active {
  transition: opacity var(--motion-normal) var(--motion-easing);
}
.wake-fade-enter-from,
.wake-fade-leave-to {
  opacity: 0;
}
</style>
