/**
 * 翻页纯逻辑自测（Node 内置 test runner，无需额外依赖）：
 *   node --test src/components/CardCarousel/paging.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { clampIndex, nextIndex, prevIndex, resolveSwipe } from './paging.js';

test('clampIndex 夹取到 [0, count-1]', () => {
  assert.equal(clampIndex(-3, 4), 0);
  assert.equal(clampIndex(0, 4), 0);
  assert.equal(clampIndex(2, 4), 2);
  assert.equal(clampIndex(9, 4), 3);
  assert.equal(clampIndex(1.7, 4), 1); // 截断为整数
});

test('clampIndex 边界：count<=0 或非有限值返回 0', () => {
  assert.equal(clampIndex(2, 0), 0);
  assert.equal(clampIndex(2, -1), 0);
  assert.equal(clampIndex(NaN, 4), 0);
});

test('nextIndex 递增且末页不循环', () => {
  assert.equal(nextIndex(0, 4), 1);
  assert.equal(nextIndex(2, 4), 3);
  assert.equal(nextIndex(3, 4), 3); // 末页保持
});

test('prevIndex 递减且首页不循环', () => {
  assert.equal(prevIndex(3, 4), 2);
  assert.equal(prevIndex(1, 4), 0);
  assert.equal(prevIndex(0, 4), 0); // 首页保持
});

test('resolveSwipe 小于阈值视为点击返回 null', () => {
  assert.equal(resolveSwipe({ dx: 10, dy: 5 }), null);
  assert.equal(resolveSwipe({ dx: 0, dy: 0 }), null);
  assert.equal(resolveSwipe({ dx: 30, dy: 30, threshold: 40 }), null);
});

test('resolveSwipe 水平主导：左->next 右->prev', () => {
  assert.equal(resolveSwipe({ dx: -80, dy: 10 }), 'next');
  assert.equal(resolveSwipe({ dx: 80, dy: -10 }), 'prev');
});

test('resolveSwipe 垂直主导：上->next 下->prev', () => {
  assert.equal(resolveSwipe({ dx: 10, dy: -80 }), 'next');
  assert.equal(resolveSwipe({ dx: -10, dy: 80 }), 'prev');
});

test('resolveSwipe 自定义阈值生效', () => {
  assert.equal(resolveSwipe({ dx: 20, dy: 0, threshold: 15 }), 'prev');
  assert.equal(resolveSwipe({ dx: 20, dy: 0, threshold: 25 }), null);
});

test('翻页动作与索引计算联动：一次滑动推进一页', () => {
  const count = 4;
  let idx = 0;
  const apply = (dx, dy) => {
    const a = resolveSwipe({ dx, dy });
    if (a === 'next') idx = nextIndex(idx, count);
    else if (a === 'prev') idx = prevIndex(idx, count);
  };
  apply(-80, 0); // -> 1
  apply(-80, 0); // -> 2
  assert.equal(idx, 2);
  apply(80, 0); // -> 1
  assert.equal(idx, 1);
});
