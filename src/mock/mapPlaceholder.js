// 地图占位本地 Mock 数据（纯前端，不请求任何真实地图服务）。
// 供 MapPanel 绘制简易矢量占位地图：路网、路线、兴趣点与当前定位。
// 坐标均为 0-100 的相对百分比，便于在任意尺寸的 viewBox 中等比渲染。

export const mapPlaceholderMock = {
  // 当前定位信息（占位文案，非真实定位）
  location: {
    label: '当前位置',
    name: '中央广场',
    coordinate: '31.2304° N, 121.4737° E',
  },
  // 导航概要（占位）
  navigation: {
    destination: '滨江公园',
    distanceKm: 6.8,
    etaMin: 14,
  },
  // 路网线条（简易矢量占位），每条为一组折线点
  roads: [
    { id: 'r1', points: [[0, 30], [40, 34], [70, 28], [100, 32]] },
    { id: 'r2', points: [[0, 68], [30, 64], [62, 70], [100, 66]] },
    { id: 'r3', points: [[22, 0], [26, 40], [20, 72], [24, 100]] },
    { id: 'r4', points: [[74, 0], [70, 36], [78, 70], [72, 100]] },
  ],
  // 规划路线（高亮折线）
  route: [
    [24, 82],
    [24, 66],
    [40, 34],
    [70, 28],
    [74, 12],
  ],
  // 兴趣点标记
  markers: [
    { id: 'm1', x: 24, y: 66, kind: 'origin', label: '起点' },
    { id: 'm2', x: 70, y: 28, kind: 'waypoint', label: '途经' },
    { id: 'm3', x: 74, y: 12, kind: 'destination', label: '终点' },
  ],
  // 当前车辆定位点
  vehicle: { x: 24, y: 82 },
};

export default mapPlaceholderMock;
