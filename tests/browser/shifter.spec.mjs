import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture-shifter.html')).href;

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

// v4.5 integration: hedotools.shifter is now the @andyreagan/d3-shifterator
// package (js/hedotools.shifter.js does `hedotools.shifter =
// shifterator.shifterator()`). This proves the package's instance answers the
// exact API the dashboard modules call: .shift(refF,compF,lens,words) then
// .setfigure(...).setText(...).plot().
test('hedotools.shifter (d3-shifterator) renders the wordshift', async ({ page }) => {
    await expect(page.locator('#shift01 svg#shiftsvg')).toHaveCount(1);
    // one bar + one label per shifted word
    const bars = await page.locator('#shift01 rect.shiftrect').count();
    expect(bars).toBeGreaterThan(20);
    await expect(page.locator('#shift01 text.shifttext')).toHaveCount(bars);
});

test('shifter exposes the methods the dashboard modules call', async ({ page }) => {
    const api = await page.evaluate(() => {
        const s = window.hedotools.shifter;
        return ['shift', 'setfigure', 'setText', 'plot', '_compH', '_refH', '_refF', '_compF', 'stop', 'shifter']
            .map((m) => typeof s[m] === 'function');
    });
    expect(api.every(Boolean)).toBe(true);
});

test('the shift labels include the input words', async ({ page }) => {
    const labels = await page.locator('#shift01 text.shifttext').allTextContents();
    expect(labels.join(' ')).toContain('word');
});
