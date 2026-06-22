#!/usr/bin/env bash
# Concatenate the D3 v4 sources into a single browser bundle for hedonometer.org.
# Order matters: init.v4 defines the `hedotools` namespace + helpers first, and
# the dashboard modules (barchart/lens/map/sankey) depend on hedotools.shifter.
#
# NOTE: hedotools.shifter.js only adapts the @andyreagan/d3-shifterator package
# into hedotools.shifter — the page must load D3 v4 and the d3-shifterator UMD
# bundle (global `shifterator`) BEFORE this bundle.
set -euo pipefail
cd "$(dirname "$0")/js"

cat \
  hedotools.init.v4.js \
  hedotools.urllib.js \
  hedotools.barchart.js \
  hedotools.lens.js \
  hedotools.map.js \
  hedotools.sankey.js \
  hedotools.shifter.js \
  > hedotools.v4.js

echo "built js/hedotools.v4.js"
