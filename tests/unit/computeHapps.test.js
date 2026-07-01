import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../js/hedotools.computeHapps.js'), 'utf8');

// computeHapps reads the page globals `allData` and `lens` and writes
// allData[j].avhapps. Inject them as Function args and inspect the mutation.
function load(allData, lens) {
    const hedotools = {};
    // eslint-disable-next-line no-new-func
    new Function('hedotools', 'allData', 'lens', src)(hedotools, allData, lens);
    return hedotools.computeHapps;
}

// 52 rows, because computeHapps hardcodes `for (j=0; j<52; j++)`.
function rows(n, freq) {
    return Array.from({ length: n }, () => ({ freq: freq.slice() }));
}

describe('computeHapps.go', () => {
    it('sets avhapps = sum(freq*lens) / sum(freq)', () => {
        const allData = rows(52, [10, 20]);
        const lens = [5, 9];
        load(allData, lens).go();
        // (10*5 + 20*9) / (10 + 20) = 230/30
        expect(allData[0].avhapps).toBeCloseTo(230 / 30, 10);
        expect(allData[51].avhapps).toBeCloseTo(230 / 30, 10);
    });

    it('is a frequency-weighted mean (not a plain average)', () => {
        const allData = rows(52, [1, 99]); // heavily weighted to the second word
        const lens = [1, 9];
        load(allData, lens).go();
        expect(allData[0].avhapps).toBeCloseTo((1 * 1 + 99 * 9) / 100, 10); // ~8.92
    });

    // Pins a known sharp edge: the loop bound is hardcoded to 52, so a 53rd row
    // is silently left uncomputed. Documented here so a future change is a
    // conscious one, not a surprise.
    it('only processes the first 52 rows (hardcoded bound)', () => {
        const allData = rows(53, [10, 20]);
        load(allData, [5, 9]).go();
        expect(allData[51].avhapps).toBeCloseTo(230 / 30, 10);
        expect(allData[52].avhapps).toBeUndefined();
    });
});
