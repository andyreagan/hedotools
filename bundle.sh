#!/usr/bin/env bash
# Concatenate the D3 v4 sources into a single browser bundle for hedonometer.org.
# Order matters: init.v4 defines the `hedotools` namespace + helpers first, and
# the dashboard modules (barchart/lens/map/sankey) depend on the shifter.
set -euo pipefail
cd "$(dirname "$0")/js"

cat \
  hedotools.init.v4.js \
  hedotools.urllib.js \
  hedotools.barchart.js \
  hedotools.lens.js \
  hedotools.map.js \
  hedotools.sankey.js \
  hedotools.shifter.v4.js \
  > hedotools.v4.js

echo "built js/hedotools.v4.js"
