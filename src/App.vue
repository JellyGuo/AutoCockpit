<script setup lang="ts">
/**
 * App 根组件。
 * 在 1920×1080 定屏容器内装配任务 #8 的小憩会话闭环：
 *  - 全屏风景背景（BackgroundScene，其亮度随氛围灯亮度联动，唤醒时由暗渐亮）；
 *  - 小憩时长设置与会话控制卡片（NapTimerCard）；
 *  - 结束唤醒视觉层（WakeUpScene）。
 * useNapSession 在此**唯一实例化**，作为单例会话运行时向两个组件下发，保证只有一个倒计时驱动。
 *
 * 说明：本文件由脚手架创建、集成任务收口；此处为 #8 的自测演示装配，
 * 主页面完整组装（五类卡片联动）属集成任务 #9。
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ScreenScaler from '@/components/ScreenScaler.vue'
import BackgroundScene from '@/components/base/BackgroundScene.vue'
import NapTimerCard from '@/components/session/NapTimerCard.vue'
import WakeUpScene from '@/components/session/WakeUpScene.vue'
import { useRestSessionStore } from '@/stores/restSession'
import { useNapSession } from '@/composables/useNapSession'

const store = useRestSessionStore()
const { currentBackground, ambientLight } = storeToRefs(store)

// 单例会话运行时
const session = useNapSession()

/** 背景整体亮度随氛围灯亮度联动（唤醒渐亮时同步变亮）。 */
const sceneFilter = computed(() => {
  const b = ambientLight.value.brightness
  const brightness = 0.55 + (b / 100) * 0.55
  return `brightness(${brightness.toFixed(2)})`
})
</script>

<template>
  <ScreenScaler>
    <div class="stage">
      <div class="stage__bg" :style="{ filter: sceneFilter }">
        <BackgroundScene :src="currentBackground" />
      </div>

      <div class="stage__content">
        <NapTimerCard :session="session" />
      </div>

      <WakeUpScene :session="session" />
    </div>
  </ScreenScaler>
</template>

<style scoped>
.stage {
  position: relative;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
}

.stage__bg {
  position: absolute;
  inset: 0;
  transition: filter var(--motion-crossfade) var(--motion-easing);
}

.stage__content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
