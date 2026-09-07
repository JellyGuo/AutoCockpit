# 任务清单

- [ ] #1 工程脚手架与基础布局骨架（3 SP，优先级 high）
  - 说明：Vite + React + TS 初始化；配置 1920x1080 基准与等比缩放容器；建立 ScenicBackground 纯 CSS 渐变风景背景与全局样式变量。
  - 依赖：无
  - 验收标准：项目能 npm install 与 npm run dev 启动；页面以 1920x1080 基准渲染纯 CSS 渐变风景背景，无外部图片；视口偏离基准时等比缩放不错位。

- [ ] #2 全局状态管理 NapModeStore（3 SP，优先级 high）
  - 说明：Context + useReducer 实现 seat/ambient/audio/timer 四域状态与 actions；mock 数据；倒计时 interval。
  - 依赖：#1
  - 验收标准：提供统一 store，dispatch 可更新四域状态；mock 数据驱动，无网络请求；倒计时可驱动 timer.remainingMs。

- [ ] #3 通用毛玻璃组件与触控控件（3 SP，优先级 normal）
  - 说明：GlassCard、触控友好 Slider、ToggleGroup、IconButton、ColorSwatch（内联 SVG 图标，触控目标 ≥ 44px）。
  - 依赖：#1
  - 验收标准：GlassCard 为毛玻璃样式；Slider/ToggleGroup 支持触控（pointer）且目标尺寸 ≥ 44px；图标为内联 SVG。

- [ ] #4 座椅调节卡片（2 SP，优先级 normal）
  - 说明：SeatCard：靠背角度、按摩开关/强度、加热档位，接入 store，实时反馈。
  - 依赖：#2、#3
  - 验收标准：拖动/点按靠背角度、切换按摩、切换加热档位均更新 store 并实时可见反馈。

- [ ] #5 氛围灯卡片 + 背景光晕联动（3 SP，优先级 normal）
  - 说明：AmbientCard：颜色/亮度/模式，接入 store；ScenicBackground 订阅 ambient.color 联动光晕。
  - 依赖：#2、#3
  - 验收标准：选色/调亮度/切模式更新 store；背景光晕与预览随颜色联动。

- [ ] #6 音乐 / 白噪音卡片（3 SP，优先级 normal）
  - 说明：AudioCard：播放/暂停、曲目/场景切换、音量，接入 store。
  - 依赖：#2、#3
  - 验收标准：播放/暂停切换状态与按钮外观；切曲目/场景更新信息且播放状态一致；音量实时反映。

- [ ] #7 定时唤醒卡片 + 顶部倒计时徽标（3 SP，优先级 normal）
  - 说明：TimerCard：预设时长/自定义时间、启动/取消、倒计时；顶部状态栏徽标同步。
  - 依赖：#2、#3
  - 验收标准：设置预设/自定义唤醒时间后显示剩余/目标时间；计时时倒计时持续更新；取消后清除并停止。

- [ ] #8 联动集成与测试验证（3 SP，优先级 high）
  - 说明：NapScreen 组装全部卡片；Vitest + RTL 覆盖 reducer 联动与关键交互；npm run build 通过；手动核对布局无溢出与触控可用。
  - 依赖：#4、#5、#6、#7
  - 验收标准：NapScreen 展示全部卡片且布局无溢出；npm run build 通过；Vitest 用例覆盖 reducer 联动与关键控件交互且全绿。
