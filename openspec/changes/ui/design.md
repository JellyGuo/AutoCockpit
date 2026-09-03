技术栈：React 18 + Vite + TypeScript，纯前端静态演示，无后端。

视觉：1920×1080 主设计稿 + 基础响应式（等比缩放容器 GlassScaler，窗口缩放不破版）；毛玻璃卡片（backdrop-filter）叠加程序化风景背景（CSS 多层渐变模拟天空/远山/光晕，零外部图片素材）。

状态：集中式 NapContext（Context + useReducer），管理 scene / seat / ambientLight / audio / timer；不做 localStorage 持久化，刷新回默认。

布局：顶栏（时间 + 进入/退出小憩场景开关）+ 座椅卡 + 中央氛围区 + 音乐白噪音卡 + 氛围灯卡 + 定时唤醒卡。

功能范围（澄清定案）：
- 座椅：靠背角度/腿托滑杆、加热开关、按摩档位。
- 氛围灯：开关、色板、亮度、模式（静态/呼吸/流动），联动背景光晕。
- 音乐/白噪音：分类切换、曲目选择、播放/暂停、进度（setInterval 模拟）、音量。
- 定时唤醒：时长预设、启用开关、倒计时（模拟递减）。
- 一键进入/退出小憩：组合动作联动多控件（放平座椅/呼吸暖光/白噪音播放/定时启用），napping 态仍可单独微调。

音频与素材：均为 UI 模拟，不加载真实音频/图片文件。

验证：`npm run build`（tsc + vite build）通过；Vitest + RTL 覆盖 reducer 与联动/定时器；人工目视验收 1920×1080 布局与交互。

产物落 openspec/changes/cabin-nap-mode-ui/（design.md / requirements.md / tasks.md / specs/cabin-nap-mode-ui/spec.md）。
