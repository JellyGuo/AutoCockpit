import { Children, useRef, useState } from 'react';
import './CardCarousel.css';
import { clampIndex, nextIndex, prevIndex, resolveSwipe } from './paging.js';

/**
 * 左侧竖向信息卡片翻页容器（任务 #3）。
 * ------------------------------------------------------------------
 * - 承载多张信息卡片：卡片以子节点（children）方式接入，每个直接子节点即一页。
 * - 支持翻页/切换：上一/下一按钮、分页圆点点击跳转（点击手势），
 *   以及在卡片区滑动（指针事件，覆盖触控与鼠标）翻页（滑动手势）。
 * - 分页指示器：底部圆点标示当前卡片位置，可点击直达。
 * - 纵向填满左栏：根节点 height:100% 且为纵向 flex，卡片视口占据剩余空间。
 * - 切换过渡动画为可选增强项：由 animate 开关控制，并遵循 reduced-motion。
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children 卡片集合，每个子节点为一页
 * @param {string} [props.className] 追加的容器类名
 * @param {number} [props.swipeThreshold=40] 滑动翻页触发阈值（像素）
 * @param {boolean} [props.animate=true] 是否启用切换过渡动画（可选增强项）
 * @param {string} [props.ariaLabel='信息卡片'] 容器无障碍标签
 */
function CardCarousel({
  children,
  className = '',
  swipeThreshold = 40,
  animate = true,
  ariaLabel = '信息卡片',
}) {
  const pages = Children.toArray(children).filter(Boolean);
  const count = pages.length;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState('next');
  const pointerStart = useRef(null);

  const activeIndex = clampIndex(index, count);

  const goTo = (target) => {
    const clamped = clampIndex(target, count);
    setDirection(clamped >= activeIndex ? 'next' : 'prev');
    setIndex(clamped);
  };
  const goNext = () => goTo(nextIndex(activeIndex, count));
  const goPrev = () => goTo(prevIndex(activeIndex, count));

  // ---- 滑动手势：指针事件同时覆盖触控与鼠标 ----
  const handlePointerDown = (event) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const handlePointerUp = (event) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const action = resolveSwipe({
      dx: event.clientX - start.x,
      dy: event.clientY - start.y,
      threshold: swipeThreshold,
    });
    if (action === 'next') goNext();
    else if (action === 'prev') goPrev();
  };
  const handlePointerCancel = () => {
    pointerStart.current = null;
  };

  const rootClassName = ['card-carousel', className].filter(Boolean).join(' ');

  if (count === 0) {
    return <section className={`${rootClassName} card-carousel--empty`} aria-label={ariaLabel} />;
  }

  return (
    <section
      className={rootClassName}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <div
        className="card-carousel__viewport"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {pages.map((page, i) => {
          const isActive = i === activeIndex;
          const slideClass = [
            'card-carousel__slide',
            animate && 'card-carousel__slide--animated',
            animate && `card-carousel__slide--${direction}`,
            isActive && 'is-active',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={i}
              className={slideClass}
              role="group"
              aria-roledescription="slide"
              aria-label={`第 ${i + 1} 张，共 ${count} 张`}
              aria-hidden={!isActive}
            >
              {page}
            </div>
          );
        })}
      </div>

      <nav className="card-carousel__controls" aria-label="卡片翻页">
        <button
          type="button"
          className="card-carousel__nav card-carousel__nav--prev"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="上一张卡片"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div className="card-carousel__dots" role="tablist" aria-label="分页指示器">
          {pages.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`card-carousel__dot${i === activeIndex ? ' is-active' : ''}`}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`跳到第 ${i + 1} 张卡片`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="card-carousel__nav card-carousel__nav--next"
          onClick={goNext}
          disabled={activeIndex === count - 1}
          aria-label="下一张卡片"
        >
          <span aria-hidden="true">›</span>
        </button>
      </nav>
    </section>
  );
}

export default CardCarousel;
