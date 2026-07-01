import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture-bundle.html')).href;

// The API surface hedonometer.org's pages call. This test is the contract:
// if a future d3-shifterator/d3 bump drops one of these, CI fails here before
// the site breaks. Derived from grepping hedotools.* call sites across the
// hedonometer static JS (selectChapter, city-nonsankey, hedotools.map, etc.).
const SHIFTER_API = [
    'shift', 'shifter', 'stop', 'setfigure', 'setText', 'plot', 'setHeight',
    'ignore', '_refF', '_compF', '_refH', '_compH', '_lens', '_words',
];
const SANKEY_API = [
    'setfigure', 'setdata', 'plot', 'replot', 'data', 'newindices',
    'setTitles', 'setSideWidth', 'setTipOn',
];

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

test('the single-file bundle populates the whole hedotools namespace', async ({ page }) => {
    const types = await page.evaluate(() => ({
        hedotools: typeof window.hedotools,
        shifter: typeof window.hedotools.shifter,
        barchart: typeof window.hedotools.barchart,
        map: typeof window.hedotools.map,
        lens: typeof window.hedotools.lens,
        sankey: typeof window.hedotools.sankey,
        computeHapps: typeof window.hedotools.computeHapps,
    }));
    expect(types.hedotools).toBe('object');
    // every module is an invoked singleton (not a bare factory), consistent
    // with hedotools.shifter and how hedonometer's pages consume them.
    expect(types.shifter).toBe('object');
    expect(types.barchart).toBe('object');
    expect(types.map).toBe('object');
    expect(types.lens).toBe('object');
    expect(types.sankey).toBe('object');
    expect(types.computeHapps).toBe('object'); // lens' onredraw path calls .go()
});

test('hedotools.shifter exposes every method hedonometer calls', async ({ page }) => {
    const missing = await page.evaluate((api) => {
        const s = window.hedotools.shifter;
        return api.filter((m) => typeof s[m] !== 'function');
    }, SHIFTER_API);
    expect(missing).toEqual([]);
});

test('hedotools.sankey exposes every method hedonometer calls', async ({ page }) => {
    const missing = await page.evaluate((api) => {
        const s = window.hedotools.sankey; // singleton
        return api.filter((m) => typeof s[m] !== 'function');
    }, SANKEY_API);
    expect(missing).toEqual([]);
});

test('hedotools.map / lens / barchart expose setfigure/setdata/plot', async ({ page }) => {
    const ok = await page.evaluate(() => {
        const has = (o, m) => typeof o[m] === 'function';
        const m = window.hedotools.map, l = window.hedotools.lens, b = window.hedotools.barchart;
        return has(m, 'setfigure') && has(m, 'setdata') && has(m, 'plot')
            && has(l, 'setfigure') && has(l, 'setdata') && has(l, 'plot')
            && has(b, 'setfigure') && has(b, 'setdata') && has(b, 'plot');
    });
    expect(ok).toBe(true);
});

test('the bundle renders a shift end-to-end', async ({ page }) => {
    await expect(page.locator('#shift01 svg#shiftsvg')).toHaveCount(1);
    expect(await page.locator('#shift01 rect.shiftrect').count()).toBeGreaterThan(20);
});
