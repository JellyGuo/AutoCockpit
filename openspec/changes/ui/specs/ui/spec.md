# UI 规格：汽车中控屏 UI 开发

## ADDED Requirements

### Requirement: 16:9 横屏双栏布局
系统 SHALL 以 16:9 横屏、左窄右宽双栏呈现中控屏页面，并采用 React 纯前端技术栈实现（无后端与真实网络请求），以便在有限屏幕上同时看到信息卡片与地图。

#### Scenario: 16:9 视口下加载保持宽高比
- WHEN 页面在 16:9 视口下加载
- THEN 系统 SHALL 使根容器保持 16:9 宽高比且不变形

#### Scenario: 左窄右宽双栏布局
- WHEN 页面渲染
- THEN 系统 SHALL 呈现左窄（竖向卡片区）右宽（地图区）两栏布局

#### Scenario: React 纯前端实现
- WHEN 工程实现该页面
- THEN 系统 SHALL 使用 React 技术栈实现，且为纯前端、无后端与真实网络请求

### Requirement: 左侧竖向信息卡片翻页
系统 SHALL 使左侧竖向卡片区可翻页切换并显示分页指示，支持点击与滑动两种触控手势，以便用户在多张卡片间浏览。

#### Scenario: 点击翻页控件切换卡片
- WHEN 用户点击翻页控件
- THEN 系统 SHALL 切换到相邻卡片

#### Scenario: 滑动手势切换卡片
- WHEN 用户在卡片区执行滑动手势
- THEN 系统 SHALL 切换到相邻卡片

#### Scenario: 显示分页指示器
- WHEN 卡片区渲染
- THEN 系统 SHALL 显示分页指示器标示当前卡片位置

#### Scenario: 卡片切换过渡动画（增强项，非必需）
- WHEN 卡片发生切换
- THEN 系统 MAY 为卡片切换提供过渡动画（增强项，非必需）

### Requirement: 四类信息卡片内容
系统 SHALL 提供车辆状态、空调控制、音乐媒体、时间天气四类信息卡片，数据来自本地 Mock，以便用户掌握并操作座舱信息。

#### Scenario: 车辆状态卡显示数值
- WHEN 车辆状态卡渲染
- THEN 车辆状态卡 SHALL 显示车速、电量、续航三项数值

#### Scenario: 时间/天气卡显示信息
- WHEN 时间/天气卡渲染
- THEN 时间/天气卡 SHALL 显示当前时间、日期与天气

#### Scenario: 操作空调卡控件反映前端状态
- WHEN 用户操作空调卡控件
- THEN 系统 SHALL 即时反映温度等前端状态变化

#### Scenario: 操作媒体卡控件给出前端反馈
- WHEN 用户操作媒体卡控件
- THEN 系统 SHALL 提供播放/暂停与上一/下一曲并给出前端反馈

#### Scenario: 卡片数据来自本地 Mock
- WHEN 卡片加载数据
- THEN 所有卡片数据 SHALL 来自本地 Mock，不发起真实后端请求

### Requirement: 右侧宽屏地图占位
系统 SHALL 在右侧显示铺满右栏的宽屏地图占位，展示静态占位/Mock 内容并预留后续接入真实地图 SDK 的容器与接口位，以便预览地图区域。

#### Scenario: 地图占位铺满右栏
- WHEN 页面渲染
- THEN 系统 SHALL 使地图占位面板铺满右栏

#### Scenario: 展示静态占位/Mock 地图
- WHEN 地图面板渲染
- THEN 系统 SHALL 展示静态占位图/Mock 地图内容，且不请求真实地图服务

#### Scenario: 预留真实地图接入位
- WHEN 地图面板构建
- THEN 系统 SHALL 预留后续接入真实地图 SDK 的容器与接口位

### Requirement: 日夜双主题与可读性
系统 SHALL 提供基于 CSS 变量的 light 与 dark 两套主题，跟随系统 prefers-color-scheme 切换，并保证日/夜两套主题下内容清晰可读，以便在不同光照环境下正常使用。

#### Scenario: 定义 light 与 dark 两套主题 token
- WHEN 工程实现主题系统
- THEN 系统 SHALL 定义 light 与 dark 两套基于 CSS 变量的主题 token

#### Scenario: 应用启动按系统偏好选定主题
- WHEN 应用启动
- THEN 系统 SHALL 依据系统 prefers-color-scheme 选定主题

#### Scenario: 系统深浅色变化实时跟随
- WHEN 系统深浅色变化
- THEN 系统 SHALL 实时跟随切换页面主题

#### Scenario: 日夜主题下内容清晰可读
- WHEN 页面在日/夜两套主题下渲染
- THEN 系统 SHALL 使日/夜两套主题下所有卡片与地图占位内容清晰可读，关键文本对比度达到 WCAG AA（≥4.5:1），并以日夜双主题截图对比作为客观验证证据

### Requirement: 全新工程脚手架
系统 SHALL 从零搭建可运行的 Vite + React 前端工程，包含入口、布局壳与常规静态资源，且保持 README 不动，以便在空仓库上快速启动开发。

#### Scenario: install 后 dev 无报错启动
- WHEN 执行 npm install 后 npm run dev
- THEN 系统 SHALL 无报错启动开发服务器

#### Scenario: 使用 Vite + React 并含入口与静态资源
- WHEN 工程脚手架搭建完成
- THEN 工程 SHALL 使用 Vite + React 并包含入口、布局壳与 favicon 等常规静态资源

#### Scenario: 保持 README 不动
- WHEN 搭建新工程
- THEN README SHALL 保持不动，不改造既有模块
