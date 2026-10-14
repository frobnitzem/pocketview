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

test('reports parse errors', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => (window as any).pocketview.setInput('{"a": '));
  await page.click('#send');
  await expect(page.locator('#status')).toHaveClass(/error/);
});

async function example(page: Page, name: string) {
  await page.click('#settings-open');
  await page.getByRole('button', { name }).click();
  await page.waitForSelector('.pv-layout');
}

test('lays out an object in arch frames, and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await example(page, 'An object (YAML)');
  await expect(page.locator('.pv-frame').first()).toBeVisible();
  await expect(page.locator('.pv-title').first()).toHaveText('object');
  await expect(page.locator('.pv-key', { hasText: 'version' })).toBeVisible();
  await page.screenshot({ path: 'test-results/object-desktop.png' });
  // Zoom into a nested frame by its title; the root becomes a breadcrumb.
  await page.locator('.pv-title.nav', { hasText: 'author' }).click();
  await expect(page.locator('.pv-crumb')).toHaveText('object');
  await expect(page.locator('.pv-title.focus')).toHaveText('author');
  await page.locator('.pv-crumb').click();
  await expect(page.locator('.pv-crumb')).toHaveCount(0);
});

test('collapses into segments and chips when small, and they navigate', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 420 });
  await ready(page);
  await example(page, 'An object (YAML)');
  const collapsed = page.locator('.pv-segment.nav, .pv-chip.nav');
  expect(await collapsed.count()).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/object-small.png' });
  await collapsed.first().click();
  await expect(page.locator('.pv-crumb').first()).toHaveText('object');
});

test('switching between layout examples always redraws', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await example(page, 'An array of records (JSON)');
  await expect(page.locator('.pv-title', { hasText: /^0$/ })).toBeVisible();
  await example(page, 'An object (YAML)');
  await expect(page.locator('.pv-title').first()).toHaveText('object');
  await example(page, 'An array of records (JSON)');
  await expect(page.locator('.pv-title').first()).toHaveText('0');
  // Typing new input and sending also redraws.
  await page.evaluate(() => (window as any).pocketview.setInput('{"fresh": "document"}'));
  await page.click('#send');
  await expect(page.locator('.pv-key')).toHaveText(['fresh']);
});

test('strings are drawn without quotes; key capsules match their value height', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await example(page, 'An object (YAML)');
  await expect(page.locator('.pv-token', { hasText: '0.2.0' })).toHaveText('0.2.0');
  await expect(page.locator('.pv-tag').first()).toHaveText('json');
  const key = await page.locator('.pv-key', { hasText: /^keywords$/ }).boundingBox();
  const lic = await page.locator('.pv-key', { hasText: /^license$/ }).boundingBox();
  expect(lic!.height).toBe(28);
  expect(key!.height).toBeGreaterThanOrEqual(28);
});

test('clipped labels get a tooltip; a focused string takes the chip colour', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 320 });
  await ready(page);
  const long = 'an_extraordinarily_long_key_that_cannot_possibly_fit';
  await page.evaluate((k) => (window as any).pocketview.setInput(JSON.stringify({
    [k]: { x: 1 }, a: 'some text', b: 'more', c: 'and more', d: 4, e: 5, f: 6, g: 7, h: 8,
  })), long);
  await page.click('#send');
  await page.waitForSelector('.pv-layout');
  await expect(page.locator(`[title^="${long}"]`)).toHaveCount(1); // label, plus its badge
  await page.locator('.pv-key', { hasText: /^a$/ }).click();
  await expect(page.locator('.pv-layout')).toHaveClass(/unframed/);
});

test('colour schemes switch from the settings menu', async ({ page }) => {
  await ready(page);
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const before = await bg();
  await page.click('#settings-open');
  await page.selectOption('#opt-theme', 'solar-light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'solar-light');
  expect(await bg()).toBe('rgb(253, 246, 227)');
  expect(await bg()).not.toBe(before);
});

test('desktop: the input pane folds to the left and back', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await example(page, 'An array of records (JSON)');
  await page.click('#sheet-toggle');
  await expect(page.locator('#app')).toHaveClass(/side-collapsed/);
  await expect(page.locator('.cm-editor')).toBeHidden();
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'test-results/folded.png' });
  await page.click('#sheet-toggle');
  await expect(page.locator('.cm-editor')).toBeVisible();
});

test('each render replaces the previous one', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  const austenLines = await page.locator('.pv-line').count();
  await page.click('#send');
  await page.click('#send');
  await expect(page.locator('.pv-line')).toHaveCount(austenLines);
  await page.click('#settings-open');
  await page.getByRole('button', { name: 'A JSON string' }).click();
  await expect(page.locator('.pv-line').first()).toContainText('A JSON document');
  await expect(page.locator('.pv-line', { hasText: 'universally' })).toHaveCount(0);
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
