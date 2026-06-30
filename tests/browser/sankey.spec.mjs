import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture-sankey.html')).href;

const EXPECTED_STATES = 51;

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

test('renders the sankey SVG with one link path per state', async ({ page }) => {
    await expect(page.locator('#sankey svg#sankeysvg')).toHaveCount(1);
    // links get class r{0..6}-8 from classColor (not ".sankey"); they are the
    // only <path> elements in the figure.
    await expect(page.locator('#sankey path')).toHaveCount(EXPECTED_STATES);
});

test('renders old + new rank labels (two per state)', async ({ page }) => {
    await expect(page.locator('#sankey text.statetext')).toHaveCount(EXPECTED_STATES * 2);
});

test('inlined link generator produces real cubic-bezier paths', async ({ page }) => {
    // The v3 d3.sankey().link() became an inlined generator; each link must be
    // a non-trivial "M...C..." horizontal curve, not an empty/NaN path.
    const ds = await page.locator('#sankey path').evaluateAll((paths) =>
        paths.map((p) => p.getAttribute('d'))
    );
    expect(ds.length).toBe(EXPECTED_STATES);
    for (const d of ds) {
        expect(d).toMatch(/^M[\d.,-]+C/);
        expect(d).not.toContain('NaN');
    }
});

// d3 v6 migration canary for the dashboard interaction: the link .on("mouseover",
// (event, d)) handler recovers its index via sankeydata.indexOf(d), then calls
// hedotools.sankeyoncall.test(i, data), which drives a shift into #shift01.
// Hovering a link must render that shift — proving index recovery + the whole
// hover->shift path work under v6.
test('hovering a link drives the shift', async ({ page }) => {
    await expect(page.locator('#shift01 svg#shiftsvg')).toHaveCount(0);

    // hover a link near the middle of the rank range (avoids edge overlaps)
    await page.locator('#sankey path').nth(25).hover();

    await expect(page.locator('#shift01 svg#shiftsvg')).toHaveCount(1);
    expect(await page.locator('#shift01 rect.shiftrect').count()).toBeGreaterThan(20);
});
