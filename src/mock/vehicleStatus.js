// 车辆状态本地 Mock 数据（纯前端，无真实网络请求）
// 提供车速、电量、续航三项数值供车辆状态卡展示。

export const vehicleStatusMock = {
  speed: {
    value: 68,
    unit: 'km/h',
    label: '车速',
  },
  battery: {
    value: 82,
    unit: '%',
    label: '电量',
  },
  range: {
    value: 412,
    unit: 'km',
    label: '续航',
  },
};

export default vehicleStatusMock;
