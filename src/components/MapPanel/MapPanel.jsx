import { useEffect, useRef } from 'react';
import './MapPanel.css';
import { mapPlaceholderMock } from '../../mock/mapPlaceholder.js';

/**
 * 右侧宽屏地图占位面板（任务 #6，静态 Mock）
 *
 * 职责：
 *  - 铺满右栏，展示静态占位/Mock 地图（简易矢量占位：路网、路线、兴趣点、定位）。
 *  - 预留后续接入真实地图 SDK 的容器与接口位，当前不接入任何真实地图服务。
 *  - 取色自日夜双主题 CSS 变量（带兜底值），保证日/夜主题下样式协调。
 *
 * 真实地图接入位（后续任务替换 Mock 时使用，本任务仅预留，不实现真实逻辑）：
 *  - `mapContainerRef`：真实地图 SDK 的挂载容器（DOM 节点）。真实 SDK
 *    （如高德/百度/Mapbox）初始化时应挂载到此节点，例如：
 *      `new AMap.Map(mapContainerRef.current, options)`。
 *  - `mapProvider`：地图适配器接口占位（可选注入）。约定形状：
 *      `{ mount(container, options): instance, destroy(instance): void }`。
 *    未注入时保持静态占位，占位内容不消失，保证渐进替换无缝。
 *
 * @param {object} [props]
 * @param {typeof mapPlaceholderMock} [props.data] 可注入的地图 Mock 数据。
 * @param {{ mount: Function, destroy?: Function }} [props.mapProvider]
 *   真实地图适配器（接口占位，本任务不接入真实服务，默认 undefined）。
 * @param {object} [props.mapOptions] 传递给真实地图适配器的初始化选项（预留）。
 */
function MapPanel({ data = mapPlaceholderMock, mapProvider, mapOptions }) {
  // 真实地图 SDK 的挂载容器引用（本任务仅预留，不做真实初始化）。
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // 接口位：仅当外部注入了真实地图适配器时才尝试挂载真实地图。
    // 本任务默认不注入 mapProvider，因此始终走静态占位分支，不发起任何网络请求。
    if (!mapProvider || typeof mapProvider.mount !== 'function') {
      return undefined;
    }
    const container = mapContainerRef.current;
    if (!container) return undefined;

    const instance = mapProvider.mount(container, mapOptions);
    return () => {
      if (mapProvider.destroy) mapProvider.destroy(instance);
    };
  }, [mapProvider, mapOptions]);

  const { location, navigation, roads, route, markers, vehicle } = data;
  const routePath = route.map((p) => p.join(',')).join(' ');
  const usingRealMap = Boolean(mapProvider);

  return (
    <section className="map-panel" aria-label="地图">
      {/*
        真实地图挂载容器（接口位）：铺满面板。真实 SDK 就位后渲染于此，
        当前保持为空容器，静态占位覆盖其上。
      */}
      <div
        ref={mapContainerRef}
        className="map-panel__sdk-container"
        data-map-slot="real-map"
        aria-hidden={!usingRealMap}
      />

      {/* 静态占位 Mock 地图：真实地图未接入时展示，接入后可隐藏 */}
      {!usingRealMap && (
        <div className="map-panel__placeholder" data-map-slot="placeholder">
          <svg
            className="map-panel__canvas"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label="静态占位地图"
          >
            {/* 底图色块 */}
            <rect x="0" y="0" width="100" height="100" className="map-panel__bg" />

            {/* 路网折线（简易矢量占位） */}
            {roads.map((road) => (
              <polyline
                key={road.id}
                className="map-panel__road"
                points={road.points.map((p) => p.join(',')).join(' ')}
              />
            ))}

            {/* 规划路线（高亮） */}
            <polyline className="map-panel__route" points={routePath} />

            {/* 兴趣点标记 */}
            {markers.map((m) => (
              <g key={m.id}>
                <circle
                  className={`map-panel__marker map-panel__marker--${m.kind}`}
                  cx={m.x}
                  cy={m.y}
                  r="1.8"
                />
              </g>
            ))}

            {/* 当前车辆定位点（带脉冲光环） */}
            <circle className="map-panel__vehicle-halo" cx={vehicle.x} cy={vehicle.y} r="3.2" />
            <circle className="map-panel__vehicle" cx={vehicle.x} cy={vehicle.y} r="1.6" />
          </svg>

          {/* 定位信息浮层（左上） */}
          <div className="map-panel__overlay map-panel__overlay--location">
            <span className="map-panel__overlay-label">{location.label}</span>
            <span className="map-panel__overlay-title">{location.name}</span>
            <span className="map-panel__overlay-sub">{location.coordinate}</span>
          </div>

          {/* 导航概要浮层（右下） */}
          <div className="map-panel__overlay map-panel__overlay--nav">
            <span className="map-panel__overlay-label">前往</span>
            <span className="map-panel__overlay-title">{navigation.destination}</span>
            <span className="map-panel__overlay-sub">
              {navigation.distanceKm} km · 约 {navigation.etaMin} 分钟
            </span>
          </div>

          {/* 占位徽标：明示当前为静态 Mock，非真实地图 */}
          <div className="map-panel__badge">静态占位地图 · Mock</div>
        </div>
      )}
    </section>
  );
}

export default MapPanel;
