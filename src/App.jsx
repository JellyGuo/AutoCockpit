import './App.css'

/**
 * AutoCockpit 布局壳（任务 #1 脚手架）
 *
 * 根容器锁定 16:9 宽高比，内部为左窄右宽横向双栏：
 *  - 左栏：竖向信息卡片区插槽（后续任务接入翻页容器与卡片）
 *  - 右栏：宽屏地图区插槽（后续任务接入地图占位面板）
 *
 * 当前阶段两栏均以占位块填充，供后续任务替换。
 */
export default function App() {
  return (
    <div className="cockpit-viewport">
      <div className="cockpit-stage">
        {/* 左窄栏：竖向卡片区插槽 */}
        <aside className="cockpit-sidebar" data-slot="cards">
          <div className="placeholder placeholder--cards">
            <span className="placeholder__label">左侧卡片区</span>
            <span className="placeholder__hint">竖向信息卡片区插槽（占位）</span>
          </div>
        </aside>

        {/* 右宽栏：地图区插槽 */}
        <main className="cockpit-map" data-slot="map">
          <div className="placeholder placeholder--map">
            <span className="placeholder__label">右侧地图区</span>
            <span className="placeholder__hint">宽屏地图区插槽（占位）</span>
          </div>
        </main>
      </div>
    </div>
  )
}
