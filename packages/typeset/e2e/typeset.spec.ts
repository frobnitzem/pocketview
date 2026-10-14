import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('body[data-ready="true"]');
});

// The planner trusts canvas widths; this checks the DOM draws the same widths.
test('planned line widths match what the browser draws', async ({ page }) => {
  const report = await page.evaluate(() => {
    const rows: { text: string; target: number; drawn: number; overflow: boolean; justify: boolean }[] = [];
    for (const line of document.querySelectorAll<HTMLElement>('.pv-line')) {
      const range = document.createRange();
      range.selectNodeContents(line);
      const drawn = range.getBoundingClientRect().width;
      rows.push({
        text: line.textContent ?? '',
        target: parseFloat(line.style.width),
        drawn,
        overflow: line.scrollWidth > line.clientWidth + 1,
        justify: line.style.textAlign === 'justify',
      });
    }
    return rows;
  });
  expect(report.length).toBeGreaterThan(10);
  for (const row of report) {
    expect(row.overflow, row.text).toBe(false);
    if (row.justify) expect(Math.abs(row.drawn - row.target), row.text).toBeLessThan(0.5);
    else expect(row.drawn, row.text).toBeLessThanOrEqual(row.target + 0.5);
  }
});

test('natural widths agree with canvas measurement', async ({ page }) => {
  const worst = await page.evaluate(() => {
    let worst = 0;
    const probe = document.createElement('span');
    probe.style.whiteSpace = 'nowrap';
    probe.style.font = '17px "Source Serif 4"';
    document.body.appendChild(probe);
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.font = '17px "Source Serif 4"';
    for (const line of document.querySelectorAll<HTMLElement>('.pv-line')) {
      probe.textContent = line.textContent;
      worst = Math.max(worst, Math.abs(probe.getBoundingClientRect().width - ctx.measureText(probe.textContent ?? '').width));
    }
    return worst;
  });
  expect(worst).toBeLessThan(0.5);
});

test('screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 680, height: 1100 });
  await page.screenshot({ path: 'test-results/typeset-demo.png', fullPage: true });
});
