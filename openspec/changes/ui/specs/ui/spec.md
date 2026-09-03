# 座舱小憩模式可交互 UI 规格

## ADDED Requirements

### Requirement: 项目脚手架与视觉基座
系统 SHALL 提供一个可构建运行的 React + Vite + TypeScript 工程，并具备 1920×1080 毛玻璃视觉基座，以便在车机横屏上展示放松风格的小憩界面。

#### Scenario: 构建工程无错误
- **WHEN** 执行 `npm install && npm run build`
- **THEN** 系统 SHALL 无错误完成构建

#### Scenario: 等比渲染与窗口自适应
- **WHEN** 页面加载
- **THEN** 系统 SHALL 以 1920×1080 为基准渲染，并在窗口缩放时等比适配不破版

#### Scenario: 程序化背景与毛玻璃卡片
- **WHEN** 页面渲染
- **THEN** 系统 SHALL 显示程序化风景背景（CSS 渐变/多层，不依赖外部图片）与毛玻璃（backdrop-filter）卡片

### Requirement: 座椅调节控件
系统 SHALL 允许乘员调节座椅靠背、腿托、加热与按摩，以便进入舒适的休憩姿态。

#### Scenario: 调节靠背与腿托滑杆
- **WHEN** 用户拖动靠背角度或腿托滑杆
- **THEN** 系统 SHALL 实时更新对应数值并反映到状态与界面

#### Scenario: 切换加热与按摩
- **WHEN** 用户切换加热开关或按摩档位
- **THEN** 系统 SHALL 更新状态并给出可见的开/关或档位反馈

### Requirement: 氛围灯控件
系统 SHALL 允许乘员调节氛围灯的开关、颜色、亮度与模式，以便营造放松氛围。

#### Scenario: 切换氛围灯开关
- **WHEN** 用户切换氛围灯开关
- **THEN** 系统 SHALL 更新点亮状态并联动中央氛围区/背景光晕

#### Scenario: 调节颜色/亮度/模式
- **WHEN** 用户选择颜色或调节亮度或切换模式（静态/呼吸/流动）
- **THEN** 系统 SHALL 实时反映到界面视觉

### Requirement: 音乐/白噪音控件
系统 SHALL 允许乘员播放音乐或白噪音并控制进度与音量，以便助眠放松（音频为 UI 模拟）。

#### Scenario: 分类切换与选曲
- **WHEN** 用户在音乐与白噪音分类间切换并选择曲目
- **THEN** 系统 SHALL 更新当前音源显示

#### Scenario: 播放/暂停与进度模拟
- **WHEN** 用户点击播放/暂停
- **THEN** 系统 SHALL 切换播放状态，播放时进度条 SHALL 随时间模拟推进

#### Scenario: 调节音量
- **WHEN** 用户调节音量
- **THEN** 系统 SHALL 更新音量数值与界面反馈

### Requirement: 定时唤醒控件
系统 SHALL 允许乘员设置小憩时长并看到倒计时，以便被按时唤醒（倒计时为 UI 模拟）。

#### Scenario: 启用定时并倒计时
- **WHEN** 用户选择时长预设并启用定时
- **THEN** 系统 SHALL 显示对应倒计时并随时间递减

#### Scenario: 未启用不递减
- **WHEN** 定时未启用
- **THEN** 系统 SHALL 不显示倒计时递减

### Requirement: 一键进入/退出小憩场景联动
系统 SHALL 允许乘员一键进入或退出小憩场景，以便一次性完成多控件的联动切换。

#### Scenario: 进入小憩组合联动
- **WHEN** 用户点击「进入小憩」
- **THEN** 系统 SHALL 组合执行：座椅放平至放松预设、氛围灯切呼吸暖色低亮、白噪音开始播放、定时按默认时长启用，并将场景标记为 napping

#### Scenario: 退出小憩恢复默认
- **WHEN** 用户点击「退出小憩」
- **THEN** 系统 SHALL 将场景恢复为 active 并复位相关控件到默认值

#### Scenario: napping 态仍可微调
- **WHEN** 处于 napping 场景
- **THEN** 系统 SHALL 仍允许用户单独微调各控件
