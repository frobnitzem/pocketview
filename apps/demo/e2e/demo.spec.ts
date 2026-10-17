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
  await expect(page.locator('.pv-line').first()).toContainText('Riemann');
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

/** Clicks a container's border: the only way to change the target. */
async function border(page: Page, slot: string) {
  await page.locator(`.pv-frame[data-slot="${slot}"] path`).dispatchEvent('click');
}

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
  // A nested frame's title opens it into the target (the root): it re-roots.
  await page.locator('.pv-title', { hasText: /^author$/ }).click();
  await expect(page.locator('.pv-crumb')).toHaveText('object');
  await expect(page.locator('.pv-title.outer.target')).toHaveText('author');
  await page.locator('.pv-crumb').click();
  await expect(page.locator('.pv-crumb')).toHaveCount(0);
  // Its border targets it in place: the root is unchanged.
  await border(page, '/author');
  await expect(page.locator('.pv-frame.target:not(.outer)')).toHaveCount(1);
  await expect(page.locator('.pv-frame.outer.target')).toHaveCount(0);
  // The outer border targets the root again, and a key opens into it.
  await border(page, '');
  await expect(page.locator('.pv-frame.outer.target')).toHaveCount(1);
  await page.locator('.pv-key', { hasText: /^name$/ }).first().click();
  await expect(page.locator('.pv-crumb[data-slot=""]')).toHaveText('object');
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
  // A root array is a container titled by its type; an object an arch.
  await example(page, 'An array of records (JSON)');
  await expect(page.locator('.pv-title.outer')).toHaveText('array');
  await example(page, 'An object (YAML)');
  await expect(page.locator('.pv-title.outer')).toHaveText('object');
  await example(page, 'An array of records (JSON)');
  await expect(page.locator('.pv-title.outer')).toHaveText('array');
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
  // An opened string sits under a scalar-coloured bar, which is not a target:
  // clicking its title blinks instead of un-targeting.
  await expect(page.locator('.pv-frame.outer.v-bar.ty-scalar:not(.target)')).toHaveCount(1);
  await page.locator('.pv-title.outer').click();
  await expect(page.locator('.pv-layout')).toHaveClass(/blink/);
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

test('untargeted: chips expand in place, and keys toggle between expanded and minified', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 420 });
  await ready(page);
  await example(page, 'An object (YAML)');
  // Arrays are cream, objects amber: the keywords key takes the array colour.
  await expect(page.locator('.pv-key.ty-array', { hasText: /^keywords$/ })).toHaveCount(1);
  // Un-target by clicking the outer border.
  await border(page, '');
  await expect(page.locator('.pv-layout')).not.toHaveClass(/targeted/);
  // Expand a collapsed scalar in place: the root is unchanged (no crumbs).
  const chip = page.locator('.pv-segment.nav.ty-scalar, .pv-chip.nav.ty-scalar').first();
  const name = (await chip.textContent())!.trim().split(' ')[0]!.toLowerCase();
  await chip.click();
  await expect(page.locator('.pv-crumb')).toHaveCount(0);
  const key = page.locator('.pv-key', { hasText: new RegExp(`^${name}$`, 'i') });
  await expect(key).toBeVisible();
  // Its key minifies it again, even though there is room.
  await key.click();
  await expect(key).toHaveCount(0);
  const collapsed = page.locator('.pv-segment, .pv-chip').filter({ hasText: new RegExp(`^${name}`, 'i') });
  await expect(collapsed).toHaveCount(1);
  // A shown key minifies too, and its chip expands it back.
  await page.locator('.pv-key', { hasText: /^version$/ }).click();
  await expect(page.locator('.pv-key', { hasText: /^version$/ })).toHaveCount(0);
  await page.locator('.pv-segment, .pv-chip').filter({ hasText: /^version/i }).click();
  await expect(page.locator('.pv-key', { hasText: /^version$/ })).toHaveCount(1);
  // The border targets again.
  await border(page, '');
  await expect(page.locator('.pv-layout')).toHaveClass(/targeted/);
});

test('a long array pages in a container; opening it makes it the target', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await page.click('#settings-open');
  await page.getByRole('button', { name: /Invisible Man/ }).click();
  await page.waitForSelector('.pv-range');
  const range = page.locator('.pv-range').first();
  await expect(range).toHaveText(/^1\u2013\d+ of 29$/);
  await expect(page.locator('.pv-pager[aria-label="Previous page"]').first()).toHaveClass(/disabled/);
  const first = (await range.textContent())!;
  const shown = Number(/\u2013(\d+)/.exec(first)![1]);
  await page.locator('.pv-pager[aria-label="Next page"]').first().click();
  await expect(range).toHaveText(new RegExp(`^${shown + 1}\u2013\\d+ of 29$`));
  await page.locator('.pv-pager[aria-label="Previous page"]').first().click();
  await expect(range).toHaveText(new RegExp(`^1\u2013\\d+ of 29$`));
  // Its title opens it: it becomes the outer target container, with breadcrumbs.
  await page.locator('.pv-title', { hasText: /^chapters$/ }).click();
  await expect(page.locator('.pv-frame.outer.target.v-container')).toHaveCount(1);
  await expect(page.locator('.pv-crumb')).toHaveText('object');
});

test('the book reads a chapter per page, and the page itself never scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  await page.click('#settings-open');
  await page.getByRole('button', { name: /Invisible Man/ }).click();
  await page.waitForSelector('.pv-range');
  await expect(page.locator('.pv-range').first()).toHaveText('1\u20131 of 29');
  const text = page.locator('.pv-textblock.scroll').first();
  expect((await text.boundingBox())!.height).toBeGreaterThan(300);
  const view = await page.locator('#view').evaluate((v) => ({ sh: v.scrollHeight, ch: v.clientHeight }));
  expect(view.sh).toBeLessThanOrEqual(view.ch);
  await page.locator('.pv-pager[aria-label="Next page"]').first().click();
  await expect(page.locator('.pv-range').first()).toHaveText('2\u20132 of 29');
});

test('the outer side bar pages its segments with arrows', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 360 });
  await ready(page);
  const doc = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`key${i}`, { a: 1, b: 2 }]));
  await page.evaluate((d) => (window as any).pocketview.setInput(JSON.stringify(d)), doc);
  await page.click('#send');
  await page.waitForSelector('.pv-pager[aria-label="More segments"]');
  const before = await page.locator('.pv-segment').allTextContents();
  await page.locator('.pv-pager[aria-label="More segments"]').click();
  const after = await page.locator('.pv-segment').allTextContents();
  expect(after[0]).not.toBe(before[0]);
  await expect(page.locator('.pv-pager[aria-label="Previous segments"]')).not.toHaveClass(/disabled/);
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

test('a nested target stays in place; opening renders into it with its own breadcrumbs', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await ready(page);
  const doc = { a: { b: { c: { x: 1, y: 2 }, d: { z: 3 } }, e: 1 }, f: { g: 1 } };
  await page.evaluate((d) => (window as any).pocketview.setInput(JSON.stringify(d, null, 2)), doc);
  await page.click('#send');
  await page.waitForSelector('.pv-layout');
  await border(page, '/a/b');
  const target = page.locator('.pv-frame.target:not(.outer)');
  await expect(target).toHaveCount(1);
  const before = await target.boundingBox();
  // Open a node under b: b's area shows it, with crumbs from b; the root stays.
  await page.locator('.pv-key', { hasText: /^x$/ }).click();
  const title = page.locator('.pv-title.target:not(.outer)');
  await expect(title).toHaveText('x');
  await expect(page.locator('.pv-crumb[data-slot="/a/b"]')).toHaveText(['b', 'c']);
  await expect(page.locator('.pv-crumb[data-slot=""]')).toHaveCount(0);
  await expect(page.locator('.pv-key', { hasText: /^g$/ })).toBeVisible();
  const after = await page.locator('.pv-frame.target:not(.outer)').boundingBox();
  expect(Math.abs(after!.x - before!.x)).toBeLessThan(1);
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
  // Something outside the target refuses to open: the border blinks.
  await page.locator('.pv-key', { hasText: /^g$/ }).click();
  await expect(page.locator('.pv-layout')).toHaveClass(/blink/);
  await expect(title).toHaveText('x');
  // The first crumb shows b itself again; the target stays put.
  await page.locator('.pv-crumb[data-slot="/a/b"]', { hasText: /^b$/ }).click();
  await expect(page.locator('.pv-key', { hasText: /^x$/ })).toBeVisible();
  await expect(page.locator('.pv-title.target:not(.outer)')).toHaveText('b');
  // Titles never change the target: d's title opens d into b.
  await page.locator('.pv-title', { hasText: /^d$/ }).click();
  await expect(page.locator('.pv-title.target:not(.outer)')).toHaveText('d');
  await expect(page.locator('.pv-crumb[data-slot="/a/b"]')).toHaveText(['b']);
});

test('bar segments abut, with background borders between them', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 420 });
  await ready(page);
  await example(page, 'An object (YAML)');
  const boxes = await page.locator('.pv-segment').evaluateAll((els) => els.map((e) => {
    const r = e.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, border: getComputedStyle(e).borderTopWidth };
  }));
  expect(boxes.length).toBeGreaterThan(1);
  for (let i = 1; i < boxes.length; i++) expect(Math.abs(boxes[i]!.top - boxes[i - 1]!.bottom)).toBeLessThan(0.5);
  expect(boxes[0]!.border).toBe('2px');
  await page.locator('.pv-segment', { hasText: /^packages/i }).click();
  await page.locator('.pv-title', { hasText: /^0$/ }).first().click();
  await page.locator('.pv-key', { hasText: /^role$/ }).click();
  const crumbs = await page.locator('.pv-crumb[data-slot=""]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right })));
  expect(crumbs.length).toBe(3);
  for (let i = 1; i < crumbs.length; i++) expect(Math.abs(crumbs[i]!.l - crumbs[i - 1]!.r)).toBeLessThan(0.5);
  await page.screenshot({ path: 'test-results/role-crumbs.png' });
});

test('targeting never re-plans: what was expanded stays', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 420 });
  await ready(page);
  await example(page, 'An object (YAML)');
  await border(page, '');
  await page.locator('.pv-segment', { hasText: /^packages/i }).click();
  const shown = page.locator('.pv-title', { hasText: /^packages$/ });
  await expect(shown).toHaveCount(1);
  const before = await page.locator('.pv-layout > *').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
  const slot = await page.locator('.pv-frame:not(.outer)').first().getAttribute('data-slot');
  await border(page, slot!);
  await expect(page.locator('.pv-frame.target:not(.outer)')).toHaveCount(1);
  await expect(shown).toHaveCount(1);
  const after = await page.locator('.pv-layout > *').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
  expect(after).toEqual(before);
});

test('the embeddable bundle fills fixed-size boxes on a plain page', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 1100 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/embed.html');
  // The viewer's colours stay on its own elements, not the host page.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('normal');
  const box = page.locator('#manifest');
  await expect(box.locator('.pv-title.outer')).toHaveText('package');
  await expect(page.locator('#small .pv-frame.outer')).toHaveCount(1);
  await expect(page.locator('#small')).toHaveAttribute('data-theme', 'lux');
  // The layout fills the box exactly, and the page around it is untouched.
  const outer = await box.boundingBox();
  const layout = await box.locator('.pv-layout').boundingBox();
  expect(layout!.width).toBeLessThanOrEqual(outer!.width);
  expect(layout!.height).toBeLessThanOrEqual(outer!.height);
  // Changes are reported after they are drawn: here, a title opens into the root.
  await box.locator('.pv-title:not(.outer)').first().click();
  await expect(page.locator('#log')).toHaveText(/^open "\/.+"$/);
  await box.locator('.pv-crumb').first().click();
  await expect(page.locator('#log')).toHaveText('open ""');
  // The same actions as API calls: silent unless asked, returning success.
  const api = (code: string) => page.evaluate(code) as Promise<boolean>;
  await expect(page.locator('#log')).toHaveText('open ""');
  expect(await api(`viewer.minify('/author')`)).toBe(true);
  await expect(box.locator('.pv-chip, .pv-segment').filter({ hasText: /^author/i })).toHaveCount(1);
  await expect(page.locator('#log')).toHaveText('open ""'); // not notified
  expect(await api(`viewer.expand('/author', true)`)).toBe(true);
  await expect(page.locator('#log')).toHaveText('expand "/author"');
  expect(await api(`viewer.open('/nowhere')`)).toBe(false);
  expect(await api(`viewer.target('/author', true)`)).toBe(true);
  await expect(page.locator('#log')).toHaveText('target "/author"');
  expect(await api(`viewer.state.target`)).toBe('/author');
  expect(await api(`viewer.open('/author/name')`)).toBe(true);
  expect(await api(`viewer.state.spec.views['/author']`)).toBe('/author/name');
  expect(await api(`viewer.isShown('/author/name')`)).toBe(true);
  expect(await api(`viewer.isShown('/author/url')`)).toBe(false);
  // Updating a node redraws it in place, keeping the navigation.
  expect(await api(`viewer.update('/author/name', 'Ada Lovelace', true)`)).toBe(true);
  await expect(page.locator('#log')).toHaveText('update "/author/name"');
  await expect(box.getByText('Ada Lovelace')).toBeVisible();
  expect(await api(`viewer.state.target`)).toBe('/author');
  expect(await api(`viewer.value.author.name`)).toBe('Ada Lovelace');
  expect(await api(`viewer.update('/nowhere', 1)`)).toBe(false);
  // Replacing the whole document keeps what still exists.
  expect(await api(`viewer.update('', { author: { name: 'Grace Hopper' } })`)).toBe(true);
  await expect(box.getByText('Grace Hopper')).toBeVisible();
  expect(await api(`viewer.state.spec.views['/author']`)).toBe('/author/name');
  await page.click('#swap');
  await expect(box.locator('.pv-title.outer')).toHaveText('solar system');
  await page.screenshot({ path: 'test-results/embed.png', fullPage: true });
  expect(errors).toEqual([]);
});
