#!/usr/bin/env bash
# Build the distributable browser bundles into dist/.
#
# Two artifacts, mirroring @andyreagan/d3-shifterator's shifterator.js /
# shifterator-bundle.js split:
#
#   dist/hedotools.js         the concatenated hedotools sources. Attaches
#                             everything to a global `hedotools`. Expects global
#                             `d3` (v7) AND `shifterator` (from
#                             @andyreagan/d3-shifterator) to be loaded first.
#
#   dist/hedotools-bundle.js  the above with the d3-shifterator UMD inlined, so
#                             a consumer needs only global `d3` (plus jQuery, and
#                             `topojson` for the map). This is the single-file
#                             drop-in for a page that just wants `hedotools.*`.
#
# Source order matters: init.v4 defines the `hedotools` namespace + helpers,
# the dashboard modules depend on it, and hedotools.shifter.js (the adapter)
# needs the global `shifterator` at load time.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"
mkdir -p dist

# hedotools.nonsankey.js is deliberately NOT bundled: it is an alternate that
# also defines `hedotools.sankey` (the cities-page variant), so it is loaded
# INSTEAD of hedotools.sankey.js, never alongside it. It ships as a loose file.
cat \
  js/hedotools.init.v4.js \
  js/hedotools.urllib.js \
  js/hedotools.computeHapps.js \
  js/hedotools.barchart.js \
  js/hedotools.lens.js \
  js/hedotools.map.js \
  js/hedotools.sankey.js \
  js/hedotools.shifter.js \
  > dist/hedotools.js
echo "built dist/hedotools.js"

shifter="node_modules/@andyreagan/d3-shifterator/dist/shifterator.js"
if [ -f "$shifter" ]; then
  cat "$shifter" dist/hedotools.js > dist/hedotools-bundle.js
  echo "built dist/hedotools-bundle.js"
else
  echo "WARNING: $shifter not found (run npm install) — skipped dist/hedotools-bundle.js" >&2
fi
