/**
 * 翻页容器的纯逻辑（不依赖 React / DOM，便于单测）。
 * ------------------------------------------------------------------
 * 负责索引计算与滑动手势的方向判定，UI 组件（CardCarousel.jsx）只做渲染
 * 与事件接线，核心行为集中在此以保证可测试性。
 */

/**
 * 将索引夹取到有效范围 [0, count - 1]。count <= 0 时统一返回 0。
 * @param {number} index 目标索引
 * @param {number} count 卡片总数
 * @returns {number} 合法索引
 */
export function clampIndex(index, count) {
  if (!Number.isFinite(index) || count <= 0) return 0;
  if (index < 0) return 0;
  if (index > count - 1) return count - 1;
  return Math.trunc(index);
}

/**
 * 下一张索引（不循环，末页保持末页）。
 * @param {number} index 当前索引
 * @param {number} count 卡片总数
 * @returns {number}
 */
export function nextIndex(index, count) {
  return clampIndex(clampIndex(index, count) + 1, count);
}

/**
 * 上一张索引（不循环，首页保持首页）。
 * @param {number} index 当前索引
 * @param {number} count 卡片总数
 * @returns {number}
 */
export function prevIndex(index, count) {
  return clampIndex(clampIndex(index, count) - 1, count);
}

/**
 * 根据一次滑动的位移判定翻页动作。
 * 取水平/垂直位移中的主导轴：
 *   - 向左 / 向上 => 'next'
 *   - 向右 / 向下 => 'prev'
 * 位移未超过阈值（视为点击/轻触）时返回 null，不触发翻页，
 * 从而不干扰卡片内部按钮的点击。
 *
 * @param {object} p
 * @param {number} p.dx 水平位移（终点 - 起点）
 * @param {number} p.dy 垂直位移（终点 - 起点）
 * @param {number} [p.threshold=40] 触发阈值（像素）
 * @returns {'next'|'prev'|null}
 */
export function resolveSwipe({ dx, dy, threshold = 40 }) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (Math.max(absX, absY) < threshold) return null;
  // 主导轴：水平优先（>=），两轴相等时按水平处理
  if (absX >= absY) {
    return dx < 0 ? 'next' : 'prev';
  }
  return dy < 0 ? 'next' : 'prev';
}
