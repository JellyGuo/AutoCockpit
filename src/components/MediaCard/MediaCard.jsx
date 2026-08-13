import { useState } from 'react';
import './MediaCard.css';
import { mediaPlaylistMock } from '../../mock/media.js';

/**
 * 音乐/媒体播放卡片
 * 展示当前曲目信息（封面/标题/歌手/专辑）并提供播放/暂停、上一曲、下一曲控件。
 * 播放状态与当前曲目由组件以 useState 前端自持（纯前端 Mock，无真实音频/网络），
 * 交互均有前端反馈（图标切换、播放态高亮），配色取自主题 CSS 变量。
 *
 * @param {object} [props]
 * @param {typeof mediaPlaylistMock} [props.playlist] 可注入的曲目列表，默认使用本地 Mock
 */
function MediaCard({ playlist = mediaPlaylistMock }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const track = playlist[index];
  const total = playlist.length;

  const togglePlay = () => setIsPlaying((p) => !p);
  // 上一/下一曲循环切换；切歌后保持当前播放态
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <section
      className={'media-card' + (isPlaying ? ' media-card--playing' : '')}
      aria-label="音乐媒体播放"
    >
      <header className="media-card__header">
        <span>正在播放</span>
        <span className="media-card__index">
          {index + 1} / {total}
        </span>
      </header>

      <div className="media-card__now">
        <span
          className={
            'media-card__cover' + (isPlaying ? ' media-card__cover--spin' : '')
          }
          aria-hidden="true"
        >
          {track.cover}
        </span>
        <div className="media-card__meta">
          <div className="media-card__title" title={track.title}>
            {track.title}
          </div>
          <div className="media-card__artist">
            {track.artist} · {track.album}
          </div>
          <div className="media-card__duration">{track.duration}</div>
        </div>
      </div>

      <div className="media-card__controls">
        <button
          type="button"
          className="media-card__ctrl-btn"
          onClick={prev}
          aria-label="上一曲"
        >
          ⏮
        </button>
        <button
          type="button"
          className="media-card__ctrl-btn media-card__ctrl-btn--play"
          onClick={togglePlay}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          className="media-card__ctrl-btn"
          onClick={next}
          aria-label="下一曲"
        >
          ⏭
        </button>
      </div>
    </section>
  );
}

export default MediaCard;
