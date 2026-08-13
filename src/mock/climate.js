// 空调与温度控制本地 Mock 数据（纯前端，无真实网络请求）
// 提供初始温度、可调范围/步进、风量与模式等，供空调卡作为前端状态初值。

export const climateMock = {
  // 当前设定温度（摄氏度），作为前端状态初值
  temperature: 22,
  // 温度可调范围与步进
  minTemperature: 16,
  maxTemperature: 30,
  step: 0.5,
  unit: '°C',
  // 风量档位：1..maxFanSpeed
  fanSpeed: 2,
  maxFanSpeed: 5,
  // 送风模式，供档位循环切换
  modes: ['自动', '吹脸', '吹脚', '除霜'],
  modeIndex: 0,
};

export default climateMock;
