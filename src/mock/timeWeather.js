// 时间/天气本地 Mock 数据（纯前端，无真实网络请求）
// 天气为静态 Mock；当前时间与日期由组件基于本地时钟实时派生。

export const weatherMock = {
  condition: '多云',
  icon: '⛅',
  temperature: 24,
  unit: '°C',
  city: '上海',
  humidity: 56,
};

// 星期中文映射，供组件格式化日期使用。
export const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default weatherMock;
