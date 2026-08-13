import { useState } from 'react';
import './ClimateCard.css';
import { climateMock } from '../../mock/climate.js';

/**
 * 空调与温度控制卡片
 * 展示当前设定温度并提供温度增减、风量增减与送风模式切换等基本控件。
 * 所有控件状态由组件以 useState 前端自持（纯前端 Mock，无真实网络请求），
 * 配色取自主题 CSS 变量（var() 均带日夜可读兜底值）。
 *
 * @param {object} [props]
 * @param {typeof climateMock} [props.data] 可注入的空调初始数据，默认使用本地 Mock
 */
function ClimateCard({ data = climateMock }) {
  const [temperature, setTemperature] = useState(data.temperature);
  const [fanSpeed, setFanSpeed] = useState(data.fanSpeed);
  const [modeIndex, setModeIndex] = useState(data.modeIndex);

  const atMinTemp = temperature <= data.minTemperature;
  const atMaxTemp = temperature >= data.maxTemperature;
  const atMinFan = fanSpeed <= 1;
  const atMaxFan = fanSpeed >= data.maxFanSpeed;

  // 温度调节：受 min/max 与 step 约束，保留一位小数避免浮点误差
  const decTemp = () =>
    setTemperature((t) =>
      Math.max(data.minTemperature, Math.round((t - data.step) * 10) / 10)
    );
  const incTemp = () =>
    setTemperature((t) =>
      Math.min(data.maxTemperature, Math.round((t + data.step) * 10) / 10)
    );

  // 风量调节：1..maxFanSpeed
  const decFan = () => setFanSpeed((f) => Math.max(1, f - 1));
  const incFan = () => setFanSpeed((f) => Math.min(data.maxFanSpeed, f + 1));

  // 送风模式循环切换
  const cycleMode = () => setModeIndex((i) => (i + 1) % data.modes.length);

  return (
    <section className="climate-card" aria-label="空调与温度控制">
      <header className="climate-card__header">空调控制</header>

      <div className="climate-card__temp" aria-label="当前设定温度">
        <button
          type="button"
          className="climate-card__step-btn"
          onClick={decTemp}
          disabled={atMinTemp}
          aria-label="降低温度"
        >
          −
        </button>
        <div className="climate-card__temp-value">
          {temperature.toFixed(1)}
          <span className="climate-card__temp-unit">{data.unit}</span>
        </div>
        <button
          type="button"
          className="climate-card__step-btn"
          onClick={incTemp}
          disabled={atMaxTemp}
          aria-label="升高温度"
        >
          +
        </button>
      </div>

      <div className="climate-card__controls">
        <div className="climate-card__control">
          <span className="climate-card__control-label">风量</span>
          <div className="climate-card__control-actions">
            <button
              type="button"
              className="climate-card__mini-btn"
              onClick={decFan}
              disabled={atMinFan}
              aria-label="减小风量"
            >
              −
            </button>
            <div className="climate-card__fan-bars" aria-label={`风量 ${fanSpeed} 档`}>
              {Array.from({ length: data.maxFanSpeed }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'climate-card__fan-bar' +
                    (i < fanSpeed ? ' climate-card__fan-bar--on' : '')
                  }
                />
              ))}
            </div>
            <button
              type="button"
              className="climate-card__mini-btn"
              onClick={incFan}
              disabled={atMaxFan}
              aria-label="增大风量"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className="climate-card__mode-btn"
          onClick={cycleMode}
          aria-label="切换送风模式"
        >
          <span className="climate-card__control-label">模式</span>
          <span className="climate-card__mode-value">{data.modes[modeIndex]}</span>
        </button>
      </div>
    </section>
  );
}

export default ClimateCard;
