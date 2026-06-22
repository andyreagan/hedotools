import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture-lens.html')).href;

let pageErrors;

test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    await page.goto(fixture);
    await page.waitForFunction(() => window.__rendered === true);
});

test.afterEach(() => {
    expect(pageErrors, pageErrors.map((e) => e.message).join('\n')).toEqual([]);
});

test('renders the histogram SVG (bars + outline + brush)', async ({ page }) => {
    await expect(page.locator('#lens svg#lenssvg')).toHaveCount(1);
    // d3.histogram over ~65 thresholds => most bins populated with 3000 points
    expect(await page.locator('#lens g.distrect').count()).toBeGreaterThan(55);
    await expect(page.locator('#lens path.line')).toHaveCount(1);
    await expect(page.locator('#lens g.lensbrush')).toHaveCount(1);
});

test('bars have real (positive) heights from bin counts', async ({ page }) => {
    // catches a d3.histogram bin-field regression (.length vs the old .y)
    const heights = await page.locator('#lens g.distrect rect').evaluateAll((rects) =>
        rects.map((r) => parseFloat(r.getAttribute('height')))
    );
    expect(heights.length).toBeGreaterThan(55);
    expect(Math.max(...heights)).toBeGreaterThan(0);
});

// The core of the lens rewrite: d3.svg.brush (data-space .extent()) became
// d3.brushX (pixel-space d3.event.selection, inverted through brushX). Dragging
// a new selection must fire the "end" handler and invert to data coordinates.
test('dragging the brush fires the handler with inverted data-space extent', async ({ page }) => {
    expect(await page.evaluate(() => window.__lastExtent)).toBeUndefined();

    // The brushable region sits roughly x in [76, 548], y in [8, 90] (page
    // coords). Drag a selection well inside it.
    await page.mouse.move(150, 45);
    await page.mouse.down();
    await page.mouse.move(320, 45, { steps: 5 });
    await page.mouse.up();

    await page.waitForFunction(() => Array.isArray(window.__lastExtent));
    const ext = await page.evaluate(() => window.__lastExtent);
    expect(ext).toHaveLength(2);
    expect(ext[0]).toBeLessThan(ext[1]);
    // inverted into the [1, 9] word-score domain
    expect(ext[0]).toBeGreaterThanOrEqual(1);
    expect(ext[1]).toBeLessThanOrEqual(9);
});
