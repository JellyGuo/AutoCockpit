import './App.css'
import { CardCarousel } from './components/CardCarousel'
import VehicleStatusCard from './components/VehicleStatusCard/VehicleStatusCard.jsx'
import ClimateCard from './components/ClimateCard/ClimateCard.jsx'
import MediaCard from './components/MediaCard/MediaCard.jsx'
import TimeWeatherCard from './components/TimeWeatherCard/TimeWeatherCard.jsx'
import MapPanel from './components/MapPanel/MapPanel.jsx'

/**
 * AutoCockpit 页面集成装配（任务 #7）
 *
 * 根容器锁定 16:9 宽高比，内部为左窄右宽横向双栏：
 *  - 左栏：CardCarousel 翻页容器，装入四张信息卡片
 *    （车辆状态 / 空调 / 媒体 / 时间天气），点击或滑动切换。
 *  - 右栏：MapPanel 静态占位地图，铺满右栏。
 *
 * 全局主题 Provider 在 main.jsx 注入，日/夜切换整页生效；
 * 本组件仅通过主题 CSS 变量取色，不写死具体色值。
 */
export default function App() {
  return (
    <div className="cockpit-viewport">
      <div className="cockpit-stage">
        {/* 左窄栏：竖向卡片翻页区 */}
        <aside className="cockpit-sidebar" data-slot="cards">
          <CardCarousel ariaLabel="座舱信息卡片">
            <VehicleStatusCard />
            <ClimateCard />
            <MediaCard />
            <TimeWeatherCard />
          </CardCarousel>
        </aside>

        {/* 右宽栏：地图占位区 */}
        <main className="cockpit-map" data-slot="map">
          <MapPanel />
        </main>
      </div>
    </div>
  )
}
