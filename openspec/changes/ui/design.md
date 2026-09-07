见 openspec/changes/wo-219fe074f7e1/design.md。

技术选型（澄清定案）：React 18 + Vite + TS，Context + useReducer 统一状态管理，CSS backdrop-filter 毛玻璃 + 纯 CSS 渐变风景背景（无外部图片，图标内联 SVG），纯前端本地状态 + mock 数据、无后端，1920x1080 基准 + 等比缩放自适应，触控为主兼容鼠标。

布局：顶部状态栏（时间/标题/剩余唤醒徽标）+ 毛玻璃卡片网格（座椅/氛围灯/音乐·白噪音/定时唤醒）+ 纯 CSS 渐变风景背景层（随氛围灯颜色轻度联动）。

状态模型 NapModeStore：seat{recline,massage,heat} / ambient{color,brightness,mode} / audio{playing,trackId,category,volume} / timer{active,targetMs,remainingMs}，dispatch 驱动，联动订阅刷新，倒计时单一 interval。

验证：npm run build 通过、npm run dev 于 1920x1080 正常渲染交互；Vitest + RTL 覆盖 reducer 联动与关键控件交互；手动核对四组控件联动、触控可用、布局无溢出。非目标：不接真实车机/后端、不做持久化/账号/多语言。
