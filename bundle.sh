# version them with d3 versions
cat hedotools.init.js hedotools.urllib.js hedotools.barchart.js hedotools.lens.js hedotools.map.js hedotools.sankey.js hedotools.shifter.js  > hedotools.v3.js
cat hedotools.init.v4.js hedotools.urllib.js hedotools.shifter.v4.js > hedotools.v4.js
# minify
node ../node_modules/minifier/index.js hedotools.v3.js
node ../node_modules/minifier/index.js hedotools.v4.js
# link
rm hedotools.js hedotools.min.js
ln -s hedotools.v3.js hedotools.js
ln -s hedotools.v3.min.js hedotools.min.js

