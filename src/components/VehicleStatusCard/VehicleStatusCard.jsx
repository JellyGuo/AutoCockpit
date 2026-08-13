import './VehicleStatusCard.css';
import { vehicleStatusMock } from '../../mock/vehicleStatus.js';

/**
 * 车辆状态卡片
 * 展示车速、电量、续航三项数值，数据来自本地 Mock，配色取自主题 CSS 变量。
 *
 * @param {object} [props]
 * @param {typeof vehicleStatusMock} [props.data] 可注入的车辆状态数据，默认使用本地 Mock
 */
function VehicleStatusCard({ data = vehicleStatusMock }) {
  const metrics = [data.speed, data.battery, data.range];

  return (
    <section className="vehicle-status-card" aria-label="车辆状态">
      <header className="vehicle-status-card__header">车辆状态</header>
      <div className="vehicle-status-card__metrics">
        {metrics.map((metric) => (
          <div className="vehicle-status-card__metric" key={metric.label}>
            <span className="vehicle-status-card__value">
              {metric.value}
              <span className="vehicle-status-card__unit">{metric.unit}</span>
            </span>
            <span className="vehicle-status-card__label">{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VehicleStatusCard;
