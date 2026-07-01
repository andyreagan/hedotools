import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture-barchart.html')).href;

// The fixture feeds 5 states, so the chart draws 5 bars + 5 labels.
const EXPECTED_STATES = 5;

let pageErrors;

test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    await page.goto(fixture);
    await page.waitForFunction(() => window.__rendered === true);
});

test.afterEach(() => {
    // Migration canary: rendering must not throw. A d3 API regression on a
    // future version bump (e.g. the removed d3.event in v6) surfaces here.
    expect(pageErrors, pageErrors.map((e) => e.message).join('\n')).toEqual([]);
});

test('renders the barchart SVG with the expected structure', async ({ page }) => {
    await expect(page.locator('#barchart svg#barchartsvg')).toHaveCount(1);

    // one rect + one text label per state
    await expect(page.locator('#barchart rect.staterect')).toHaveCount(EXPECTED_STATES);
    await expect(page.locator('#barchart text.statetext')).toHaveCount(EXPECTED_STATES);
});

test('renders a ranked x-axis with ticks', async ({ page }) => {
    await expect(page.locator('#barchart g.x.axis')).toHaveCount(1);
    expect(await page.locator('#barchart g.x.axis .tick').count()).toBeGreaterThan(0);
});

test('labels are rank-numbered and sorted by happiness descending', async ({ page }) => {
    const labels = await page.locator('#barchart text.statetext').allTextContents();
    // highest value (Hawaii, 0.30) ranks first; lowest (Ohio, -0.20) ranks last
    expect(labels[0]).toBe('1. Hawaii');
    expect(labels[EXPECTED_STATES - 1]).toBe('5. Ohio');
});

// d3 v6 migration canary: .on() handlers are now (event, d), with the index
// gone. The barchart hover recovers it as d[0] and calls
// barchartoncall.test(d, d[0]). Hovering the top bar must fire with the right
// datum + recovered index (the same pattern map/sankey handlers use).
test('hovering a bar fires the v6 handler with the recovered index', async ({ page }) => {
    expect(await page.evaluate(() => window.__lastBar)).toBeUndefined();

    await page.locator('#barchart rect.staterect').first().hover();
    await page.waitForFunction(() => window.__lastBar !== undefined);

    const bar = await page.evaluate(() => window.__lastBar);
    expect(bar.label).toBe('Hawaii'); // highest value -> rank 1 -> first rect
    expect(bar.i).toBe(0);            // index recovered from d[0]
});

// Regression: the barchart's mousedown ("click-to-open") handlers were dropped
// in an earlier port. They call hedotools.barchartonclick.test(d, d[0]) on both
// the rects and the labels, so a click drives the linked shift on the host page.
test('mousedown on a bar fires the click-to-open handler', async ({ page }) => {
    expect(await page.evaluate(() => window.__clickedBar)).toBeUndefined();

    await page.locator('#barchart rect.staterect').first().dispatchEvent('mousedown');
    await page.waitForFunction(() => window.__clickedBar !== undefined);

    const bar = await page.evaluate(() => window.__clickedBar);
    expect(bar.label).toBe('Hawaii');
    expect(bar.i).toBe(0);
});
