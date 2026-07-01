hedotools
=========

[![CI](https://github.com/andyreagan/hedotools/actions/workflows/ci.yml/badge.svg)](https://github.com/andyreagan/hedotools/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@andyreagan/hedotools)](https://www.npmjs.com/package/@andyreagan/hedotools)

A collection of [D3](https://d3js.org/) tools in use at [hedonometer.org](https://hedonometer.org):

- **shifter** — the interactive wordshift graph, provided by [`@andyreagan/d3-shifterator`](https://www.npmjs.com/package/@andyreagan/d3-shifterator) and exposed here as `hedotools.shifter`.
- **map** — a choropleth of the US states, coloured by happiness.
- **sankey** — a rank-flow diagram between two time periods.
- **lens** — a brushable word-score histogram that filters which words count.
- **barchart** — a ranked, diverging bar chart of per-state happiness.

## Versioning

The major version tracks the major version of D3 it supports:

| hedotools | D3  | shifter |
| --------- | --- | ------- |
| 3.x       | v3  | bundled (frozen) |
| 4.x       | v4  | bundled, then 4.5+ via `@andyreagan/d3-shifterator` |
| 5.x       | v5  | `@andyreagan/d3-shifterator` ^5 |
| 6.x       | v6  | `@andyreagan/d3-shifterator` ^6 |
| 7.x       | v7  | `@andyreagan/d3-shifterator` ^7 |

The current line (7.x) targets **D3 v7**.

## Installation

```
npm install @andyreagan/hedotools
```

The modules are browser scripts that attach to a global `hedotools` namespace.

### Single-file bundle (recommended)

`dist/hedotools-bundle.js` inlines `@andyreagan/d3-shifterator`, so you only
need global `d3` (plus jQuery, and `topojson` for the map). One script tag
gives you the whole `hedotools.*` namespace:

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://unpkg.com/topojson-client@3"></script>
<script src="node_modules/@andyreagan/hedotools/dist/hedotools-bundle.js"></script>
```

`dist/hedotools.js` is the same but *without* d3-shifterator inlined — use it
if you already load the `shifterator` global yourself (load it before this
file). Both are produced by `bundle.sh` / `npm run build`.

### Individual sources

Or load the raw sources in order — D3, then the d3-shifterator UMD (it defines
the global `shifterator`), then the hedotools sources:

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="node_modules/@andyreagan/d3-shifterator/dist/shifterator.js"></script>
<script src="node_modules/@andyreagan/hedotools/js/hedotools.init.v4.js"></script>
<script src="node_modules/@andyreagan/hedotools/js/hedotools.shifter.js"></script>
<!-- plus whichever dashboard modules you need: -->
<script src="node_modules/@andyreagan/hedotools/js/hedotools.barchart.js"></script>
<script src="node_modules/@andyreagan/hedotools/js/hedotools.map.js"></script>
<script src="node_modules/@andyreagan/hedotools/js/hedotools.lens.js"></script>
<script src="node_modules/@andyreagan/hedotools/js/hedotools.sankey.js"></script>
```

`hedotools.map` and `hedotools.sankey` also use
[`topojson-client`](https://www.npmjs.com/package/topojson-client) (global
`topojson`); some helpers use jQuery.

## Usage

### shifter

`hedotools.shifter` is a singleton instance of `@andyreagan/d3-shifterator`.
Drive it with the frequency vectors, word scores (`lens`), and word list:

```js
hedotools.shifter.shift(refF, compF, lens, words);
hedotools.shifter
    .setfigure(d3.select("#shift01"))
    .setText(["Why comparison is happier than reference:"])
    .plot();
```

See the [d3-shifterator README](https://github.com/andyreagan/d3-shifterator)
for the full shifter API and a [live Observable example](https://observablehq.com/@andyreagan/d3-shifterator-v4).

### barchart

```js
var bc = hedotools.barchart();
bc.setfigure(d3.select("#barchart"));
bc.setdata(data, geodata); // data: per-state values; geodata: geojson w/ properties.name
bc._figheight(400);
bc.plot();
```

### map

```js
var m = hedotools.map();
m.setfigure(d3.select("#map"));
m.setdata(geoJson);        // us-states topojson
m.plot();
```

### lens

```js
var l = hedotools.lens();
l.setfigure(d3.select("#lens"));
l.setdata(lens);           // array of word-happiness scores
l.plot();
```

### sankey

```js
var s = hedotools.sankey();
s.setfigure(d3.select("#sankey"));
s.setdata(oldlist, newlist, stateNames); // two happiness vectors + names
s.plot();
```

> **Note:** unlike the shifter, the four dashboard modules were written for the
> hedonometer.org pages and read page-level globals (e.g. `allData`, `lens`,
> `words`, `shiftRef`/`shiftComp`, and the url encoders) in their interaction
> handlers, where hovering/clicking drives a linked shift. They render
> standalone from `setdata(...).plot()`, but the hover→shift wiring expects
> those globals to be present. See `tests/browser/` for working fixtures.

## Developing

```
npm install
npm test          # lint + unit + Playwright browser tests
npm run lint
npm run test:browser
npm run build     # bundle.sh -> dist/hedotools.js + dist/hedotools-bundle.js
```

Browser tests live in `tests/browser/`: each module loads as a `<script>` with
real D3 and is asserted against the SVG it renders (including the v6
`(event, d)` interaction handlers).

Releases publish to npm automatically via GitHub Actions
([Trusted Publishing / OIDC](.github/workflows/publish.yml)) when a GitHub
Release is created:

```
# bump "version" in package.json, commit
git tag vX.Y.Z
git push origin master --tags
gh release create vX.Y.Z   # -> CI runs npm test, then npm publish
```

## License

[BSD-2-Clause](LICENSE)
