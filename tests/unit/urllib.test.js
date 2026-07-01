import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dirname, '../../js/hedotools.urllib.js'), 'utf8');

// hedotools.urllib.js is a browser script: it attaches to a global `hedotools`,
// reads window.location, and writes window.history.replaceState. It only needs
// those two window bits, so instead of a full DOM we inject a fake window and
// load the file in sloppy mode (Function ctor) with a fresh hedotools per test.
function load(search = '') {
    const hedotools = {};
    const calls = { lastUrl: null };
    const win = {
        location: { search, origin: 'http://x.org', pathname: '/books.html' },
        history: { replaceState: (_s, _t, url) => { calls.lastUrl = url; } },
    };
    // eslint-disable-next-line no-new-func
    new Function('hedotools', 'window', src)(hedotools, win);
    return { urllib: hedotools.urllib, calls };
}

describe('urllib.decoder', () => {
    it('parses a bracketed value into an array', () => {
        const { urllib } = load('?lens=[3,7]');
        const r = urllib.decoder().varname('lens')();
        expect(r.current).toEqual(['3', '7']);
        expect(r.cached).toEqual(['3', '7']);
    });

    it('parses a bare value as a string', () => {
        const { urllib } = load('?lens=8.5');
        const r = urllib.decoder().varname('lens')();
        expect(r.current).toBe('8.5');
    });

    it('tolerates a missing closing bracket', () => {
        const { urllib } = load('?lens=[3,7');
        const r = urllib.decoder().varname('lens')();
        expect(r.current).toEqual(['3', '7']);
    });

    it('keeps the seeded default in `cached` when the param is absent', () => {
        // the documented feature: `current` goes blank, but `cached` survives
        const { urllib } = load(''); // no query string
        const decoder = urllib.decoder().varname('lens').varresult([4, 6]);
        const r = decoder();
        expect(r.current).toBe('');
        expect(r.cached).toEqual([4, 6]);
    });

    it('ignores an unrelated param', () => {
        const { urllib } = load('?other=1');
        const r = urllib.decoder().varname('lens')();
        expect(r.current).toBe('');
    });
});

describe('urllib.encoder', () => {
    it('writes a bracketed array value to the url', () => {
        const { urllib, calls } = load('');
        urllib.encoder().varname('lens').varval([4, 6]);
        expect(calls.lastUrl).toBe('http://x.org/books.html?lens=[4,6]');
    });

    it('writes a bare string value', () => {
        const { urllib, calls } = load('');
        urllib.encoder().varname('lens').varval('happy');
        expect(calls.lastUrl).toContain('lens=happy');
    });

    it('preserves existing query params when adding its own', () => {
        const { urllib, calls } = load('?foo=bar');
        urllib.encoder().varname('lens').varval([4, 6]);
        expect(calls.lastUrl).toContain('foo=bar');
        expect(calls.lastUrl).toContain('lens=[4,6]');
    });

    it('destroy() drops its own param but keeps the others', () => {
        const { urllib, calls } = load('?foo=bar');
        const enc = urllib.encoder().varname('lens').varval([4, 6]);
        enc.destroy();
        expect(calls.lastUrl).toContain('foo=bar');
        expect(calls.lastUrl).not.toContain('lens=');
    });
});
