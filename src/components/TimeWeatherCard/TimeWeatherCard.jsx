import { useEffect, useState } from 'react';
import './TimeWeatherCard.css';
import { weatherMock, weekdayLabels } from '../../mock/timeWeather.js';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatDate(date) {
  const weekday = weekdayLabels[date.getDay()];
  return `${date.getFullYear()}年${pad2(date.getMonth() + 1)}月${pad2(date.getDate())}日 ${weekday}`;
}

/**
 * 时间/天气卡片
 * 展示当前时间、日期与天气信息。时间基于本地时钟实时刷新，
 * 天气来自本地 Mock，配色取自主题 CSS 变量。
 *
 * @param {object} [props]
 * @param {typeof weatherMock} [props.weather] 可注入的天气数据，默认使用本地 Mock
 */
function TimeWeatherCard({ weather = weatherMock }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="time-weather-card" aria-label="时间与天气">
      <div className="time-weather-card__time">{formatTime(now)}</div>
      <div className="time-weather-card__date">{formatDate(now)}</div>
      <div className="time-weather-card__weather">
        <span className="time-weather-card__weather-icon" aria-hidden="true">
          {weather.icon}
        </span>
        <span className="time-weather-card__weather-temp">
          {weather.temperature}
          {weather.unit}
        </span>
        <span className="time-weather-card__weather-desc">
          {weather.city} · {weather.condition}
        </span>
      </div>
    </section>
  );
}

export default TimeWeatherCard;
