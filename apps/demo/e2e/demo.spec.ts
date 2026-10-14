import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  await page.waitForSelector('body[data-ready="true"]');
}

async function noOverflow(page: Page) {
  const bad = await page.$$eval('.pv-line', (lines) =>
    lines.filter((l) => l.scrollWidth > l.clientWidth + 1).map((l) => l.textContent));
  expect(bad).toEqual([]);
}

test('typesets the sample text on load', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await expect(page.locator('.pv-line').first()).toContainText('It is a truth universally acknowledged');
  await expect(page.locator('#status')).toContainText('text → string');
  await noOverflow(page);
  await page.screenshot({ path: 'test-results/desktop.png' });
});

test('reports parse errors and shows a notice for objects', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => (window as any).pocketview.setInput('{"a": '));
  await page.click('#send');
  await expect(page.locator('#status')).toHaveClass(/error/);
  await page.evaluate(() => (window as any).pocketview.setInput('{"a": 1}'));
  await page.click('#send');
  await expect(page.locator('.notice h2')).toHaveText('object');
});

test('settings modal toggles diagnostics', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await page.click('#settings-open');
  await expect(page.locator('#settings')).toBeVisible();
  await page.check('#opt-diagnostics');
  await page.click('#settings .close');
  await expect(page.locator('.pv-text')).toHaveClass(/diagnostics/);
  await page.screenshot({ path: 'test-results/settings.png' });
});

test('a book-length text lays out quickly and renders only visible lines', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  const book = await page.evaluate(() => {
    const words = 'the quick brown fox jumps over lazy dogs while extraordinary typesetting algorithms ' +
      'consider every possible breakpoint in each paragraph and hyphenation reduces raggedness';
    const w = words.split(' ');
    let seed = 1;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const paras: string[] = [];
    for (let p = 0; p < 3000; p++) {
      const n = 30 + Math.floor(rnd() * 120);
      paras.push(Array.from({ length: n }, () => w[Math.floor(rnd() * w.length)]).join(' ') + '.');
    }
    return paras.join('\n\n');
  });
  await page.evaluate((t) => (window as any).pocketview.setInput(t), book);
  await page.evaluate(() => { document.body.dataset.ready = ''; });
  await page.click('#send');
  await page.waitForSelector('body[data-ready="true"]', { timeout: 60_000 });
  const status = await page.locator('#status').textContent();
  console.log(status);
  const ms = Number(/(\d+) ms/.exec(status ?? '')?.[1]);
  expect(ms).toBeLessThan(15_000);
  expect(await page.locator('.pv-line').count()).toBeLessThan(200);
  await page.locator('#view').evaluate((v) => { v.scrollTop = v.scrollHeight / 2; });
  await page.waitForTimeout(100);
  await expect(page.locator('.pv-line').first()).toBeVisible();
  await noOverflow(page);
});

test('mobile: bottom sheet collapses after showing, and expands again', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await expect(page.locator('#app')).toHaveClass(/collapsed/);
  await page.screenshot({ path: 'test-results/mobile-collapsed.png' });
  await page.click('#sheet-toggle');
  await expect(page.locator('#app')).not.toHaveClass(/collapsed/);
  await expect(page.locator('.cm-editor')).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: 'test-results/mobile-expanded.png' });
});
