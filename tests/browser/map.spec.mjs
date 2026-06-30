import { test, expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(resolve(__dirname, 'fixture-map.html')).href;

// The us-states topojson has 51 state features.
const EXPECTED_STATES = 51;

let pageErrors;

test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    await page.goto(fixture);
    await page.waitForFunction(() => window.__rendered === true);
});

test.afterEach(() => {
    // Migration canary: a d3-geo / event regression on a version bump shows here.
    expect(pageErrors, pageErrors.map((e) => e.message).join('\n')).toEqual([]);
});

test('renders the choropleth SVG with one path per state', async ({ page }) => {
    await expect(page.locator('#map svg#mapsvg')).toHaveCount(1);
    await expect(page.locator('#map path.state')).toHaveCount(EXPECTED_STATES);
});

test('projects geometry into non-degenerate paths', async ({ page }) => {
    // geoAlbersUsa + geoPath must produce real path data, not empty "d" attrs.
    const d = await page.locator('#map path.state').first().getAttribute('d');
    expect(d).toBeTruthy();
    expect(d.length).toBeGreaterThan(20);
});

test('renders the legend group with 7 swatches', async ({ page }) => {
    // Note: makeSelector() is defined but not called by plot() (the selector
    // UI is wired up by the host page), so only the legend is asserted here.
    await expect(page.locator('#map g.legendgroup')).toHaveCount(1);
    await expect(page.locator('#map g.legendgroup rect')).toHaveCount(7);
});

// d3 v6 migration canary for the dashboard interaction: state_hover is an
// .on("mouseover", (event, d)) handler that recovers its index via
// stateFeatures.indexOf(d), then drives a shift (setting shiftRef from that
// index and calling hedotools.shifter.shift). Hovering a state must show its
// info box (proving the index resolved to the right datum) and render the
// shift into #shift01 (proving the whole hover->shift path works under v6).
test('hovering a state shows its info box and drives the shift', async ({ page }) => {
    const path = page.locator('#map path.state').nth(3);
    // each path's id is its state name (d.properties.name)
    const stateName = await path.getAttribute('id');

    await page.evaluate(() => { window.hedotools.shifter; }); // ensure ready
    await path.hover();

    // info box appears, labelled with the hovered state's name — this is
    // allData[i].name, so it matches only if the index was recovered correctly.
    await expect(page.locator('#map g.hoverinfogroup')).toHaveCount(1);
    const boxName = await page.locator('#map g.hoverinfogroup text').first().textContent();
    expect(boxName).toBe(stateName);

    // and the hover fired a shift (shiftRef = recovered index != shiftComp)
    await expect(page.locator('#shift01 svg#shiftsvg')).toHaveCount(1);
    expect(await page.locator('#shift01 rect.shiftrect').count()).toBeGreaterThan(20);
});
