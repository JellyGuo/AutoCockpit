/**
 * systemTheme 纯逻辑自测（Node 内置 test runner，无需额外依赖）：
 *   node --test src/theme/systemTheme.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSystemTheme, subscribeSystemTheme } from './systemTheme.js';

/** 构造可控的假 window.matchMedia。 */
function makeFakeWindow(initialDark) {
  let matches = initialDark;
  const listeners = new Set();
  return {
    _emit(nextDark) {
      matches = nextDark;
      for (const cb of listeners) cb({ matches });
    },
    matchMedia(query) {
      assert.equal(query, '(prefers-color-scheme: dark)');
      return {
        get matches() {
          return matches;
        },
        addEventListener(_type, cb) {
          listeners.add(cb);
        },
        removeEventListener(_type, cb) {
          listeners.delete(cb);
        },
      };
    },
    _listenerCount: () => listeners.size,
  };
}

test('getSystemTheme 系统为浅色时返回 light', () => {
  assert.equal(getSystemTheme(makeFakeWindow(false)), 'light');
});

test('getSystemTheme 系统为深色时返回 dark', () => {
  assert.equal(getSystemTheme(makeFakeWindow(true)), 'dark');
});

test('getSystemTheme 无 matchMedia 时降级为 light', () => {
  assert.equal(getSystemTheme(undefined), 'light');
  assert.equal(getSystemTheme({}), 'light');
});

test('subscribeSystemTheme 系统深浅色切换时以新主题回调', () => {
  const win = makeFakeWindow(false);
  const seen = [];
  const unsubscribe = subscribeSystemTheme((t) => seen.push(t), win);

  win._emit(true); // 切到深色
  win._emit(false); // 切回浅色

  assert.deepEqual(seen, ['dark', 'light']);

  // 取消订阅后不再回调，且监听器被移除。
  unsubscribe();
  win._emit(true);
  assert.deepEqual(seen, ['dark', 'light']);
  assert.equal(win._listenerCount(), 0);
});

test('subscribeSystemTheme 无 matchMedia 时返回可安全调用的空清理函数', () => {
  const unsubscribe = subscribeSystemTheme(() => {}, undefined);
  assert.equal(typeof unsubscribe, 'function');
  assert.doesNotThrow(unsubscribe);
});

test('subscribeSystemTheme 兼容旧版 addListener API', () => {
  let cb = null;
  const legacyWin = {
    matchMedia() {
      return {
        matches: false,
        addListener(fn) {
          cb = fn;
        },
        removeListener() {
          cb = null;
        },
      };
    },
  };
  const seen = [];
  const unsubscribe = subscribeSystemTheme((t) => seen.push(t), legacyWin);
  cb({ matches: true });
  assert.deepEqual(seen, ['dark']);
  unsubscribe();
  assert.equal(cb, null);
});
