Let's try to see where this code has ended up.

This helps:
find . -name "*shifter*.js"

1. Here
~/tools/d3/hedotools/js/hedotools.shifter.js
~/tools/d3/hedotools/js/hedotools.shifter.v4.js

2. Hedonometer.org
~/websites/hedonometer.org/hedonometer/static/hedonometer/hedotools-1.0.1/js/hedotools.shifter.js
- d3.urllib instead of hedotools.urllib
- no getfigure()
- missing setBgcolor
- missing _fontString
~/websites/hedonometer.org/hedonometer/static/hedonometer/js/hedotools.shifter.js
- all of the whitespace changes...
- no _viz_type_use_URL()
- d3.urllib instead of hedotools.urllib
- return hedotools.shifter instead of return that
- different height and margin:
-    var fullwidth = 400;
-    var fullheight = 550 // 650; // make sure to change num words too
-
-    var margin = {top: 0, right: 0, bottom: 0, left: 0};
+    var fullwidth = 700;
+    var fullheight = 500 // 650; // make sure to change num words too
+
+    var margin = {
+        top: 0,
+        right: 0,
+        bottom: 0,
+        left: 0
+    };
different number of words:
-    var numWords = 28; // 37 with height 650 // 23 with height 500
-    // I should be able to compute this?
+    var numWords = 23; // 37 with height 650
missing -    var sortedWordsRaw, sortedWordsEnRaw
missing function for that
-    var _sortedWordsRaw = function(_) {
-        var that = this;
-       if (!arguments.length) return sortedWordsRaw;
-       sortedWordsRaw = _;
-       return that;
-    }
missing get_word_index
added:
+    var _sortedWordsEn = function(_) {
+        if (!arguments.length) return sortedWordsEn;
+        sortedWordsEn = _;
+        return hedotools.shifter;
     }
uses transform on the top;
-           .attr({"class": function(d,i) { return "shifttext "+intStr0[sortedType[i]]; },
-                   "x": 0,
-                   "y": 0,
-                   "transform": function(d,i) {
-                       if (d>0) { return "translate("+(x(d)+2)+","+(y(i+1)+iBarH)+")"; }
-                      else { return "translate("+(x(d)-2)+","+(y(i+1)+iBarH)+")"; }
-                   },})
-           // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
-           // .attr("y",function(d,i) { return y(i+1)+iBarH; } )
-           .style({"text-anchor": function(d,i) { return ((d < 0) ? "end" : "start"); },
-                    "font-size": wordfontsize})
-           .text(function(d,i) { return sortedWords[i]; });
+            .attr("class", function(d, i) {
+                return "shifttext " + intStr0[sortedType[i]];
+            })
+            .attr("x", function(d, i) {
+                if (d > 0) {
+                    return x(d) + 2;
+                } else {
+                    return x(d) - 2;
+                }
+            })
+            .attr("y", function(d, i) {
+                return y(i + 1) + iBarH;
+            })
+            .style({
+                "text-anchor": function(d, i) {
+                    if (sortedMag[i] < 0) {
+                        return "end";
+                    } else {
+                        return "start";
+                    }
+                },
+                "font-size": bigshifttextsize
+            })
+            .text(function(d, i) {
+                return sortedWords[i];
+            });
- some changes on the replot() function
- missing some of the stuff for the word cloud
- all of the transitions on the bars use y position rather than y in the transform translate
    - the transitions updates seem new....

4. Teletherm: https://github.com/andyreagan/teletherm.org/blob/master/js/hedotools.shifter.js
~/websites/teletherm.org/js/hedotools.shifter.js
- same version as sentiment comparison paper

5, labMTsimple:
~/tools/python/labMTsimple/labMTsimple/static/hedotools.shifter.js
- d3.urllib instead of hedotools.urllib
- no getfigure()
- missing a few new functions (word list, word paragraph)

6. Sentiment comparison paper:
~/projects/2015/03-sentiment-comparison/figures/twitter/twitter-shifts/static/hedotools.shifter.js
(and many other in this paper, but they should all be the same version)
- same version as mathcounts below

7. Mathcounts
~/projects/2015/02-mathcounts/js/hedotools.shifter.js
- same version as in the emotional arc installation, an older one (I think)

8. AMA, many versions. Take just the latest one:
~/projects/2019/ama/ama-web/v15/js/hedotools.shifter.v4.js
- no changes

9. IBM Talk:
~/projects/2016/04-ibm-watson-talk/reveal/js/hedotools.shifter.js
- identical!

10: Emotional arc installation:
~/projects/2016/04-emotional-arc-installation/static/js/hedotools.shifter.js
- TONS of changes. I think that this code is just older. Missing lots of bits
- uses just transform to move bars instead of y and transform
- remove viz_type URL usage
- d3.urllib instead of hedotools.urllib
- remove getfigure()
- return hedotools.shifter instead of return that in a few places
- font size hardcoded
- widths changed
- no raw words
- x and y label functions added:
+    var xlabel_text = "Per word average happiness shift";
+    var _xlabel_text = function(_) {
+       if (!arguments.length) return xlabel_text;
+       xlabel_text = _;
+       return hedotools.shifter;
+    }
+
+    var ylabel_text = "Word Rank";
+    var _ylabel_text = function(_) {
+       if (!arguments.length) return ylabel_text;
+       ylabel_text = _;
+       return hedotools.shifter;
+    }
- hm, we already have them, though. they just moved.


11. Wordshifterator:
~/projects/2016/05-wordshifterator/app/js/lib/hedotools.shifter.js
~/projects/2016/05-wordshifterator/app/js/src/hedotools.shifter.js
- d3.urllib instead of hedotools.urllib
- remove top level getfigure()
- remove top level setBgcolor(), set manually to white in a few places

12. UAE
https://github.com/andyreagan/quokkalabs-UAE/blob/master/js/hedotools.v4.js
Changes:
- attribution to Quokka Labs
- setBgcolor moved outside of plot() function to global
