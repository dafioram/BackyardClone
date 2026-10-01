// Smoke tests for Backyard Clone.
// Loads index.html with ?pvzdebug (exposes window.__pvz test API; inert in normal play).
const { test, expect } = require('@playwright/test');
const path = require('path');

const GAME_URL = 'file://' + path.resolve(__dirname, '../index.html') + '?pvzdebug';

// Tap a point in game coordinates (the canvas is 900x640 internally).
async function gameTap(page, gx, gy) {
  const box = await page.evaluate(() => {
    const r = document.querySelector('canvas').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await page.mouse.click(box.x + (gx / 900) * box.w, box.y + (gy / 640) * box.h);
}

const snap = (page) => page.evaluate(() => window.__pvz.snap());

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  await page.goto(GAME_URL);
  await page.waitForFunction(() => typeof window.__pvz !== 'undefined');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => typeof window.__pvz !== 'undefined');
  page._errors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page._errors).toEqual([]);
});

test('title screen shows level 1 unlocked, level 2 locked, endless unlocked', async ({ page }) => {
  const l1 = await page.$eval('#pvzLvlBtn1', (el) => el.classList.contains('locked'));
  const l2 = await page.$eval('#pvzLvlBtn2', (el) => el.classList.contains('locked'));
  const e = await page.$eval('#pvzLvlBtnE', (el) => el.classList.contains('locked'));
  expect(l1).toBe(false);
  expect(l2).toBe(true);
  expect(e).toBe(false);
});

test('level 1 starts, plants via real taps, and shooter kills a zombie', async ({ page }) => {
  await page.evaluate(() => window.__pvz.start(1));
  await page.waitForFunction(() => window.__pvz.snap().screen === 'playing');
  await page.evaluate(() => window.__pvz.give(1000));

  // Peashooter packet is ORDER[1]: px = 120 + 1*70 = 190.
  // One REAL tap-planted peashooter (proves the UI path), then debug-plant the
  // other rows for combat coverage (packet recharge is 7.5s).
  // Lawn origin: LX=90, LY=80, CELL=80.
  await page.evaluate(() => window.__pvz.give(1000));
  await gameTap(page, 190 + 32, 32);
  await gameTap(page, 90 + 1 * 80 + 40, 80 + 2 * 80 + 40);

  let s = await snap(page);
  expect(s.plist.some((p) => p.type === 'peashooter' && p.col === 1 && p.row === 2)).toBe(true);

  await page.evaluate(() => {
    for (let r = 0; r < 5; r++) {
      if (r !== 2) window.__pvz.plant('peashooter', 1, r);
    }
  });

  // Fast-forward: the peashooters should kill at least one zombie.
  await page.evaluate(() => window.__pvz.step(150));
  s = await snap(page);
  expect(s.killed).toBeGreaterThan(0);
});

test('winning level 1 unlocks level 2 and persists across reload', async ({ page }) => {
  await page.evaluate(() => window.__pvz.start(1));
  await page.waitForFunction(() => window.__pvz.snap().screen === 'playing');
  await page.evaluate(() => window.__pvz.winNow());
  await page.waitForSelector('#pvzWin:not(.hidden)');

  await page.click('#pvzNext');
  await page.waitForFunction(
    () => window.__pvz.snap().screen === 'playing' && window.__pvz.snap().level === 2
  );

  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('pvz_save_v1')));
  expect(save.maxLevel).toBe(2);

  await page.reload();
  await page.waitForFunction(() => typeof window.__pvz !== 'undefined');
  const l2 = await page.$eval('#pvzLvlBtn2', (el) => el.classList.contains('locked'));
  expect(l2).toBe(false);
});

test('endless mode is available from the start', async ({ page }) => {
  // Fresh save: endless button should not be locked.
  const eLocked = await page.$eval('#pvzLvlBtnE', (el) => el.classList.contains('locked'));
  expect(eLocked).toBe(false);

  // Clicking it selects endless (button gets 'sel' class).
  await page.click('#pvzLvlBtnE');
  const eSel = await page.$eval('#pvzLvlBtnE', (el) => el.classList.contains('sel'));
  expect(eSel).toBe(true);

  // Starting launches endless level 19.
  await page.click('#pvzStart');
  await page.waitForFunction(() => window.__pvz.snap().screen === 'playing');
  const s = await snap(page);
  expect(s.level).toBe(19);
});
