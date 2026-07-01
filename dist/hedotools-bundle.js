// @andyreagan/d3-shifterator v7.0.1 Copyright 2026 Andy Reagan
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
    typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.shifterator = {}, global.d3));
})(this, (function (exports, d3) { 'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var d3__namespace = /*#__PURE__*/_interopNamespaceDefault(d3);

    // begin with some helper functions
    // http://stackoverflow.com/a/1026087/3780153

    const intStr0 = ["zero","one","two","three","four","five","six","seven","eight","nine","then"];
    const intStr = intStr0.slice(1,100);

    // Array.prototype.findIndexClosest = function(x) {
    //     var result = 0;
    //     var distance = Math.abs(x-this[0]);
    //     for (var i=1; i<this.length; i++) {
    //         if (distance > Math.abs(x-this[i])) {
    //             result = i;
    //             distance = Math.abs(x-this[i]);
    //         }
    //     }
    //     return result;
    // }

    // this works really well, but it's deadly slow (working max 5 elements)
    // and it's coupled to jquery
    // http://stackoverflow.com/a/5047712/3780153
    // string.prototype.width = function(font) {
    //     var f = font || '12px arial',
    //     o = $('<div>' + this + '</div>')
    // 	.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
    // 	.appendto($('body')),
    //     w = o.width();
    //     o.remove();
    //     return w;
    // }
    // dummy while I search for a replacement that doesn't need jquery
    // export var stringwidth = function(string, font) {
    //     return 4 * string.length;
    // }
    // here it is, from the same stack overflow question as the first one
    var stringwidth = function(pText, pFont) {
        const lDiv = document.createElement('div');

        document.body.appendChild(lDiv);

        lDiv.style.font = pFont;
        lDiv.style.position = "absolute";
        lDiv.style.left = -1e3;
        lDiv.style.top = -1e3;

        lDiv.textContent = pText;

        const lResult = {
            width: lDiv.clientWidth,
            height: lDiv.clientHeight
        };

        document.body.removeChild(lDiv);

        return lResult.width;
    };

    // string.prototype.safe = function() {
    //     var tmp = this.split("/")
    //     tmp[tmp.length-1] = escape(tmp[tmp.length-1])
    //     return tmp.join("/");
    // }

    var splitstring = function(string_to_split, max_width, font) {
        if (stringwidth(string_to_split, font) < max_width) {
            return string_to_split;
        } else {
            var string_to_split_words = string_to_split.split(" ");
            // chop words off until it's long enough
            // this is better if we know that they're
            // not going to be way too long
            // right now a max of two lines

            // a more general approach would be to march forward...
            // but this could be a lot of .width() calculations
            // really need to keep those at a min
            var numi = 0;
            while (numi < 10) {
                if (stringwidth(string_to_split_words.slice(0, string_to_split_words.length - numi).join(" "), font) < max_width) {
                    return [
                        string_to_split_words.slice(
                            0,
                            string_to_split_words.length - numi
                        ).join(" "),
                        string_to_split_words.slice(
                            string_to_split_words.length - numi,
                            string_to_split_words.length
                        ).join(" ")
                    ];
                }
                numi++;
            }
            console.log("WARNING: hit max iterations splitting a string to be under max_width");
            console.log("string is: " + string_to_split);
            console.log("max_width is: " + max_width);
            return [string_to_split_words.slice(0, string_to_split_words.length - numi).join(" "), string_to_split_words.slice(string_to_split_words.length - numi, string_to_split_words.length).join(" ")];
        }
    };

    var splitarray = function(array_to_split, max_width, font_spec) {
        return array_to_split.map(d => splitstring(d, max_width, font_spec))
    };

    const urllib = {
        encoder: function() {
            var varname = "tmp";
            var varval = [];
            var show = true;
            //var that = this;

            function urllib(d) {
                // nothing yet
                //console.log(this);
                //console.log(that);
                return {
                    current: varval,
                };
            }

            function parseurl() {
                var GET = {};
                var query = window.location.search.substring(1).split("&");
                // break down the url
                for (var i = 0, max = query.length; i < max; i++) {
                    if (query[i] === "") // check for trailing & with no param
                        continue;
                    var param = query[i].split("=");
                    GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
                }

                var baseUrl = window.location.origin + window.location.pathname;
                var tmpStr = "";
                if (typeof varval == 'string' || varval instanceof String) {
                    tmpStr += varval;
                } else {
                    tmpStr += "[" + varval[0];
                    for (var i = 1; i < varval.length; i++) {
                        tmpStr += "," + varval[i];
                    }
                    tmpStr += "]";
                }
                GET[varname] = tmpStr;

                var urlString = "";
                for (var key in GET) {
                    if (GET.hasOwnProperty(key)) {
                        if (varname === key) {
                            // console.log("found that variable");
                            // console.log(show);
                            if (show) {
                                urlString += key + "=" + GET[key] + "&";
                            }
                        } else {
                            urlString += key + "=" + GET[key] + "&";
                        }
                    }
                }

                urlString = urlString.substring(0, urlString.length - 1);

                // only add to url if there is stuff
                if (urlString.length > 0) {
                    var newDataUrl = baseUrl + "?" + urlString;
                } else {
                    var newDataUrl = baseUrl;
                }

                window.history.replaceState("object or string", "title", newDataUrl);

                return urllib;
            }

            urllib.varname = function(_) {
                if (!arguments.length) return varname;
                varname = _;
                return urllib;
            };

            urllib.destroy = function() {
                show = false;
                parseurl();
                show = true;
                // return urllib;
            };

            urllib.varval = function(_) {
                if (!arguments.length) return varval;
                varval = _;
                return parseurl();
            };

            return urllib;
        },
        decoder: function() {
            var varname = "tmp";
            var varresult = [];
            var defvalue = [];

            function urllib(d) {
                parseurl();
                return {
                    current: varresult,
                    cached: defvalue
                };
            }

            function parseurl() {
                var GET = {};
                var query = window.location.search.substring(1).split("&");
                for (var i = 0, max = query.length; i < max; i++) {
                    if (query[i] === "") // check for trailing & with no param
                        continue;
                    var param = query[i].split("=");
                    GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
                }

                if (varname in GET) {
                    if (GET[varname].length > 0 && GET[varname][0] === "[") {
                        if (GET[varname][GET[varname].length - 1] === "]") {
                            var tmpArray = GET[varname].substring(1, GET[varname].length - 1).split(',');
                        } else {
                            var tmpArray = GET[varname].substring(1, GET[varname].length).split(',');
                        }
                        varresult = tmpArray;
                        defvalue = tmpArray;
                    } else {
                        varresult = GET[varname];
                        defvalue = GET[varname];
                    }
                } else {
                    // if there is nothing in the url...we'll let the value
                    // live. this next line would kill the value
                    varresult = "";
                }
                return urllib;
            }

            urllib.varname = function(_) {
                if (!arguments.length) return varname;
                varname = _;
                return parseurl();
            };

            urllib.varresult = function(_) {
                if (!arguments.length) return varresult;
                varresult = _;
                defvalue = _;
                return urllib;
            };

            return urllib;
        }
    };

    // d3 v6+ no longer passes the element index to .on() event listeners (the
    // signature changed to (event, datum)). Recover the index from the node's
    // position among same-class siblings, scoped to this plot instance
    // (node.parentNode) so multiple shifts on one page don't collide.
    function indexOfClass(node, selector) {
        return Array.prototype.indexOf.call(node.parentNode.querySelectorAll(selector), node);
    }

    var functionThatDependsOnD3 = function() {
        console.log(d3__namespace.version);
        return d3__namespace.version;
    };

    var shifterator = function() {

        var debug = false;
        var debugon = function() {
            debug = true;
            return this;
        };
        var urloff = function() {
            return this;
        };

        // will need a figure.
        // this needs to be set by setfigure() before plotting
        var figure;

        const shiftselencoder = urllib.encoder().varname("wordtypes");
        const shiftseldecoder = urllib.decoder().varname("wordtypes").varresult("none");
        // initialize that we have't selected a shift
        var shiftTypeSelect = false;
        var shiftType = -1;

        // put the status of the viz into the bar
        const viz_type = urllib.encoder().varname("viz");
        const viz_type_decoder = urllib.decoder().varname("viz").varresult("wordshift");

        var getfigure = function() {
            return figure;
        };
        var setselection = function(_) {
            var that = this;
            // wrap another relative parent div in there, for the overlay button to pad off of
            figure = _.append("div")
                .attr("class", "outwrapper")
                .style("position", "relative");
            if (!widthsetexplicitly) {
                grabwidth();
            }
            return that;
        };
        var setfigure = function(_) {
            // pass in a string that can be selected from the DOM
            // e.g., if you webpage has
            //     <div id="putwordshifthere"></div>
            // you can call
            //     shifterator().setfigure("#putwordshifthere")
            var that = this;
            debug ? console.log("setting figure for wordshift") : null;
            setselection(d3__namespace.select(_));
            return that;
        };

        var show_x_axis_bool = false;
        var show_x_axis = function(_) {
            var that = this;
            if (!arguments.length) return show_x_axis_bool;
            show_x_axis_bool = _;
            // give a litter extra space for it
            axeslabelmargin.bottom = axeslabelmargin.bottom + 10;
            return that;
        };

        // set the ones we can
        // since the height is fixed, do all that
        // but just initialize the width-related variables

        // full width and height. we'll draw the outer svg this big
        var fullwidth = 550;
        var fullheight = 650; // 650; // make sure to change num words too

        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        // the width and height that we're going to use
        var boxwidth = fullwidth - margin.left - margin.right;
        var boxheight = fullheight - margin.top - margin.bottom;

        // margin inside
        var axeslabelmargin = {
            top: 0,
            right: 3,
            bottom: 25,
            left: 23
        };

        // inner width and height
        // used for the axes
        var figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
        var figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom;

        // individual bar height, and number of words
        // need to be tuned to the height of the plot
        var iBarH = 11;
        var numWords = 37;
        // 37 with height 650 // 23 with height 500 // 28 with height 550
        // I should be able to compute this?

        // max length of words to plot
        var maxChars = 20;

        // all inside the axes
        var yHeight = (7 + 17 * 3 + 14 + 5 - 13); // 101
        // where to draw the line below the summary bars
        var barHeight = (7 + 17 * 3 + 15 - 13); // 95
        var figcenter = figwidth / 2;

        // pull the width, set the height fixed
        var grabwidth = function() {
            debug ? console.log("setting width from figure") : null;
            debug ? console.log(parseInt(figure.style("width"))) : null;
            // use d3.min to set a max width of fullwidth
            fullwidth = d3__namespace.min([parseInt(figure.style("width")), fullwidth]);
            boxwidth = fullwidth - margin.left - margin.right;
            figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
            figcenter = figwidth / 2;
        };

        var widthsetexplicitly = false;
        var setWidth = function(_) {
            var that = this;
            if (!arguments.length) return fullwidth;
            widthsetexplicitly = true;
            fullwidth = _;
            boxwidth = fullwidth - margin.left - margin.right;
            figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
            figcenter = figwidth / 2;
            return that;
        };

        // pull the width, set the height fixed
        var setHeight = function(_) {
            var that = this;
            if (!arguments.length) return fullheight;
            fullheight = _;
            boxheight = fullheight - margin.top - margin.bottom;
            figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom;
            return that;
        };

        // will be set by setdata() or shift() functions
        var sortedMag;
        var sortedType;
        var sortedWords;
        var sortedWordsRaw;
        var sortedWordsEn;
        var sumTypes;
        var refH;
        var compH;

        var _sortedMag = function(_) {
            var that = this;
            if (!arguments.length) return sortedMag;
            sortedMag = _;
            return that;
        };
        var _sortedType = function(_) {
            var that = this;
            if (!arguments.length) return sortedType;
            sortedType = _;
            return that;
        };
        var _sortedWords = function(_) {
            var that = this;
            if (!arguments.length) return sortedWords;
            sortedWords = _;
            return that;
        };
        var _sortedWordsRaw = function(_) {
            var that = this;
            if (!arguments.length) return sortedWordsRaw;
            sortedWordsRaw = _;
            return that;
        };

        var xlabel_text = "Per word average happiness shift";
        var _xlabel_text = function(_) {
            var that = this;
            if (!arguments.length) return xlabel_text;
            xlabel_text = _;
            return that;
        };

        var ylabel_text = "Word Rank";
        var _ylabel_text = function(_) {
            var that = this;
            if (!arguments.length) return ylabel_text;
            ylabel_text = _;
            return that;
        };
        var _refH = function(_) {
            var that = this;
            if (!arguments.length) return refH;
            refH = _;
            return that;
        };
        var _compH = function(_) {
            var that = this;
            if (!arguments.length) return compH;
            compH = _;
            return that;
        };

        var reset = true;
        var _reset = function(_) {
            var that = this;
            if (!arguments.length) return reset;
            reset = _;
            return that;
        };

        var get_word_index = function(w) {
            var ind = -1;
            for (var i = 0; i < words.length; i++) {
                if (w === words[i]) {
                    ind = i;
                    break;
                }
            }
            return ind;
        };

        // let's make this just toggle the state
        // you can force it to turn on by setting the _reset function
        // to set the reset bool to be false, then calling toggle
        var resetbuttontoggle = function() {
            var that = this;
            reset = !reset;
            resetButton(reset);
            if (reset) {
                figure.select("g.help").style("visibility", "visible");
                figure.selectAll("text.credit").style("visibility", "visible");
            } else {
                figure.select("g.help").style("visibility", "hidden");
                figure.selectAll("text.credit").style("visibility", "hidden");
            }
            return that;
        };

        var setdata = function(a, b, c, d, e, f) {
            var that = this;
            debug ? console.log("setting data") : null;
            sortedMag = a;
            sortedType = b;
            sortedWords = c;
            sortedWordsRaw = c;
            sumTypes = d;
            refH = e;
            compH = f;
            return that;
        };

        var numBoldLines = 1;
        var setTextBold = function(_) {
            var that = this;
            if (!arguments.length) return numBoldLines;
            numBoldLines = _;
            return that;
        };

        // only support up to 5 lines....
        var colorArray = ["#202020", "#D8D8D8", "#D8D8D8", "#D8D8D8", "#D8D8D8"];
        var topFontSizeArray = [16, 12, 12, 12, 12];
        // var topFontSizeArray = [20,16,16,16,16];

        var setTextColors = function(_) {
            var that = this;
            if (!arguments.length) return colorArray;
            colorArray = _;
            return that;
        };

        var setTopTextSizes = function(_) {
            var that = this;
            if (!arguments.length) return topFontSizeArray;
            topFontSizeArray = _;
            return that;
        };

        var comparisonText = [""];

        var setText = function(_) {
            var that = this;
            if (!arguments.length) return _;
            comparisonText = _;
            return that;
        };

        // end of the top text stuff                                                        //
        // ******************************************************************************** //

        var numwordstoplot = 200;

        var refF;
        var compF;
        var lens;
        var complens;
        var stoprange = [4, 6];
        var words;
        var words_en;
        var translate = false;

        var _stoprange = function(_) {
            var that = this;
            if (!arguments.length) return stoprange;
            stoprange = _;
            return that;
        };

        var _refF = function(_) {
            var that = this;
            if (!arguments.length) return refF;
            refF = _;
            // what better place to check for this
            // some datasets have less than 200 words
            numwordstoplot = d3__namespace.min([numwordstoplot, refF.length]);
            return that;
        };

        var _compF = function(_) {
            var that = this;
            if (!arguments.length) return compF;
            compF = _;
            numwordstoplot = d3__namespace.min([numwordstoplot, compF.length]);
            return that;
        };

        var _lens = function(_) {
            var that = this;
            if (!arguments.length) return lens;
            lens = _;
            numwordstoplot = d3__namespace.min([numwordstoplot, lens.length]);
            return that;
        };

        var _complens = function(_) {
            var that = this;
            if (!arguments.length) return complens;
            complens = _;
            return that;
        };

        var _words = function(_) {
            var that = this;
            if (!arguments.length) return words;
            words = _;
            numwordstoplot = d3__namespace.min([numwordstoplot, words.length]);
            return that;
        };

        var _words_en = function(_) {
            var that = this;
            if (!arguments.length) return words_en;
            words_en = _;
            translate = true;
            return that;
        };

        var ignoreWords = ["nigga", "niggas", "niggaz", "nigger"];

        var ignore = function(_) {
            var that = this;
            if (!arguments.length) return ignoreWords;
            // refresh the list each time
            ignoreWords = ["nigga", "niggas", "niggaz", "nigger"];
            ignoreWords = ignoreWords.concat(_);
            debug ? console.log(_) : null;
            debug ? console.log(ignoreWords) : null;
            return that;
        };

        var stop = function() {
            var that = this;
            // first check if all the loads are done
            // WARNING
            // could not get this loop to stop!
            // even when the other variables are set
            // while (loadsremaining > 0) { debug ? console.log("waiting") : null; };
            for (var i = 0; i < lens.length; i++) {
                var include = true;
                // check if in removed word list
                for (var k = 0; k < ignoreWords.length; k++) {
                    if (ignoreWords[k] == words[i]) {
                        include = false;
                    }
                }
                // check if underneath lens cover
                if (lens[i] > stoprange[0] && lens[i] < stoprange[1]) {
                    include = false;
                }
                // include it, or set to 0
                if (!include) {
                    refF[i] = 0;
                    compF[i] = 0;
                }
            }
            return that;
        };

        // stop an individual vector
        var istopper = function(fvec) {
            for (var i = 0; i < lens.length; i++) {
                var include = true;
                // check if in removed word list
                for (var k = 0; k < ignoreWords.length; k++) {
                    if (ignoreWords[k] == words[i]) {
                        include = false;
                    }
                }
                // check if underneath lens cover
                if (lens[i] > stoprange[0] && lens[i] < stoprange[1]) {
                    include = false;
                }
                // include it, or set to 0
                if (!include) {
                    fvec[i] = 0;
                }
            }
            return fvec;
        };

        var concatter = function() {
            {
                // new method, with numbers prefixed
                // log everything
                debug ? console.log(sortedMag) : null;
                debug ? console.log(sortedWords) : null;
                debug ? console.log(sortedWordsEn) : null;
                debug ? console.log(sortedType) : null;
                debug ? console.log(refF) : null;
                debug ? console.log(compF) : null;
                debug ? console.log(lens) : null;
                debug ? console.log(words) : null;
                sortedWords = sortedWords.map(function(d, i) {
                    if (sortedType[i] == 0) {
                        return ((i + 1) + ". ").concat(d.concat("-\u2193")); // down // increase in happs
                    } else if (sortedType[i] == 1) {
                        return ((i + 1) + ". ").concat(d.concat("+\u2193")); // decrease in happs
                    } else if (sortedType[i] == 2) {
                        return ((i + 1) + ". ").concat(d.concat("-\u2191")); // up
                    } else {
                        return ((i + 1) + ". ").concat(d.concat("+\u2191"));
                    }
                });
                if (translate) {
                    sortedWordsEn = sortedWordsEn.map(function(d, i) {
                        if (sortedType[i] == 0) {
                            return ((i + 1) + ". ").concat(d.concat("-\u2193"));
                        } else if (sortedType[i] == 1) {
                            return ((i + 1) + ". ").concat(d.concat("+\u2193"));
                        } else if (sortedType[i] == 2) {
                            return ((i + 1) + ". ").concat(d.concat("-\u2191"));
                        } else {
                            return ((i + 1) + ". ").concat(d.concat("+\u2191"));
                        }
                    });
                }
            }
        };

        var shift = function(a, b, c, d) {
            var that = this;
            refF = a;
            compF = b;
            lens = c;
            words = d;
            shifter();
            return that;
        };

        var sortedMagFull;
        var sortedTypeFull;
        var distflag = false;
        var plotdist = function(_) {
            var that = this;
            if (!arguments.length) return distflag;
            distflag = _;
            return that;
        };

        var shiftMag;
        var shiftType;

        var _shiftMag = function(_) {
            var that = this;
            if (!arguments.length) return shiftMag;
            shiftMag = _;
            return that;
        };

        var _shiftType = function(_) {
            var that = this;
            if (!arguments.length) return shiftType;
            shiftType = _;
            return that;
        };

        var shifter = function() {
            debug ? console.log("running the shifter") : null;
            var that = this;
            /* shift two frequency vectors
               -assume they've been zero-ed for stop words
               -lens is of full length
               -words is a list of utf8 strings

               return an object with the sorted quantities for plotting the shift
            */

            //normalize frequencies
            var Nref = 0.0;
            var Ncomp = 0.0;
            debug ? console.log(refF, compF, words, lens) : null;
            var lensLength = d3__namespace.min([refF.length, compF.length, words.length, lens.length]);
            for (var i = 0; i < lensLength; i++) {
                Nref += parseFloat(refF[i]);
                Ncomp += parseFloat(compF[i]);
            }
            debug ? console.log(Nref, Ncomp) : null;

            // for (var i=0; i<refF.length; i++) {
            //     refF[i] = parseFloat(refF[i])/Nref;
            //     compF[i] = parseFloat(compF[i])/Ncomp;
            // }

            // compute reference happiness
            refH = 0.0;
            for (var i = 0; i < lensLength; i++) {
                refH += refF[i] * parseFloat(lens[i]);
            }
            // normalize at the end to minimize floating point errors
            refH = refH / Nref;
            debug ? console.log(refH) : null;

            // compute reference variance
            // var refV = 0.0;
            // for (var i=0; i<refF.length; i++) {
            //     refV += refF[i]*Math.pow(parseFloat(lens[i])-refH,2);
            // }
            // refV = refV/Nref;
            // debug ? console.log(refV) : null;

            // compute comparison happiness
            compH = 0.0;
            for (var i = 0; i < lensLength; i++) {
                compH += compF[i] * parseFloat(lens[i]);
            }
            compH = compH / Ncomp;
            debug ? console.log(compH) : null;

            // do the shifting
            shiftMag = Array(lensLength);
            shiftType = Array(lensLength);
            var freqDiff = 0.0;
            for (var i = 0; i < lensLength; i++) {
                freqDiff = compF[i] / Ncomp - refF[i] / Nref;
                shiftMag[i] = (parseFloat(lens[i]) - refH) * freqDiff;
                if (freqDiff > 0) {
                    shiftType[i] = 2;
                } else {
                    shiftType[i] = 0;
                }
                if (parseFloat(lens[i]) > refH) {
                    shiftType[i] += 1;
                }
            }
            debug ? console.log(shiftMag, shiftType) : null;

            // +2 for frequency up
            // +1 for happier
            // =>
            // 0 sad, down
            // 1 happy, down
            // 2 sad, up
            // 3 happy, up

            // do the sorting
            var indices = Array(lensLength);
            for (var i = 0; i < lensLength; i++) {
                indices[i] = i;
            }
            indices.sort(function(a, b) {
                return Math.abs(shiftMag[a]) < Math.abs(shiftMag[b]) ? 1 : Math.abs(shiftMag[a]) > Math.abs(shiftMag[b]) ? -1 : 0;
            });

            sortedMag = Array(numwordstoplot);
            sortedType = Array(numwordstoplot);
            sortedWords = Array(numwordstoplot);

            debug ? console.log(numwordstoplot) : null;
            debug ? console.log(indices) : null;

            for (var i = 0; i < numwordstoplot; i++) {
                sortedMag[i] = shiftMag[indices[i]];
                sortedType[i] = shiftType[indices[i]];
                var tmpword = words[indices[i]];
                // add 1 to maxChars, because I'll add the ellipsis
                if (tmpword.length > maxChars + 2) {
                    var shorterword = tmpword.slice(0, maxChars);
                    // check that the last char isn't a space (if it is, delete it)
                    if (shorterword[shorterword.length - 1] === " ") {
                        sortedWords[i] = shorterword.slice(0, shorterword.length - 1) + "\u2026";
                    } else {
                        sortedWords[i] = shorterword + "\u2026";
                    }
                } else {
                    sortedWords[i] = tmpword;
                }
            }
            debug ? console.log(sortedMag, sortedType, sortedWords) : null;

            if (distflag) {
                // declare some new variables
                sortedMagFull = Array(lensLength);
                sortedTypeFull = Array(lensLength);
                for (var i = 0; i < lensLength; i++) {
                    sortedMagFull[i] = shiftMag[indices[i]];
                    sortedTypeFull[i] = shiftType[indices[i]];
                }
            }

            // compute the sum of contributions of different types
            sumTypes = [0.0, 0.0, 0.0, 0.0];
            for (var i = 0; i < lensLength; i++) {
                sumTypes[shiftType[i]] += shiftMag[i];
            }

            // slice them
            // sortedMag = sortedMag.slice(0,numwordstoplot);
            // sortedWords = sortedWords.slice(0,numwordstoplot);
            // sortedType = sortedType.slice(0,numwordstoplot);

            if (translate) {
                sortedWordsEn = Array(numwordstoplot);
                for (var i = 0; i < numwordstoplot; i++) {
                    sortedWordsEn[i] = words_en[indices[i]];
                }
            }

            // // return as an object
            // return {
            //     sortedMag: sortedMag,
            //     sortedType: sortedType,
            //     sortedWords: sortedWords,
            //     sumTypes: sumTypes,
            //     refH: refH,
            //     compH: compH,
            // };

            sortedWordsRaw = sortedWords;
            concatter();

            // allow chaining here too
            return that;
        };


        var nbins = 100;
        var dist;
        var cdist;
        var ntypes = 4;
        var nwords;
        var computedistributions = function() {
            var that = this;
            // bin the distribution of words into a distribution
            // and cumulative
            // there are four types of contributions here (the way
            // the sum has been broken down), so do the distribution
            // for the total, and each of the four bins

            // nwords = sortedMagFull.length;
            // nwords = 2000;
            var a = 1;
            nwords = -1;
            while (a > Math.pow(10, -6)) {
                nwords++;
                a = Math.abs(sortedMagFull[nwords]);
            }
            debug ? console.log(nwords) : null;

            dist = Array(nbins);
            cdist = Array(nbins);

            // compute the size of each bin
            // should be a fast way to do this
            // when it doesn't round evenly
            var binsize = Math.floor(nwords / nbins);
            debug ? console.log(binsize) : null;

            // loop over each bin, initialize it to zero
            // then add each of the types to it
            for (var i = 0; i < nbins; i++) {
                dist[i] = Array(ntypes + 1);
                cdist[i] = Array(ntypes + 1);
                for (var j = 0; j < ntypes + 1; j++) {
                    dist[i][j] = 0;
                    cdist[i][j] = 0;
                }
                // fast, with the sum
                debug ? console.log(i*binsize) : null;
                debug ? console.log((i+1)*binsize) : null;
                dist[i][4] = d3__namespace.sum(sortedMagFull.slice(i * binsize, (i + 1) * binsize));
                // slower, by type
                for (var j = i * binsize; j < (i + 1) * binsize; j++) {
                    dist[i][sortedTypeFull[j]] += sortedMagFull[j];
                }
            }

            // now get the cumulative
            for (var j = 0; j < ntypes + 1; j++) {
                cdist[0][j] = dist[0][j];
            }
            for (var i = 1; i < nbins; i++) {
                for (var j = 0; j < ntypes + 1; j++) {
                    cdist[i][j] = cdist[i - 1][j] + dist[i][j];
                }
            }

            debug ? console.log(dist) : null;
            debug ? console.log(cdist) : null;
            debug ? console.log(cdist[cdist.length-1]) : null;
            return that;
        };

        // declare a boat load of private variables
        // to be accessed by the other methods
        var canvas;
        var maxWidth;
        var x;
        var y;
        var topScale;
        var bgrect;
        var sepline;
        var zoom;
        var axes;
        var fontString = "Latex default, serif";
        var _fontString = function(_) {
            var that = this;
            if (!arguments.length) return fontString;
            fontString = _;
            return that;
        };
        // the inspector computed width of ∑+↓ rendering in latex default (cmr10)
        var sumTextWidth = 34.1562;
        // these are set explicitly on the elements
        var bigshifttextsize = 12;
        var xaxisfontsize = 12;
        var xylabelfontsize = 16;
        var wordfontsize = 12;
        var distlabeltext = 8;
        var creditfontsize = 8;
        var resetfontsize = 12;
        // [16,10,20,10,8,8,13];
        var setFontSizes = function(_) {
            var that = this;
            if (!arguments.length) return [bigshifttextsize, xaxisfontsize, xylabelfontsize, wordfontsize, distlabeltext, creditfontsize, resetfontsize];
            bigshifttextsize = _[0];
            xaxisfontsize = _[1];
            xylabelfontsize = _[2];
            wordfontsize = _[3];
            distlabeltext = _[4];
            creditfontsize = _[5];
            resetfontsize = _[6];
            return that;
        };
        var typeClass;
        var colorClass;
        var shifttext;
        var flipVector;
        var maxShiftSum;
        var toptext;
        var toptextheight;
        var credit;
        // var credit_text_array = ["visualization by","@andyreagan","word shifts by","@hedonometer"]
        var credit_text_array = ["visualization by", "@andyreagan"];
        var _credit_text_array = function(_) {
            var that = this;
            if (!arguments.length) {
                return credit_text_array;
            } else {
                credit_text_array = _;
                return that;
            }
        };
        var xAxis;
        var distgroup;
        var my_shift_id = "shiftsvg";
        var _my_shift_id = function(_) {
            var that = this;
            if (!arguments.length) return my_shift_id;
            my_shift_id = _;
            return that;
        };



        // var bgcolor = "rgba(255,248,220,.2)";
        var bgcolor = "white";
        var setBgcolor = function(_) {
            var that = this;
            if (!arguments.length) return bgcolor;
            bgcolor = _;
            return that;
        };

        var logowidth = 0;

        var bottombgrect;
        var topbgrect2;
        var xpadding;
        var create_xAxis;

        var plot = function() {
            var that = this;
            /* plot the shift

               -take a d3 selection, and draw the shift SVG on it
               -requires sorted vectors of the shift magnitude, type and word
               for each word

            */
            debug ? console.log("plotting shift") : null;

            // first things first, plot the text on top
            // if there wasn't any text passed, make it
            if (comparisonText[0].length < 1) {
                if (compH >= refH) {
                    var happysad = "happier";
                } else {
                    var happysad = "less happy";
                }

                debug ? console.log("generating text for wordshift") : null;
                comparisonText = splitarray(
                    ["Reference happiness: " + refH.toFixed(2), "Comparison happiness: " + compH.toFixed(2), "Why comparison is " + happysad + " than reference:"],
                    boxwidth - 10 - logowidth,
                    topFontSizeArray[topFontSizeArray.length - 1] + "px  " + fontString
                );

                debug ? console.log(comparisonText) : null;
            } else {
                {
                    comparisonText = splitarray(
                        comparisonText,
                        boxwidth - 10 - logowidth,
                        topFontSizeArray[topFontSizeArray.length - 1] + "px  " + fontString
                    );
                }
                debug ? console.log(comparisonText) : null;
            }

            // this would put the text above the svg, in the figure div
            // figure.selectAll("p")
            //     .remove();
            // figure.selectAll("p")
            //     .data(comparisonText)
            //     .enter()
            //     .insert("p","svg")
            //     .attr("class","shifttitle")
            //     .html(function(d) { return d; });

            debug ? console.log("make a new svg") : null;
            figure.selectAll("svg").remove();
            canvas = figure.append("svg")
                .attr("id", my_shift_id)
                .attr("width", function() {
                    return boxwidth;
                })
                .attr("height", function() {
                    return boxheight;
                });
            debug ? console.log(canvas) : null;

            // this one will be white, and behind EVERYTHING
            canvas.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", boxwidth)
                .attr("height", boxheight)
                .attr("class", "bgbg")
                .attr("fill", bgcolor);

            toptextheight = comparisonText.length * 17 + 13;
            debug ? console.log(toptextheight) : null;

            // reset this
            figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom - toptextheight;
            debug ? console.log(figheight) : null;
            debug ? console.log(yHeight) : null;

            // take the longest of the top five words
            debug ? console.log("appending to sorted words") : null;
            debug ? console.log(sortedWords) : null;

            maxWidth = d3__namespace.max(sortedWords.slice(0, 7).map(function(d) {
                return stringwidth(d, wordfontsize + "px  " + fontString);
            }));

            // a little extra padding for the words
            xpadding = 10;
            // linear scale function
            x = d3__namespace.scaleLinear()
                .domain([-Math.abs(sortedMag[0]), Math.abs(sortedMag[0])])
                .range([maxWidth + xpadding, figwidth - maxWidth - xpadding]);

            // linear scale function
            y = d3__namespace.scaleLinear()
                .domain([numWords + 1, 1])
                .range([figheight + 2, yHeight]);

            // zoom object for the axes
            zoom = d3__namespace.zoom()
                // .y(y) // pass linear scale function
                // .translate([10,10])
                // .scaleExtent([0,0])
                // .translateExtent([[Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY],[Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY]])
                .translateExtent([
                    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
                    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
                ])
                .on("zoom", zoomed);

            // create the axes themselves
            axes = canvas
                // not using the "svg inside svg" approach again
                // .append("svg")
                // .attr("width", figwidth)
                // .attr("height", figheight)
                // .attr("class", "shiftcanvas")
                .append("g")
                .attr("transform", "translate(" + (axeslabelmargin.left) + "," + (axeslabelmargin.top + toptextheight) + ")")
                .attr("width", figwidth)
                .attr("height", figheight)
                .attr("class", "main");
            debug ? console.log(axes) : null;

            // axes.call(zoom);
            // axes.call(drag);
            // var dispatch = d3.dispatch("wheel");
            axes.on("wheel.zoom", zoomed);

            // // don't need these
            // axes.on("wheel.zoom", null);
            // axes.on("mousewheel.zoom", null);
            // // can re-register them...
            // // axes.on("wheel",function(d) { debug ? console.log(d3.event) : null; });
            // // axes.on("mousewheel",function(d) { debug ? console.log(d3.event) : null; });
            // // now use them to translate (instead of zoom)
            // axes.on("wheel",function(d) { d3.event.preventDefault(); zoom.translate([0,zoom.translate()[1]+d3.event.wheelDeltaY/2]); zoom.event(axes); });
            // axes.on("mousewheel",function(d) { d3.event.preventDefault(); zoom.translate([0,zoom.translate()[1]+d3.event.wheelDeltaY/2]); zoom.event(axes); });

            // create the axes background
            bgrect = axes.append("rect")
                .attr("x", 0)
                .attr("y", 1)
                .attr("width", figwidth - 2)
                .attr("height", figheight - 2)
                .attr("class", "bg")
                .style("stroke-width", "0.5")
                .style("stroke", "rgb(0,0,0)")
                .style("fill", "#FCFCFC")
                .style("opacity", "0.96");

            if (show_x_axis_bool) {
                // axes creation functions
                create_xAxis = function() {
                    return d3__namespace.axisBottom()
                        .ticks(4)
                        .scale(x);
                };

                xAxis = create_xAxis();
                    // .innerTickSize(3)
                    // .outerTickSize(0);

                canvas.append("g")
                    .attr("class", "x axis ")
                    .attr("font-size", xaxisfontsize)
                    .attr("transform", "translate(" + (axeslabelmargin.left) + "," + (boxheight - axeslabelmargin.bottom) + ")")
                    // .attr("transform", "translate(0," + (figheight) + ")")
                    .call(xAxis);

                canvas.selectAll(".tick line").style(
                    "stroke", "black"
                );
            }

            // figure.selectAll("p.sumtext.ref")
            //     .data([refH,])
            //     .html(function(d,i) {
            //         if (i===0) {
            //         return "Reference: happiness " + (d.toFixed(3));
            //         }
            //     });

            // figure.selectAll("p.sumtext.comp")
            //     .data([compH,])
            //     .html(function(d,i) {
            //         if (i===0) {
            //         return "Comparison: happiness " + (d.toFixed(3));
            //         }
            //     });

            // addthis_share.passthrough.twitter.text = "Why "+allData[shiftComp].name+" was "+happysad+" than "+allData[shiftRef].name+" in "+timeseldecoder().cached;

            // addthis_share.title = "Why "+allData[shiftComp].name+" was "+happysad+" than "+allData[shiftRef].name+" in "+timeseldecoder().cached;

            // addthis_share.url = document.URL;

            // d3.select("[id=fbtitle]").attr("content","Hedonometer Maps: Andy has been here");

            typeClass = ["negdown", "posdown", "negup", "posup"];
            colorClass = ["#b3b3ff", "#ffffb3", "#4c4cff", "#ffff4c", "#272727"];

            axes.selectAll("rect.shiftrect")
                .data(sortedMag)
                .enter()
                .append("rect")
                .attr("class", function(d, i) {
                    return "shiftrect " + intStr0[sortedType[i]] + " " + typeClass[sortedType[i]];
                })
                // .attr("x", function(d,i) {
                //     if (d>0) { return figcenter; }
                //     else { return x(d)}
                // })
                // .attr("y", function(d,i) { return y(i+1); },
                .attr("id", function(d, i) {
                    return "shiftrect" + i;
                })
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, i) {
                    if (d > 0) {
                        return "translate(" + figcenter + "," + y(i + 1) + ")";
                    } else {
                        return "translate(" + x(d) + "," + y(i + 1) + ")";
                    }
                })
                .attr("height", function(d, i) {
                    return iBarH;
                })
                .attr("width", function(d, i) {
                    if ((d) > 0) {
                        return x(d) - x(0);
                    } else {
                        return x(0) - x(d);
                    }
                })
                .attr("opacity", "0.7")
                .attr("stroke-width", "1")
                .attr("stroke", "rgb(0,0,0)")
                .attr("fill", function(d, i) {
                    return colorClass[sortedType[i]];
                });
            // .on("mouseover", function(d){
            //     var rectSelection = d3.select(this).style(  "1.0");
            // })
            // .on("mouseout", function(d){
            //     var rectSelection = d3.select(this).style("opacity", "0.7");
            // });


            shifttext = axes.selectAll("text.shifttext")
                .data(sortedMag)
                .enter()
                .append("text")
                .attr("class", function(d, i) {
                    return "shifttext " + intStr0[sortedType[i]]
                })
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, i) {
                    if (d > 0) {
                        return "translate(" + (x(d) + 2) + "," + (y(i + 1) + iBarH) + ")"
                    } else {
                        return "translate(" + (x(d) - 2) + "," + (y(i + 1) + iBarH) + ")"
                    }
                })
                // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
                // .attr("y",function(d,i) { return y(i+1)+iBarH; } )
                .style("text-anchor", function(d, i) {
                    return ((d < 0) ? "end" : "start")
                })
                .style("font-size", wordfontsize)
                .text(function(d, i) {
                    return sortedWords[i];
                });

            if (translate) {
                // it is one longer than the words, the last entry being what
                // everything will be set to on "translate all"
                flipVector = Array(sortedWords.length + 1);
                for (var i = 0; i < flipVector.length; i++) {
                    flipVector[i] = 0;
                }
                flipVector[flipVector.length - 1] = 1;
                shifttext.on("click", function(event, d) {
                    var i = indexOfClass(this, ".shifttext");
                    // goal is to toggle translation
                    // need translation vector
                    //debug ? console.log(flipVector[i]) : null;
                    if (flipVector[i]) {
                        d3__namespace.select(this).text(sortedWords[i]);
                        flipVector[i] = 0;
                    } else {
                        d3__namespace.select(this).text(sortedWordsEn[i]);
                        flipVector[i] = 1;
                    }
                });
            }

            // check if there is a word selection to apply
            if (shiftseldecoder().current === "posup") {
                shiftTypeSelect = true;
                shiftType = 3;
                resetButton(true);
                // ((d>0) ? 500 : -500)
                // ((d>0) ? figcenter : x(d))
                axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                // .attr("transform","translate(0,"+y(i+1)+")");
                // .attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
                axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
            } else if (shiftseldecoder().current === "negdown") {
                shiftTypeSelect = true;
                shiftType = 0;
                resetButton(true);
                axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
            } else if (shiftseldecoder().current === "posdown") {
                shiftTypeSelect = true;
                shiftType = 1;
                resetButton(true);
                axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
            } else if (shiftseldecoder().current === "negup") {
                shiftTypeSelect = true;
                shiftType = 2;
                resetButton(true);
                axes.selectAll("rect.shiftrect.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
            }

            // draw a white rectangle to hide the shift bars behind the summary shifts
            // move x,y to 3 and width to -6 to give the bg a little space
            axes.append("rect").attr("x", 3).attr("y", 3).attr("width", figwidth - axeslabelmargin.left - 5).attr("height", 73 - 13).attr("fill", "white").style(
                "opacity", "1.0"
            );

            topbgrect2 = canvas.append("rect").attr("x", 0).attr("y", 0).attr("width", boxwidth).attr("height", toptextheight).attr("fill", bgcolor).style(
                "opacity", "1.0"
            );

            // draw the text on top of this rect
            toptext = canvas.selectAll("text.titletext")
                .data(comparisonText)
                .enter()
                .append("text")
                .attr("y", function(d, i) {
                    return (i + 1) * 17;
                })
                .attr("x", 3)
                .attr("class", function(d, i) {
                    return "titletext " + intStr[i];
                })
                // "font-family": "Helvetica Neue",
                .style("font-size", function(d, i) {
                    return topFontSizeArray[i];
                })
                .style("line-height", "1.42857143")
                .style("color", function(d, i) {
                    return colorArray[i];
                })
                // if there are 4 items...make the first two bold
                .style("font-weight", function(d, i) {
                    // using this variable numBoldLines
                    if (i < numBoldLines) {
                        return "bold";
                    } else {
                        return "normal";
                    }
                    // if (comparisonText.length > 3) {
                    //     if (i < (comparisonText.length - 2) ) {
                    //      return "bold";
                    //     }
                    //     else {
                    //      return "normal";
                    //     }
                    // }
                    // else {
                    //     return "normal";
                    // }
                })
                .text(function(d, i) {
                    return d;
                });

            bottombgrect = axes.append("rect")
                .attr("x", 3)
                .attr("y", fullheight - axeslabelmargin.bottom - toptextheight)
                .attr("width", figwidth - 2)
                .attr("height", axeslabelmargin.bottom)
                .attr("fill", bgcolor)
                .style(
                    "opacity", "1.0"
                );

            // draw the summary things
            sepline = axes.append("line")
                .attr("x1", 0)
                .attr("x2", figwidth - 2)
                .attr("y1", barHeight)
                .attr("y2", barHeight)
                .style("stroke-width", "1")
                .style("stroke", "black");

            maxShiftSum = Math.max(Math.abs(sumTypes[1]), Math.abs(sumTypes[2]), sumTypes[0], sumTypes[3], d3__namespace.sum(sumTypes));

            topScale = d3__namespace.scaleLinear()
                .domain([-maxShiftSum, maxShiftSum])
                // .range([figwidth*.12,figwidth*.88]);
                .range([sumTextWidth, figwidth - sumTextWidth]);

            // define the RHS summary bars so I can add if needed

            typeClass = ["posup", "negdown", "sumgrey"];
            colorClass = ["#ffff4c", "#b3b3ff", "#272727"];

            axes.selectAll(".sumrectR")
                .data([sumTypes[3], sumTypes[0], d3__namespace.sum(sumTypes)])
                .enter()
                .append("rect")
                .attr("class", function(d, i) {
                    return "sumrectR " + intStr0[i] + " " + typeClass[i];
                })
                .attr("x", function(d, i) {
                    if (d > 0) {
                        return figcenter;
                    } else {
                        return topScale(d);
                    }
                })
                .attr("y", function(d, i) {
                    if (i < 3) {
                        return i * 17 + 7;
                    } else {
                        return i * 17 + 7 - 2;
                    }
                })
                .attr("height", function(d, i) {
                    return 14;
                })
                .attr("width", function(d, i) {
                    if (d > 0) {
                        return topScale(d) - figcenter;
                    } else {
                        return figcenter - topScale(d);
                    }
                })
                .attr("fill", function(d, i) {
                    return colorClass[i];
                })
                .style(
                    "opacity",
                    function(d, i) {
                        var specificType = [3, 0, -1];
                        if ((shiftTypeSelect) && (shiftType !== specificType[i])) {
                            return "0.14";
                        } else {
                            return "0.7";
                        }
                    })
                .style("stroke-width", "1")
                .style("stroke", "rgb(0,0,0)")
                .on("mouseover", function(event, d) {
                    var i = indexOfClass(this, ".sumrectR");
                    var specificType = [3, 0, -1];
                    // if we're in a shift selection
                    if (shiftTypeSelect) {
                        if (shiftType === specificType[i]) {
                            d3__namespace.select(this).style(
                                "opacity", "0.7"
                            );
                        } else {
                            d3__namespace.select(this).style(
                                "opacity", "0.3"
                            );
                        }
                    }
                    // not in a shift selection
                    else {
                        d3__namespace.select(this).style(
                            "opacity", "1.0"
                        );
                    }
                })
                .on("mouseout", function(event, d) {
                    var i = indexOfClass(this, ".sumrectR");
                    var specificType = [3, 0, -1];
                    if (shiftTypeSelect) {
                        if (shiftType === specificType[i]) {
                            // debug ? console.log("in a shift type, and that specific type") : null;
                            d3__namespace.select(this).style(
                                "opacity", "0.7"
                            );
                        } else {
                            d3__namespace.select(this).style(
                                "opacity", "0.14"
                            );
                        }
                    } else {
                        d3__namespace.select(this).style(
                            "opacity", "0.7"
                        );
                    }
                })
                .on("click", function(event, d) {
                    var i = indexOfClass(this, ".sumrectR");
                    var specificType = [3, 0, -1];
                    debug ? console.log("sumrectR", this, arguments, d, i, shiftTypeSelect, specificType, specificType[i], shiftType, "resetButton(true)", axes) : null;

                    figure.selectAll(".sumrectR,.sumrectL").style("opacity", "0.1");
                    d3__namespace.select(this).style("opacity", "0.7");
                    if (i == 0) {
                        shiftTypeSelect = true;
                        shiftType = specificType[i];
                        resetButton(true);
                        shiftselencoder.varval("posup");
                        // shoot them all away
                        //d3.selectAll("rect.shiftrect, text.shifttext").transition().duration(1000).attr("transform",function(d,i) { if (d<0) { return "translate(-500,0)"; } else {return "translate(500,0)"; }});
                        // keep the ones with class "three"
                        //d3.selectAll("rect.shiftrect.three, text.shifttext.three").transition().duration(1000)
                        axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                        });
                    } else if (i == 1) {
                        shiftTypeSelect = true;
                        shiftType = specificType[i];
                        resetButton(true);
                        shiftselencoder.varval("negdown");
                        axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                    } else if (i == 2) {
                        // shiftTypeSelect = true;
                        // d3.selectAll(".sumrectR,.sumrectL").style( opacity:"0.7"});
                        resetfun();
                        // shiftselencoder.varval("negdown");
                    }
                });

            axes.selectAll(".sumtextR")
                .data([sumTypes[3], sumTypes[0], d3__namespace.sum(sumTypes)])
                .enter()
                .append("text")
                .style("text-anchor", function(d, i) {
                    return ((d > 0) ? "start" : "end");
                })
                .style("font-size", bigshifttextsize)
                //.attr("y",function(d,i) { if (i<2) {return i*17+17;} else if ((sumTypes[3]+sumTypes[1])*(sumTypes[0]+sumTypes[2])<0) {return i*17+33; } else {return i*17+33; } })
                // for only three days
                .attr("class", "sumtextR")
                .attr("id", function(d, i) {
                    return "sumTextR" + i;
                })
                .attr("y", function(d, i) {
                    return i * 17 + 17;
                })
                .attr("x", function(d, i) {
                    return topScale(d) + 5 * d / Math.abs(d);
                })
                .text(function(d, i) {
                    if (i == 0) {
                        return "\u2211+\u2191";
                    }
                    if (i == 1) {
                        return "\u2211-\u2193";
                    } else {
                        return "\u2211";
                    }
                });

            typeClass = ["posdown", "negup"];
            colorClass = ["#ffffb3", "#4c4cff"];

            axes.selectAll(".sumrectL")
                .data([sumTypes[1], sumTypes[2]])
                .enter()
                .append("rect")
                .attr("class", function(d, i) {
                    return "sumrectL " + intStr0[i] + " " + typeClass[i];
                })
                .attr("id", function(d, i) {
                    return "sumTextL" + i;
                })
                .attr("x", function(d, i) {
                    if (i < 2) {
                        return topScale(d);
                    } else {
                        // place the sum of negatives bar
                        // if they are not opposing
                        if ((sumTypes[3] + sumTypes[1]) * (sumTypes[0] + sumTypes[2]) > 0) {
                            // if positive, place at end of other bar
                            if (d > 0) {
                                return topScale((sumTypes[3] + sumTypes[1]));
                            }
                            // if negative, place at left of other bar, minus length (+topScale(d))
                            else {
                                return topScale(d) - (figcenter - topScale((sumTypes[3] + sumTypes[1])));
                            }
                        } else {
                            if (d > 0) {
                                return figcenter
                            } else {
                                return topScale(d)
                            }
                        }
                    }
                })
                .attr("y", function(d, i) {
                    return i * 17 + 7;
                })
                .attr("height", function(d, i) {
                    return 14;
                })
                .attr("width", function(d, i) {
                    if (d > 0) {
                        return topScale(d) - figcenter;
                    } else {
                        return figcenter - topScale(d);
                    }
                })
                .attr("fill", function(d, i) {
                    return colorClass[i];
                })
                .style("opacity", function(d, i) {
                    var specificType = [1, 2];
                    if ((shiftTypeSelect) && (shiftType !== specificType[i])) {
                        return "0.14";
                    } else {
                        return "0.7";
                    }
                })
                .style("stroke-width", "1")
                .style("stroke", "rgb(0,0,0)")
                .on("mouseover", function(event, d) {
                    var i = indexOfClass(this, ".sumrectL");
                    var specificType = [1, 2];
                    // if we're in a shift selection
                    if (shiftTypeSelect) {
                        if (shiftType === specificType[i]) {
                            debug ? console.log("in a shift type, and that specific type") : null;
                            d3__namespace.select(this).style(
                                "opacity", "0.7"
                            );
                        } else {
                            debug ? console.log("in a shift type, but not that specific type") : null;
                            d3__namespace.select(this).style(
                                "opacity", "0.3"
                            );
                        }
                    }
                    // not in a shift selection
                    else {
                        debug ? console.log("not in a shift type") : null;
                        d3__namespace.select(this).style(
                            "opacity", "1.0"
                        );
                    }
                })
                .on("mouseout", function(event, d) {
                    var i = indexOfClass(this, ".sumrectL");
                    var specificType = [1, 2];
                    if (shiftTypeSelect) {
                        if (shiftType === specificType[i]) {
                            d3__namespace.select(this).style(
                                "opacity", "0.7"
                            );
                        } else {
                            d3__namespace.select(this).style(
                                "opacity", "0.14"
                            );
                        }
                    } else {
                        d3__namespace.select(this).style(
                            "opacity", "0.7"
                        );
                    }
                })
                .on("click", function(event, d) {
                    var i = indexOfClass(this, ".sumrectL");
                    var specificType = [1, 2];

                    debug ? console.log("sumrectR", i, shiftTypeSelect, specificType, specificType[i], shiftType, "resetButton(true)", axes) : null;

                    shiftTypeSelect = true;
                    shiftType = specificType[i];
                    figure.selectAll(".sumrectR,.sumrectL").style(
                        "opacity", "0.1"
                    );
                    d3__namespace.select(this).style(
                        "opacity", "0.7"
                    );
                    resetButton(true);
                    if (i == 0) {
                        shiftselencoder.varval("posdown");
                        // together
                        // axes.selectAll("rect.shiftrect.zero, text.shifttext.zero, rect.shiftrect.three, text.shifttext.three, rect.shiftrect.two, text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { if (d<0) { return "translate(-500,0)"; } else {return "translate(500,0)"; }});
                        // separate
                        axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                        });
                    } else if (i == 1) {
                        shiftselencoder.varval("negup");
                        axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                        });
                        axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                        });
                        axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                            return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                        });
                    }
                });

            axes.selectAll(".sumtextL")
                .data([sumTypes[1], sumTypes[2]])
                .enter()
                .append("text")
                .style("text-anchor", "end")
                .style("font-size", bigshifttextsize)
                .attr("class", "sumtextL")
                .attr("y", function(d, i) {
                    return i * 17 + 17;
                })
                .text(function(d, i) {
                    if (i == 0) {
                        return "\u2211+\u2193";
                    } else {
                        return "\u2211-\u2191";
                    }
                })
                .attr("x", function(d, i) {
                    return topScale(d) - 5;
                });

            // x label of shift, outside of the SVG
            canvas.append("text")
                .text(xlabel_text)
                .attr("class", "axes-text")
                .attr("x", axeslabelmargin.left + figcenter) // 350-20-10 for svg width,
                .attr("y", boxheight - 7)
                .style("font-size", xylabelfontsize)
                .style("fill", "#000000")
                .style("text-anchor", "middle");

            canvas.append("text")
                .text(ylabel_text)
                .attr("class", "axes-text")
                .attr("x", 18)
                .attr("y", figheight / 2 + 60 + toptextheight)
                .attr("font-size", xylabelfontsize)
                .attr("fill", "#000000")
                .attr("transform", "rotate(-90.0," + (18) + "," + (figheight / 2 + 60 + toptextheight) + ")");

            axes.property("__zoom", 0);

            function zoomed(event) {
                debug ? console.log("zoomed", event, this.__zoom, zoom, axes, axes.property("__zoom")) : null;
                if ((this.__zoom <= 0) && (event.deltaY < 0)) return;
                event.preventDefault();

                // axes.call(zoom.transform);
                // axes.property("__zoom",axes.property("__zoom")+d3.event.deltaY);

                this.__zoom += event.deltaY / 2;

                // this prevents scrolling in the wrong direction
                // if (d3.event.transform.y > 0) {
                //     zoom.translate([0,0]).scale(1);
                // }

                var that = this;
                axes.selectAll("rect.shiftrect")
                    .attr("y", function(d) {
                        return -that.__zoom;
                    });
                axes.selectAll("text.shifttext")
                    .attr("y", function(d) {
                        return -that.__zoom;
                    });
                // .attr("y",d3.min([-d3.event.transform.y,0]));
                // axes.selectAll("text.shifttext")
                //     .attr("y",-d3.event.transform.y);
                if (distflag) {
                    debug ? console.log(event.translate) : null;
                    // move scaled to the height of the window (23 words)
                    var scaledMove = event.translate.y / (figheight - yHeight);
                    debug ? console.log(scaledMove) : null;
                    // move relative to the height of the box and those 23 words
                    var relMove = scaledMove * distgrouph * numWords / lens.length;
                    debug ? console.log(relMove) : null;
                    figure.select(".distwin").attr(
                        "y", d3__namespace.max([2, -relMove + 2]),
                    );
                }
            }
            // debug ? console.log(figheight) : null;
            // // attach this guy. cleaner with the group
            // help = axes.append("g")
            //     .attr("class", "help")
            //        .attr("fill", "#B8B8B8")
            //        .attr("transform", "translate("+(5)+","+(figheight-16)+")")
            //     .on("click", function() {
            //     window.open("http://hedonometer.org/instructions.html#wordshifts","_blank");
            //     })
            //     .selectAll("text.help")
            //     .data(["click here","for instructions"])
            //     .enter()
            //     .append("text")
            //     .attr("class", "help")
            //        .attr("fill", "#B8B8B8")
            //        .attr("x", 0)
            //        .attr("y", function(d,i) { return i*10; })
            //        .attr("font-size", "8.0px")
            //     .style("text-anchor", "start")
            //     .text(function(d) { return d; });

            if (distflag) {
                computedistributions();

                debug ? console.log(figheight) : null;
                debug ? console.log(yHeight) : null;
                var distgrouph = 250;
                var distgroupw = 70;
                var dxspace = 1;
                var dyspace = 2;

                distgroup = axes.append("g")
                    .attr("class", "dist")
                    .attr("fill", "#B8B8B8")
                    .attr("transform", "translate(" + (5) + "," + (figheight - 28 - distgrouph) + ")");

                distgroup.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", distgrouph)
                    .attr("width", distgroupw)
                    .attr("class", "distbg")
                    .attr("stroke-width", "2")
                    .attr("stroke", "rgb(150,150,150)")
                    .attr("fill", "#FCFCFC")
                    .attr("opacity", "0.96");

                var distx = d3__namespace.scaleLinear()
                    .domain(d3__namespace.extent(dist.map(function(d) {
                        return d[4];
                    })))
                    .range([dxspace, distgroupw - 2 * dxspace]);

                var disty = d3__namespace.scaleLinear()
                    .domain([0, nbins - 1])
                    .range([dyspace, distgrouph - dyspace]);
                // .range([dyspace,distgrouph-2*dyspace]);

                var line = d3__namespace.line()
                    .x(function(d, i) {
                        return distx(d);
                    })
                    .y(function(d, i) {
                        return disty(i);
                    })
                    .curve(d3__namespace.curveCardinal);
                // .interpolate("cardinal");

                debug ? console.log(dist.map(function(d) { return d[4]; })) : null;

                distgroup.append("path")
                    .datum(dist.map(function(d) {
                        return d[4];
                    }))
                    .attr("class", "line")
                    .attr("d", line)
                    .attr("stroke", "red")
                    .attr("stroke-width", 1.25)
                    .attr("fill", "none");

                var cdistx = d3__namespace.scaleLinear()
                    .domain(d3__namespace.extent(cdist.map(function(d) {
                        return d[4];
                    })))
                    .range([dxspace, distgroupw - 2 * dxspace]);

                var cline = d3__namespace.line()
                    .x(function(d, i) {
                        return cdistx(d);
                    })
                    .y(function(d, i) {
                        return disty(i);
                    })
                    .curve(d3__namespace.curveCardinal);
                // .interpolate("cardinal");

                distgroup.append("path")
                    .datum(cdist.map(function(d) {
                        return d[4];
                    }))
                    .attr("class", "line")
                    .attr("d", cline)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 1.25)
                    .attr("fill", "none");

                debug ? console.log(distgrouph*numWords/lens.length) : null;
                debug ? console.log(distgrouph*numWords/2000) : null;

                distgroup.append("rect")
                    .attr("x", 0)
                    .attr("y", 2)
                    .attr("height", distgrouph * numWords / nwords)
                    .attr("width", distgroupw)
                    .attr("class", "distwin")
                    .attr("stroke-width", "0.75")
                    .attr("stroke", "rgb(20,20,20)")
                    .attr("fill", "#FCFCFC")
                    .attr("opacity", "0.6");

                distgroup.append("text")
                    .attr("x", distgroupw + 2)
                    .attr("y", distgrouph + 2)
                    .attr("class", "nwordslabel")
                    .style("fill", "#B8B8B8")
                    .style("font-size", distlabeltext)
                    .style("text-anchor", "start")
                    .text(nwords);

                distgroup.append("text")
                    .attr("x", distgroupw + 2)
                    .attr("y", 2)
                    .attr("class", "zerolabel")
                    .style("fill", "#B8B8B8")
                    .style("font-size", distlabeltext)
                    .style("text-anchor", "start")
                    .text("0");
            }

            credit = axes.selectAll("text.credit")
                .data(credit_text_array)
                .enter()
                .append("text")
                .attr("class", "credit")
                .attr("x", (figwidth - 5))
                .attr("y", function(d, i) {
                    return figheight - 15 + i * 10;
                })
                .style("text-anchor", "end")
                .style("fill", "#B8B8B8")
                .style("font-size", creditfontsize)
                .text(function(d) {
                    return d;
                });

            // get this inside of the plot...so that resizeshift won't get called
            // too early (before a shift has been plotted)
            if (!widthsetexplicitly) {
                d3__namespace.select(window).on("resize.shiftplot", resizeshift);
            }

            if (reset) {
                // call it
                resetButton(true);
            }

            if (translate) {
                debug ? console.log(translate) : null;
                translateButton();
            }

            return that;

        }; // plot

        function resetButton(showb) {
            debug ? console.log("resetbutton function") : null;

            debug ? console.log(showb) : null;
            // showb = showb || true;
            debug ? console.log("showing reset button?") : null;
            debug ? console.log(showb) : null;
            figure.selectAll(".resetbutton").remove();

            if (showb) {

                var resetGroup = canvas.append("g")
                    .attr("transform", "translate(" + (4) + "," + (56 + toptextheight) + ") rotate(-90)")
                    .attr("class", "resetbutton");

                resetGroup.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("width", 48)
                    .attr("height", 17)
                    .attr("fill", "#F0F0F0") //http://www.w3schools.com/html/html_colors.asp
                    .style("stroke-width", "0.5")
                    .style("stroke", "rgb(0,0,0)");

                resetGroup.append("text")
                    .text("Reset")
                    .attr("x", 6)
                    .attr("y", 13)
                    .attr("font-size", resetfontsize);

                resetGroup.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("width", 48)
                    .attr("height", 18)
                    .attr("fill", "white") //http://www.w3schools.com/html/html_colors.asp
                    .style("opacity", "0.0")
                    .on("click", function() {
                        resetfun();
                    });

            }

        }
        function resetfun() {
            debug ? console.log("reset function") : null;
            figure.selectAll(".sumrectR,.sumrectL").style(
                "opacity", "0.7"
            );
            shiftTypeSelect = false;
            shiftType = -1;
            figure.selectAll("rect.shiftrect").transition().duration(1000)
                .attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
            figure.selectAll("text.shifttext").transition().duration(1000)
                .attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
            // d3.selectAll(".resetbutton").remove();
            shiftselencoder.varval("none");
            shiftselencoder.destroy();
        } // resetfun

        var replot = function() {
            var that = this;

            // apply new data to the bars, transition everything
            // tricky to get the transition right
            var yHeight = (7 + 17 * 3 + 14 + 5 - 13); // 101

            // linear scale function
            y.range([figheight + 2, yHeight]);
            sepline.transition().duration(1000)
                .attr("y1", barHeight)
                .attr("y2", barHeight);

            if (viz_type_decoder().cached === "table") {
                debug ? console.log("removing table stuff") : null;
                newrank.remove();
                newfreq.remove();
                newtype.remove();
                newmag.remove();
                header.remove();
            }

            viz_type.varval("wordshift");
            debug ? console.log("making a wordshift") : null;

            // make sure to update this
            if (comparisonText[0].length < 1) {
                if (compH >= refH) {
                    var happysad = "happier";
                } else {
                    var happysad = "less happy";
                }

                debug ? console.log("generating text for wordshift") : null;
                comparisonText = splitarray(
                    ["Reference happiness: " + refH.toFixed(2), "Comparison happiness: " + compH.toFixed(2), "Why comparison is " + happysad + " than reference:"],
                    boxwidth - 10 - logowidth,
                    "14px  " + fontString
                );
                debug ? console.log(comparisonText) : null;
            } else {
                {
                    comparisonText = splitarray(
                        comparisonText,
                        boxwidth - 10 - logowidth,
                        "14px  " + fontString
                    );
                }
                debug ? console.log(comparisonText) : null;
            }

            // could set a cap to make sure no 0"s
            maxWidth = d3__namespace.max(sortedWords.slice(0, 5).map(function(d) {
                return stringwidth(d, wordfontsize + "px  " + fontString);
            }));

            var xpadding = 10;
            // linear scale function
            x.domain([-Math.abs(sortedMag[0]), Math.abs(sortedMag[0])])
                .range([maxWidth + xpadding, figwidth - maxWidth - xpadding]);

            if (show_x_axis_bool) {
                canvas.select(".x.axis")
                    .call(xAxis);
            }

            // get the height again
            toptextheight = comparisonText.length * 17 + 13;
            debug ? console.log(toptextheight) : null;

            resetButton(true);

            // reset this
            figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom - toptextheight;

            // linear scale function
            y.range([figheight + 2, yHeight]);

            axes.attr("transform", "translate(" + (axeslabelmargin.left) + "," + (axeslabelmargin.top + toptextheight) + ")")
                .attr("height", figheight);

            bgrect.attr("height", figheight - 2).style(
                    "stroke-width", 0.5)
                .style("stroke", "rgb(20,20,20)");

            topbgrect2.attr("height", toptextheight);

            debug ? console.log(figheight) : null;
            // canvas.selectAll("g.help").remove();
            // help.remove();
            // help = axes.append("g")
            // .attr("class", "help")
            //  .attr("fill", "#B8B8B8")
            //  .attr("transform", "translate("+(5)+","+(figheight-16)+")")
            //     .on("click", function() {
            //     window.open("http://hedonometer.org/instructions.html#wordshifts","_blank");
            //     })
            //     .selectAll("text.help")
            //     .data(["click here","for instructions"])
            //     .enter()
            //     .append("text")
            //         .attr("class", "help")
            //    .attr("fill", "#B8B8B8")
            //    .attr("x", 0)
            //    .attr("y", function(d,i) { return i*10; })
            //    .attr("font-size", "8.0px")
            // .style("text-anchor", "start")
            //     .text(function(d) { return d; });


            // since I really want this on there (in safari)
            // go through the extra trouble of removing it first
            canvas.selectAll("text.credit").remove();
            credit.remove();
            credit = axes.selectAll("text.credit")
                .data(["visualization by", "@andyreagan"])
                .enter()
                .append("text")
                .attr("class", "credit")
                .attr("fill", "#B8B8B8")
                .attr("x", (figwidth - 5))
                .attr("y", (d, i) => figheight - 15 + i * 1)
                .attr("font-size", "8.0px")
                .style("text-anchor", "end")
                .text(function(d) {
                    return d;
                });

            debug ? console.log("the comparison text in replot is:") : null;
            debug ? console.log(comparisonText) : null;
            debug ? console.log(toptext) : null;
            canvas.selectAll("text.titletext").remove();
            toptext.remove();
            toptext = canvas.selectAll("text.titletext")
                .data(comparisonText)
                .enter()
                .append("text")
                .attr("y", (d, i) => (i + 1) * 17)
                .attr("x", 3, )
                .attr("class", (d, i) => "titletext " + intStr[i])
                // .style("font-family", "Helvetica Neue")
                .style("font-size", (d, i) => topFontSizeArray[i])
                .style("line-height", "1.42857143", )
                .style("color", (d, i) => colorArray[i])
                // if there are 4 items...make the first two bold
                // using this variable numBoldLines
                .style("font-weight", (d, i) => (i < numBoldLines) ? "bold" : "normal")
                .text(function(d, i) {
                    return d;
                });

            bottombgrect.attr("y", fullheight - axeslabelmargin.bottom - toptextheight);

            // both of these need their y height reset
            // resetButton(true);
            // if (translate) {
            //     translateButton();
            // }

            var newbars = axes.selectAll("rect.shiftrect").data(sortedMag);
            var newwords = axes.selectAll("text.shifttext").data(sortedMag);
            debug ? console.log(sortedWords) : null;
            debug ? console.log(sortedMag) : null;
            debug ? console.log(compF) : null;

            // if we haven't dont a subselection, apply with a transition
            var transition_duration = 0;
            if (shiftseldecoder().current === "none" || shiftseldecoder().current.length === 0) {
                transition_duration = 1500;
            }
            newbars.attr("class", (d, i) => "shiftrect " + intStr0[sortedType[i]])
                .transition().duration(transition_duration)
                .attr("fill", function(d, i) {
                    if (sortedType[i] == 2) {
                        return "#4C4CFF";
                    } else if (sortedType[i] == 3) {
                        return "#FFFF4C";
                    } else if (sortedType[i] == 0) {
                        return "#B3B3FF";
                    } else {
                        return "#FFFFB3";
                    }
                })
                // .attr("x", d => (d>0) ? figcenter : x(d))
                // .attr("y", (d,i) => y(i+1))
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, i) {
                    if (d > 0) {
                        return "translate(" + figcenter + "," + y(i + 1) + ")";
                    } else {
                        return "translate(" + x(d) + "," + y(i + 1) + ")";
                    }
                })
                .attr("height", (d, i) => iBarH)
                .attr("width", d => (d > 0) ? x(d) - x(0) : x(0) - x(d));

            newwords
                .attr("class", (d, i) => "shifttext " + intStr0[sortedType[i]])
                .transition().duration(transition_duration)
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, i) {
                    if (d > 0) {
                        return "translate(" + (x(d) + 2) + "," + (y(i + 1) + iBarH) + ")";
                    } else {
                        return "translate(" + (x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                    }
                })
                // .attr("class", function(d,i) { return "shifttext "+intStr0[sortedType[i]]; })
                // .attr("transform", null)
                // .attr("y",function(d,i) { return y(i+1)+iBarH; })
                // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
                .style("text-anchor", (d, i) => (sortedMag[i] < 0) ? "end" : "start")
                .style("font-size", wordfontsize)
                .text((d, i) => sortedWords[i]);

            debug ? console.log(shiftseldecoder().current) : null;
            if (shiftseldecoder().current === "posup") {
                axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
            } else if (shiftseldecoder().current === "negdown") {
                debug ? console.log("moving the words to show only negdown") : null;
                axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
            } else if (shiftseldecoder().current === "posdown") {
                axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
            } else if (shiftseldecoder().current === "negup") {
                axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? figcenter : x(d)) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? x(d) + 2 : x(d) - 2) + "," + (y(i + 1) + iBarH) + ")";
                });
                axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + y(i + 1) + ")";
                });
                axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform", function(d, i) {
                    return "translate(" + ((d > 0) ? 500 : -500) + "," + (y(i + 1) + iBarH) + ")";
                });
            }

            maxShiftSum = Math.max(Math.abs(sumTypes[1]), Math.abs(sumTypes[2]), sumTypes[0], sumTypes[3]);

            topScale.domain([-maxShiftSum, maxShiftSum]);

            // define the RHS summary bars so I can add if needed
            var newRtopbars = axes.selectAll(".sumrectR")
                .data([sumTypes[3], sumTypes[0], d3__namespace.sum(sumTypes)]);

            newRtopbars.transition().duration(1500)
                .attr("x", function(d, i) {
                    if (d > 0) {
                        return figcenter;
                    } else {
                        return topScale(d)
                    }
                })
                .attr("width", function(d, i) {
                    if (d > 0) {
                        return topScale(d) - figcenter;
                    } else {
                        return figcenter - topScale(d);
                    }
                });

            var newRtoptext = axes.selectAll(".sumtextR")
                .data([sumTypes[3], sumTypes[0], d3__namespace.sum(sumTypes)]);

            newRtoptext.transition().duration(1500).attr("class", "sumtextR")
                .style("text-anchor", function(d, i) {
                    if (d > 0) {
                        return "start";
                    } else {
                        return "end";
                    }
                })
                .attr("x", function(d, i) {
                    return topScale(d) + 5 * d / Math.abs(d);
                });

            var newLtopbars = axes.selectAll(".sumrectL")
                .data([sumTypes[1], sumTypes[2], sumTypes[0] + sumTypes[2]]);

            newLtopbars.transition().duration(1500).attr("fill", function(d, i) {
                    if (i == 0) {
                        return "#FFFFB3";
                    } else if (i == 1) {
                        return "#4C4CFF";
                    } else {
                        // choose color based on whether increasing/decreasing wins
                        if (d > 0) {
                            return "#B3B3FF";
                        } else {
                            return "#4C4CFF";
                        }
                    }
                })
                .attr("x", function(d, i) {
                    if (i < 2) {
                        return topScale(d);
                    } else {
                        // place the sum of negatives bar
                        // if they are not opposing
                        if ((sumTypes[3] + sumTypes[1]) * (sumTypes[0] + sumTypes[2]) > 0) {
                            // if positive, place at end of other bar
                            if (d > 0) {
                                return topScale((sumTypes[3] + sumTypes[1]));
                            }
                            // if negative, place at left of other bar, minus length (+topScale(d))
                            else {
                                return topScale(d) - (figcenter - topScale((sumTypes[3] + sumTypes[1])));
                            }
                        } else {
                            if (d > 0) {
                                return figcenter
                            } else {
                                return topScale(d)
                            }
                        }
                    }
                })
                .attr("width", function(d, i) {
                    if (d > 0) {
                        return topScale(d) - figcenter;
                    } else {
                        return figcenter - topScale(d);
                    }
                });

            var newLtoptext = axes.selectAll(".sumtextL")
                .data([sumTypes[1], sumTypes[2]]);

            newLtoptext.transition().duration(1500).attr("x", function(d, i) {
                return topScale(d) - 5;
            });

            return that;
        }; // hedotools.shifter.replot

        var shift = function(a, b, c, d) {
            // quick function for setting all four vectors and shifting, equivalent to
            //     my_shifter._refF(a);
            //     my_shifter._compF(b);
            //     my_shifter._lens(c);
            //     my_shifter._words(d);
            //     my_shifter.shifter();

            var that = this;
            refF = a;
            compF = b;
            lens = c;
            words = d;
            shifter();
            return that;
        };

        function translateButton() {
            debug ? console.log("adding the translate button") : null;
            var translateGroup = canvas.append("g")
                .attr("class", "translatebutton")
                .attr("transform", "translate(" + (4) + "," + (136 + toptextheight) + ") rotate(-90)");

            translateGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("width", 75)
                .attr("height", 17)
                .attr("fill", "#F0F0F0") //http://www.w3schools.com/html/html_colors.asp
                .style("stroke-width", "0.5")
                .style("stroke", "rgb(0,0,0)");

            translateGroup.append("text")
                .text("Translate All")
                .attr("x", 6)
                .attr("y", 13)
                .attr("font-size", "11.0px");

            translateGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("width", 75)
                .attr("height", 18)
                .attr("fill", "white") //http://www.w3schools.com/html/html_colors.asp
                .style("opacity", "0.0")
                .on("click", function() {
                    debug ? console.log("clicked translate") : null;
                    debug ? console.log(flipVector) : null;
                    for (var i = 0; i < flipVector.length - 1; i++) {
                        flipVector[i] = flipVector[flipVector.length - 1];
                    }
                    flipVector[flipVector.length - 1] = (flipVector[flipVector.length - 1] + 1) % 2;
                    debug ? console.log(flipVector) : null;

                    axes.selectAll("text.shifttext").transition().duration(1000)
                        // goal is to toggle translation
                        // need translation vector
                        .text((d, i) => flipVector[i] ? sortedWordsEn[i] : sortedWords[i]);
                }); // on("click")
        }    var drawlogo = function(logo_data, logo_href) {
            var logosize = d3__namespace.min([toptextheight - 10, 80]);
            logowidth = logosize + 40; // add some extra space
            // not working yet
            canvas.append("image")
                .attr("x", (boxwidth - logosize - 10))
                .attr("y", "0")
                .attr("width", logosize)
                .attr("height", logosize)
                .attr("xlink:href", logo_data)
                .on("click", function() {
                    window.open(logo_href, "_blank");
                });
        };

        var resizeshift = function() {
            var that = this;
            debug ? console.log("not implemented") : null;
            return that;
        };

        return {
            "debug": debugon,
            "urloff": urloff,
            "shift": shift,
            "ignore": ignore,
            "stop": stop,
            "istopper": istopper,
            "setfigure": setfigure,
            "setselection": setselection,
            "getfigure": getfigure,
            "setdata": setdata,
            "show_x_axis": show_x_axis,
            "_refF": _refF,
            "_compF": _compF,
            "_lens": _lens,
            "_words": _words,
            "_words_en": _words_en,
            "shifter": shifter,
            "setWidth": setWidth,
            "_compH": _compH,
            "_refH": _refH,
            "_reset": _reset,
            "_stoprange": _stoprange,
            "_complens": _complens,
            "setText": setText,
            "setTextBold": setTextBold,
            "setTopTextSizes": setTopTextSizes,
            "setTextColors": setTextColors,
            "setFontSizes": setFontSizes,
            "_fontString": _fontString,
            "setHeight": setHeight,
            "setBgcolor": setBgcolor,
            "_xlabel_text": _xlabel_text,
            "_ylabel_text": _ylabel_text,
            "resetbuttontoggle": resetbuttontoggle,
            "plotdist": plotdist,
            "plot": plot,
            "credit_text_array": _credit_text_array,
            "_shiftMag": _shiftMag,
            "_shiftType": _shiftType,
            "replot": replot,
            "_my_shift_id": _my_shift_id,
            "_sortedMag": _sortedMag,
            "_sortedType": _sortedType,
            "_sortedWords": _sortedWords,
            "_sortedWordsRaw": _sortedWordsRaw,
            "get_word_index": get_word_index,
            "translateButton": translateButton,
            // export this on the object here for compatibility
            "splitstring": splitarray,
            "drawlogo": drawlogo,
            // not implemented yet
            "selfShifter": null,
            "dualShifter": null,
            "word_paragraph": null,
            "word_list": null,
            "add_help_button": null,
            "wordshift_tour": null,
            "cloud": null,
            "table": null,
            "resizeshift": resizeshift // just a warning right now
        }
    };

    exports.functionThatDependsOnD3 = functionThatDependsOnD3;
    exports.shifterator = shifterator;

}));
// namespace it
var hedotools = hedotools || {};

// hedonometer.org/maps.html needs this in hedotools.map.js
var classColor = d3.scaleQuantize()
    .range([0,1,2,3,4,5,6])
    .domain([50,1]);

// begin with some helper functions
// http://stackoverflow.com/a/1026087/3780153
function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// this works really well, but it's deadly slow (working max 5 elements)
// and it's coupled to jquery
// http://stackoverflow.com/a/5047712/3780153
String.prototype.width = function(font) {
    var f = font || '12px arial',
    o = $('<div>' + this + '</div>')
	.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
	.appendTo($('body')),
    w = o.width();
    o.remove();
    return w;
}



String.prototype.safe = function() {
    var tmp = this.split("/")
    tmp[tmp.length-1] = escape(tmp[tmp.length-1])
    return tmp.join("/");
}

// yup
// http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
	val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

function splitWidth(s,w) {
    // s is the string
    // w is the width that we want to split it to
    var t = s.split(" ");
    var n = [t[0]];
    var i = 1;
    var j = 0;
    while (i<t.length) {
	if ((n[j]+t[i]).width() < w) {
	    n[j] += " "+t[i]
	}
	else {
	    j++;
	    n.push(t[i]);
	}
	i++;
    }
    return n;
}

// look away
var intStr0 = ["zero","one","two","three","four","five","six","seven","eight","nine","then"];
var intStr = intStr0.slice(1,100);

/*
hedotools.urllib
=========

a simple hedotools plugin to manage pushing and pulling the visualization state to the brower url

tests
-----
no test suite, I've tested in in Chrome v35 for reasonable use cases

example
-------
also no simple example, but you can see it in use here:
http://www.uvm.edu/storylab/share/papers/dodds2014a/books.html

documentation
-------------
slightly more documentation in the README

new:

decoder returns { current, cached } values
the current will be blank if there is nothing in the url
but the cached remains
I like this feature

*/
hedotools.urllib = {
    encoder: function() {
	var varname = "tmp";
	var varval = [];
	var show = true;
	//var that = this;

	function urllib(d) {
	    // nothing yet
	    //console.log(this);
	    //console.log(that);
	    return {current: varval,};
	}

	function parseurl() {
	    GET = {};
	    query = window.location.search.substring(1).split("&");
	    // break down the url
	    for (var i = 0, max = query.length; i < max; i++)
	    {
		if (query[i] === "") // check for trailing & with no param
		    continue;
		var param = query[i].split("=");
		GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
	    }

	    baseUrl = window.location.origin+window.location.pathname;
	    var tmpStr = ""
	    if (typeof varval == 'string' || varval instanceof String)
	    { tmpStr+=varval; }
	    else
	    {
		tmpStr += "["+varval[0]
		for (var i=1; i<varval.length; i++) { tmpStr += ","+varval[i]; }
		tmpStr+="]"
	    }
	    GET[varname] = tmpStr;

	    var urlString = ""
	    for (var key in GET) {
		if (GET.hasOwnProperty(key)) {
		    if (varname === key) {
			// console.log("found that variable");
			// console.log(show);
			if (show) {
			    urlString += key+"="+GET[key]+"&";
			}
		    }
		    else { urlString += key+"="+GET[key]+"&"; }
		}
	    }

	    urlString = urlString.substring(0,urlString.length-1);

	    // only add to url if there is stuff
	    if (urlString.length > 0) {
		newDataUrl = baseUrl+"?"+urlString
	    }
	    else { newDataUrl = baseUrl; }

	    window.history.replaceState("object or string", "title",newDataUrl);

	    return urllib;
	}

	urllib.varname = function(_) {
	    if (!arguments.length) return varname;
	    varname = _;
	    return urllib;
	}

	urllib.destroy = function() {
	    show = false;
	    parseurl();
	    show = true;
	    // return urllib;
	}

	urllib.varval = function(_) {
	    if (!arguments.length) return varval;
	    varval = _;
	    return parseurl();
	}

	return urllib;
    },
    decoder: function() {
	var varname = "tmp";
	var varresult = [];
	var defvalue = [];

	function urllib(d) {
	    parseurl();
	    return {current: varresult,
		    cached: defvalue};
	}

	function parseurl() {
	    GET = {};
	    query = window.location.search.substring(1).split("&");
	    for (var i = 0, max = query.length; i < max; i++) {
		if (query[i] === "") // check for trailing & with no param
		    continue;
		var param = query[i].split("=");
		GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
	    }

	    if (varname in GET) {
		if (GET[varname].length > 0 && GET[varname][0] === "[") {
		    if (GET[varname][GET[varname].length-1] === "]") {
			var tmpArray = GET[varname].substring(1, GET[varname].length - 1).split(',');
		    }
		    else {
			var tmpArray = GET[varname].substring(1, GET[varname].length).split(',');
		    }
		    varresult = tmpArray;
		    defvalue = tmpArray;
		}
		else {
		    varresult = GET[varname];
		    defvalue = GET[varname];
		}
	    }
	    else {
		// if there is nothing in the url...we'll let the value
		// live. this next line would kill the value
		varresult = ""
	    }
	    return urllib;
	}

	urllib.varname = function(_) {
	    if (!arguments.length) return varname;
	    varname = _;
	    return parseurl();
	}

	urllib.varresult = function(_) {
	    if (!arguments.length) return varresult;
	    varresult = _;
	    defvalue = _;
	    return urllib;
	}

	return urllib;
    }
};












hedotools.computeHapps = function() {
    var go = function () {
	for (var j=0; j<52; j++) {
	    // compute total frequency
	    var N = 0.0;
	    for (var i=0; i<allData[j].freq.length; i++) {
		N += parseFloat(allData[j].freq[i]);
	    }
	    var happs = 0.0;
	    for (var i=0; i<allData[j].freq.length; i++) {
		happs += parseFloat(allData[j].freq[i])*parseFloat(lens[i]);
	    }
	    allData[j].avhapps = happs/N;
	}
    }
    var opublic = { go: go, };
    return opublic;
}();
hedotools.barchartoncall = function() {
    var test = function(d,i) {
	// console.log(i);
	i = indices[i];
	if (stateSelType) {
	    shiftComp = i;
	    d3.select(".complabel").text(allData[i].name);
	    compencoder.varval(allData[i].name);
	}
	else {
	    shiftRef = i;
	    d3.select(".reflabel").text(allData[i].name);
	    refencoder.varval(allData[i].name);
	}

	if (shiftRef !== shiftComp) {
	    hedotools.shifter.shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
	    var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
	    hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+allData[shiftComp].name+" is "+happysad+" than "+allData[shiftRef].name+":"]).plot();
	}
    }
    var opublic = { test: test,
		  };
    return opublic;
}();

// mousedown ("click-to-open") hook: an empty stub by default; the host page
// overrides hedotools.barchartonclick.test to open the linked shift/modal.
hedotools.barchartonclick = function() {
    var test = function(event,d) {
    }
    var opublic = { test: test,
		  };
    return opublic;
}();

// make the plot
hedotools.barchart = function() {
    var figure;

    var setfigure = function(_) {
	// console.log("setting figure");
	figure = _;
	return hedotools.barchart;
    }

    var xlabeltext = "Happiness difference from US as a whole";
    var _xlabeltext = function(_) {
	if (!arguments.length) return xlabeltext;
	xlabeltext = _;
	return hedotools.barchart;
    }

    var data;
    var datanames;
    var geodata;

    var setdata = function(a,b) {
	data = a;
	geodata = b;
	datanames = Array(geodata.length);
	for (var i=0; i<geodata.length; i++) {
	    datanames[i] = geodata[i].properties.name;
	}
	return hedotools.barchart;
    }
    
    var _data = function(_) {
	if (!arguments.length) return data;
	data = _;
	return hedotools.barchart;
    }

    var _datanames = function(_) {
	if (!arguments.length) return datanames;
	datanames = _;
	return hedotools.barchart;
    }
    
    var figheight = 730;
    var _figheight = function(_) {
	if (!arguments.length) return figheight;
	figheight = _;
	return hedotools.barchart;
    }

    var manualTicks = [];
    var _manualTicks = function(_) {
	if (!arguments.length) return manualTicks;
	manualTicks = _;
	return hedotools.barchart;
    }

    var sortedStates;
    var getSorted = function(_) {
	if (!arguments.length) return sortedStates.map(function(d) { return d[2]; });
	if (_) {
	    return sortedStates.map(function(d,i) { return (i+1)+". "+d[2]; });
	}
	else {
	    return sortedStates.map(function(d) { return d[2]; });
	}
	return hedotools.barchart;
    }


    var plot = function() {
	/* plot the bar chart

	   -take a d3 selection, and draw the bar chart SVG on it
	   -requires the magnitude for each state, and the geojson
           with the names

	*/
	var margin = {top: 0, right: 0, bottom: 0, left: 0};
	var axeslabelmargin = {top: 0, right: 0, bottom: 50, left: 0};
	var figwidth = parseInt(figure.style('width')) - margin.left - margin.right;
	// aspectRatio = 1.9,
	// figheight = parseInt(d3.select('#barChart').style('width'))*aspectRatio - margin.top - margin.bottom,
	var width = figwidth-axeslabelmargin.left-axeslabelmargin.right;
	var height = figheight-axeslabelmargin.top-axeslabelmargin.bottom;
	var figcenter = width/2;
	var leftOffsetStatic = axeslabelmargin.left;

	// do the sorting
	var indices = Array(data.length);
	for (var i = 0; i < data.length; i++) { indices[i] = i; }
	// sort by abs magnitude
	// indices.sort(function(a,b) { return Math.abs(data[a]) < Math.abs(data[b]) ? 1 : Math.abs(data[a]) > Math.abs(data[b]) ? -1 : 0; });
	// sort by magnitude, parity preserving
	indices.sort(function(a,b) { return data[a] < data[b] ? 1 : data[a] > data[b] ? -1 : 0; });
	sortedStates = Array(data.length);
	for (var i = 0; i < data.length; i++) { sortedStates[i] = [i,indices[i],datanames[indices[i]],data[indices[i]]]; }
	// console.log(sortedStates);

	// remove an old figure if it exists
	figure.select(".canvas").remove();

	var canvas = figure.append("svg")
	    .attr("width",figwidth)
	    .attr("height",figheight)
	    .attr("class","canvas")
	    .attr("id","barchartsvg");

	// x scale, maps all the data to 
	var absDataMax = d3.max([d3.max(data),-d3.min(data)]);
	var x = d3.scaleLinear()
	    .domain([-absDataMax,absDataMax])
	    .range([5,width-10]);

	// linear scale function
	var y =  d3.scaleLinear()
	    .domain([data.length,1])
	    .range([height-20, 5]); 

	// // zoom object for the axes
	// var zoom = d3.behavior.zoom()
	// 	.y(y) // pass linear scale function
	//     // .translate([10,10])
	// 	.scaleExtent([1,1])
	// 	.on("zoom",zoomed);

	// create the axes themselves
	var axes = canvas.append("g")
	    .attr("transform", "translate(" + (axeslabelmargin.left) + "," +
		  (axeslabelmargin.top) + ")")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "main");
	// .call(zoom);

	// create the axes background
	// var bgrect = axes.append("svg:rect")
	// 	.attr("width", width)
	// 	.attr("height", height)
	// 	.attr("class", "bg")
	// 	.style({'stroke-width':'2','stroke':'rgb(0,0,0)'})
	// 	.attr("fill", "#FCFCFC");

	// create the x axes
	var bgrect = axes.append("svg:line")
    	    .attr("x1", width)
    	    .attr("y1", height)
    	    .attr("x2", axeslabelmargin.left)
    	    .attr("y2", height)
    	//.attr("class", "bg")
    	    .style('stroke-width','1').style('stroke','rgb(10,10,10)');
    	//.attr("fill", "#FCFCFC");

	// axes creation functions
	var create_xAxis = function() {
	    return d3.axisBottom(x)
		.ticks(4); }

	// // axis creation function
	// var create_yAxis = function() {
	// 	return d3.svg.axis()
	// 	    .scale(y) //linear scale function
	// 	    .orient("left"); }

	// // draw the axes
	// var yAxis = create_yAxis()
	// 	.tickSizeInner(6)
	// 	.tickSizeOuter(0);

	// axes.append("g")
	// 	.attr("class", "y axis ")
	// 	.attr("font-size", "14.0px")
	// 	.attr("transform", "translate(0,0)")
	// 	.call(yAxis);

	var xAxis;
	if (manualTicks.length > 0) {
	    xAxis = create_xAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0)
		.tickValues(manualTicks);
	}
	else {
	    xAxis = create_xAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0);
	}

	axes.append("g")
	    .attr("class", "x axis ")
	    .attr("font-size", "14.0px")
	    .attr("transform", "translate(0," + (height) + ")")
	    .call(xAxis);

	d3.selectAll(".tick line").style('stroke','black');

	// create the clip boundary
	// var clip = axes.append("svg:clipPath")
	// 	.attr("id","clip")
	// 	.append("svg:rect")
	// 	.attr("x",0)
	// 	.attr("y",0)
	// 	.attr("width",width)
	// 	.attr("height",height);

	// // now something else
	// var unclipped_axes = axes;

	// axes = axes.append("g")
	// 	.attr("clip-path","url(#clip)");

	// var ylabel = canvas.append("text")
	// 	.text("State Rank")
	// 	.attr("class","axes-text")
	// 	.attr("x",(figwidth-width)/4)
	// 	.attr("y",figheight/2+30)
	// 	.attr("font-size", "16.0px")
	// 	.attr("fill", "#000000")
	// 	.attr("transform", "rotate(-90.0," + (figwidth-width)/4 + "," + (figheight/2+30) + ")");

	var xlabel = canvas.append("text")
	    // .text("Happiness")
	    .text(xlabeltext)
	    .attr("class","axes-text")
	    .attr("x",width/2+(figwidth-width)/2)
	    .attr("y",3*(figheight-height)/4+height)
	    .attr("font-size", "16.0px")
	    .attr("fill", "#000000")
	    .attr("style", "text-anchor: middle;");

	axes.selectAll("rect.staterect")
	    .data(sortedStates)
	    .enter()
	    .append("rect")
	    .attr("class", function(d,i) { return d[2]+" staterect"+" q"+classColor(i+1)+"-8"; })
	    .attr("x", function(d,i) { if (d[3]>0) { return figcenter; } else { return x(d[3]); } })
	    .attr("y", function(d,i) { return y(i+1); })
	    .style('opacity','1.0').style('stroke-width','1.0').style('stroke','rgb(100,100,100)')
	    .attr("height",function(d,i) { return 11; } )
	    .attr("width",function(d,i) { if (d[3]>0) {return d3.max([x(d[3])-figcenter,0]);} else {return d3.max([figcenter-x(d[3]),0]); } } )
	    .on('mouseover', function(event,d){
		var rectSelection = d3.select(this).style('opacity','1.0').style('stroke','black').style('stroke-width','1.0');
		hedotools.barchartoncall.test(d,d[0]);
	    })
	    .on('mouseout', function(event,d){
		var rectSelection = d3.select(this).style('opacity','1.0').style('stroke','rgb(100,100,100)').style('stroke-width','1.0');
		// var rectSelection = d3.select(this).style({opacity:'0.7'});
	    })
	    .on('mousedown', function(event,d){
		hedotools.barchartonclick.test(d,d[0]);
	    });

	axes.selectAll("text.statetext")
	    .data(sortedStates)
	    .enter()
	    .append("text")
	    .attr("class", function(d,i) { return d[2]+" statetext"; })
	    .attr("x", function(d,i) { if (d[3]>0) { return figcenter-6; } else { return figcenter+6; } })
	    .style("text-anchor", function(d,i) { if (d[3]>0) { return "end";} else { return "start";}})
	    .attr("y",function(d,i) { return y(i+1)+11; } )
            .text(function(d,i) { return (i+1)+". "+d[2]; })
	    .on('mouseover', function(event,d){
		hedotools.barchartoncall.test(d,d[0]);
	    })
	    .on('mousedown', function(event,d){
		hedotools.barchartonclick.test(d,d[0]);
	    });

	// d3.select(window).on("resize.shiftplot",resizeshift);
	
	// function resizeshift() {
	// 	figwidth = parseInt(d3.select("#shift01").style('width')) - margin.left - margin.right,
	// 	width = .775*figwidth
	// 	figcenter = width/2;

	// 	canvas.attr("width",figwidth);

	// 	x.range([(sortedWords[0].length+3)*9, width-(sortedWords[0].length+3)*9]);
	// 	topScale.range([width*.1,width*.9]);

	// 	bgrect.attr("width",width);
	// 	//axes.attr("transform", "translate(" + (0.125 * figwidth) + "," +
	// 	//      ((1 - 0.125 - 0.775) * figheight) + ")");
	
	// 	// mainline.attr("d",line);

	// 	// fix the x axis
	// 	canvas.select(".x.axis").call(xAxis);

	// 	clip.attr("width",width);

	// 	// get the x label
	// 	xlabel.attr("x",(leftOffsetStatic+width/2));

	// 	// the andy reagan credit
	// 	credit.attr("x",width-7);

	// 	// line separating summary
	// 	sepline.attr("x2",width);

	// 	// all of the lower shift text
	// 	axes.selectAll("text.shifttext").attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } );
	// }
    };

    var opublic = { setfigure: setfigure,
		    setdata: setdata,
		    _data: _data,
		    _manualTicks: _manualTicks,
		    _datanames: _datanames,
		    _figheight: _figheight, 
		    _xlabeltext: _xlabeltext, 
		    getSorted: getSorted, 
		    plot: plot, };

    return opublic;
}();









// on call as a module
// in the test function, can set the function that gets called
// when the lens is moved
// full flexibility
hedotools.lensoncall = function() { 
    var test = function(extent1) {
	console.log("set on load (works for maps.html)");
	// reset
	for (var j=0; j<allData.length; j++) {
	    for (var i=0; i<allData[j].rawFreq.length; i++) {
		var include = true;
		// check if in removed word list
		for (var k=0; k<ignoreWords.length; k++) {
		    if (ignoreWords[k] == words[i]) {
			include = false;
			//console.log("ignored "+ignoreWords[k]);
		    }
		}
		// check if underneath lens cover
		if (lens[i] >= extent1[0] && lens[i] <= extent1[1]) {
		    include = false;
		}
		// include it, or set to 0
		if (include) {
		    allData[j].freq[i] = allData[j].rawFreq[i];
		}
		else { allData[j].freq[i] = 0; }
		
	    }
	}
	hedotools.computeHapps.go();
	hedotools.map.setfigure(d3.select('#map01')).setdata(geoJson).plot();
	if (shiftRef !== shiftComp) {
	    hedotools.shifter.shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
	    var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
	    hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+allData[shiftComp].name+" is "+happysad+" than "+allData[shiftRef].name+":"]).plot();
	}
    }
    var opublic = { test: test, };
    return opublic;
}();

hedotools.lens = function() {

    // for now, keep track of which page we're in
    // since they're all a bit different
    var page = "geo";

    var encoder = hedotools.urllib.encoder().varname("lens"); //.varval(lensExtent);
    var decoder = hedotools.urllib.decoder().varname("lens").varresult([4,6]); //.varval(lensExtent);

    var figure;
    var lens;
    var margin = {top: 0, right: 55, bottom: 0, left: 0};
    var figwidth;
    var figheight = 100 - margin.top - margin.bottom;
    var width;
    var height = .875*figheight-5;
    var leftOffsetStatic;

    var grabwidth = function() {
	figwidth = parseInt(figure.style('width')) - margin.left - margin.right;
	width = .875*figwidth-5;
	leftOffsetStatic = 0.125*figwidth;
    }

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	grabwidth();
	return hedotools.lens;
    }

    var setdata = function(_) {
	lens = _;
	return hedotools.lens;
    }
    
    lensExtent = decoder().cached;

    var plot = function () {

	if (figwidth > 10) {

	    // remove an old figure if it exists
	    figure.selectAll(".canvas").remove();

	    var canvas = figure.append("svg")
		.attr("width",figwidth)
		.attr("height",figheight)
		.attr("id","lenssvg")
		.attr("class","canvas");


	    // create the x and y axis
	    var x = d3.scaleLinear()
	        .domain([1.00,9.00])
		// .domain(d3.extent(lens))
		.range([0,width]);
	    
	    // use d3.layout http://bl.ocks.org/mbostock/3048450
	    var data = d3.bin()
		.domain(x.domain())
		.thresholds(x.ticks(65))
                (lens);

	    // linear scale function
	    var y =  d3.scaleLinear()
		.domain([0,d3.max(data,function(d) { return d.length; } )])
		.range([height, 0]); 

	    // create the axes themselves
	    var axes = canvas.append("g")
		.attr("transform", "translate(" + (0.125 * figwidth) + "," +
		      ((1 - 0.125 - 0.875) * figheight) + ")")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "main");

	    // create the axes background
	    var bgrect = axes.append("svg:rect")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "bg")
		.style('stroke-width','2').style('stroke','rgb(0,0,0)')
		.attr("fill", "#FFFFF0");

	    // axes creation functions
	    var create_xAxis = function() {
		return d3.axisBottom(x)
		    .ticks(9); }

	    // axis creation function
	    var create_yAxis = function() {
		return d3.axisLeft(y)
		    .ticks(3); }

	    // draw the axes
	    var yAxis = create_yAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0);

	    axes.append("g")
		.attr("class", "top")
		.attr("transform", "translate(0,0)")
		.attr("font-size", "12.0px")
		.call(yAxis);

	    var xAxis = create_xAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0);

	    axes.append("g")
		.attr("class", "x axis ")
		.attr("font-size", "12.0px")
		.attr("transform", "translate(0," + (height) + ")")
		.call(xAxis);

	    d3.selectAll(".tick line").style('stroke','black');

	    // create the clip boundary
	    var clip = axes.append("svg:clipPath")
		.attr("id","clip")
		.append("svg:rect")
		.attr("x",0)
		.attr("y",80)
		.attr("width",width)
		.attr("height",height-80);

	    var unclipped_axes = axes;
	    
	    //axes = axes.append("g")
	    //.attr("clip-path","url(#clip)");

	    canvas.append("text")
		.text("Num Words")
		.attr("class","axes-text")
		.attr("x",(figwidth-width)/4)
		.attr("y",figheight/2+30)
		.attr("font-size", "12.0px")
		.attr("fill", "#000000")
		.attr("transform", "rotate(-90.0," + (figwidth-width)/4 + "," + (figheight/2+30) + ")");

	    // var xlabel = canvas.append("text")
	    // 	.text("Word score")
	    // 	.attr("class","axes-text")
	    // 	.attr("x",width/2+(figwidth-width)/2)
	    // 	.attr("y",figheight)
	    // 	.attr("font-size", "12.0px")
	    // 	.attr("fill", "#000000")
	    // 	.attr("style", "text-anchor: middle;");

	    var lensMean = d3.mean(lens);

	    var bar = axes.selectAll(".distrect")
		.data(data)
		.enter()
		.append("g")
		.attr("class","distrect")
		.attr("fill",function(d,i) { if (d.x0 > lensMean) {return "#D3D3D3";} else { return "#D3D3D3";}})
		.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	    var mainrect = bar.append("rect")
		.attr("x", 1)
		.attr("width", x(data[0].x1 - data[0].x0 + 1)-2 )
		.attr("height", function(d) { return height - y(d.length); });

	    var line = d3.line()
		.x(function(d,i) { return x(d.x0); })
		.y(function(d) { return y(d.length); })
		.curve(d3.curveLinear);

	    var mainline = axes.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.attr("stroke","black")
		.attr("stroke-width",3)
		.attr("fill","none");

	    //console.log(x(d3.min(lens)));

	    var brushX = d3.scaleLinear()
		.domain([1,9])
		// .domain(d3.extent(lens))
		.range([figwidth*.125,width+figwidth*.125]);
	    


	    function brushended(event) {
		if (!event.sourceEvent) return;
		if (!event.selection) return;
		// selection is in pixels; invert through brushX to data space
		var extent0 = event.selection.map(brushX.invert),
		extent1 = extent0; // should round it to bins

		onredrawfunction();
		
		// window.stopVals = extent1;
		// console.log(extent1);
		if ((extent1[0] !== lensExtent[0]) || (extent1[1] !== lensExtent[1]))
		{	    

		    lensExtent = [Math.round(extent1[0]*4)/4,Math.round(extent1[1]*4)/4];
		    hedotools.lensoncall.test(extent1);
		} 

		d3.select(this).transition()
		    .call(brush.move, lensExtent.map(brushX));

		encoder.varval(lensExtent);
	    }

	    var brush = d3.brushX()
		.extent([[brushX.range()[0], 0], [brushX.range()[1], height]])
		.on("end",brushended);

	    var gBrush = canvas.append("g")
		.attr("class","lensbrush")
		.call(brush);
	    gBrush.call(brush.move, lensExtent.map(brushX));

	    gBrush.selectAll("rect")
		.attr("height",height)
		.attr("y",0)
		.style('stroke-width','2').style('stroke','rgb(100,100,100)').style('opacity',0.95)
		.attr("fill", "#FCFCFC");

	    //console.log(lensExtent);

	    function resizelens() {
		figwidth = parseInt(d3.select("#lens01").style('width')) - margin.left - margin.right,
		width = .775*figwidth;

		canvas.attr("width",figwidth);

		x.range([0,width]);
		bgrect.attr("width",width);
		//axes.attr("transform", "translate(" + (0.125 * figwidth) + "," +
		//      ((1 - 0.125 - 0.775) * figheight) + ")");
		
		mainline.attr("d",line);

		//create_xAxis.scale(x);
		//xAxisHandle.call(xAxis);
		canvas.select(".x.axis").call(xAxis);

		canvas.selectAll(".distrect").attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
		
		// xlabel.attr("x",(leftOffsetStatic+width/2));

		d3.selectAll(".tick line").style('stroke','black');

		// //brushX.range([figwidth*.125,width+figwidth*.125]);
		brushX.range([leftOffsetStatic,leftOffsetStatic+width]);
		brush.extent([[brushX.range()[0], 0], [brushX.range()[1], height]]);
		d3.select(".lensbrush") //.transition()
		    .call(brush.move, lensExtent.map(brushX));
		//brushing();
		//brush.event();
	    };

	    d3.select(window).on("resize.selectlens",resizelens);

	    // var buttongroup = figure.append("div").attr({"class":"btn-group-vertical",});
	    //buttongroup.html('<button type="button" class="btn btn-default">Button</button><button type="button" class="btn btn-default">Button</button><div class="btn-group"><button id="btnGroupVerticalDrop1" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Dropdown<span class="caret"></span>        </button>     <ul class="dropdown-menu" role="menu" aria-labelledby="btnGroupVerticalDrop1">          <li><a href="#">Dropdown link</a></li>          <li><a href="#">Dropdown link</a></li>        </ul></div>      <button type="button" class="btn btn-default">Button</button>'

	    figure.selectAll("div.btn-group-vertical").remove();
	    var buttongroup = figure.append("div").attr("class","btn-group-vertical pull-right")
	    // var defaults = [[4,6],[3,7],[3,9],[1,7],[5,5]];
	    var defaults = [[4,6],[3,7],[5,5]];
	    // var defaultnames = ["Default","Wide","Sad","Happy","None"];
	    var defaultnames = ["Default","Wide","None"];
	    buttongroup.selectAll("button").data(defaults).enter()
		.append("button")
		.attr("type","button")
		.attr("class", function(d,i) { return "btn btn-default btn-xs "+defaultnames[i]; })
		.html(function(d,i) { return defaultnames[i]; })
		.on("click",function(event,d) {
		    figure.selectAll("button").attr("class","btn btn-default btn-xs"); 
		    d3.select(this).attr("class","btn btn-primary btn-xs"); 
		    d3.select(".lensbrush") //.transition()
			.call(brush.move, d.map(brushX));
		});
	    // initially check if any are matched
	    console.log(lensExtent);
	    for (var i=0; i<defaults.length; i++) {
		if (defaults[i][0] === parseFloat(lensExtent[0]) && defaults[i][1] === parseFloat(lensExtent[1])) {
		    // make it active
		    buttongroup.select("button."+defaultnames[i]).attr("class","btn btn-primary btn-xs");
		}
	    }

	}; // if figwidth > 10
    }

    var onredrawfunction = function() {
	console.log("I got called");
    }

    var opublic = { setfigure: setfigure,
		    setdata: setdata,
		    plot: plot,
		    onredrawfunction: onredrawfunction,
		  };

    return opublic;
}();
hedotools.map = function() {

    var figure;

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	return hedotools.map;
    }

    var classColor = d3.scaleQuantize()
        .range([0,1,2,3,4,5,6])
        .domain([50,1]);

    var geoJson;

    var setdata = function(_) {
	geoJson = _;
	return hedotools.map;
    }
    
    var plot = function() {
	/* 
	   plot the state map!

	   drawMap(figure,geoJson);
           -figure is a d3 selection
           -geoJson is the loaded us-states file
           -stateHapps is the loaded csv (state,val)
	*/

	//Width and height
	var w = parseInt(figure.style('width'));
	var h = w*650/900;

	// remove an old figure if it exists
	figure.select(".canvas").remove();

	//Create SVG element
	var canvas = figure
	    .append("svg")
	    .attr("class", "map canvas")
	    .attr("id", "mapsvg")
	    .attr("width", w)
	    .attr("height", h);

	var selarray = [false,true],
	selstrings = ["Reference","Comparison"],
	selstringslen = selstrings.map(function(d) { return d.width(); }),
	initialpadding = 5,
	boxpadding = 5,
	fullselboxwidth = selarray.length*boxpadding*2-boxpadding+initialpadding+d3.sum(selstringslen);

	var legendscale = d3.scaleLinear()
            .domain([340,730])
            .range([0,1]);

	function makeSelector() {

	    canvas.append("text")
		.attr("x", (w-70-fullselboxwidth-56))
		.attr("y", 54)
		.attr("fill", "grey")
		.text("Selecting ");

	    var selgroup = canvas.append("g")
		.attr("class", "selgroup")
		.attr("transform", "translate("+(w-70-fullselboxwidth)+","+40+")");

	    selgroup.append("rect")
		.attr("class", "selbox")
		.attr("x", 0)
		.attr("y", 0)
		.attr("rx", 3)
		.attr("ry", 3)
		.attr("width", fullselboxwidth)
		.attr("height", 19)
		.attr("fill", "#F8F8F8")
		.attr('stroke-width', '0.5')
		.attr('stroke', 'rgb(0,0,0)');
	    
	    selgroup.selectAll("rect.colorclick")
    		.data(selarray)
    		.enter()
    		.append("rect")
    		.attr("class", function(d,i) { return "colorclick "+intStr[i]; })
    		.attr("x", function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(selstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } })
    		.attr("y", 0)
		.attr("rx", 3)
		.attr("ry", 3)
    		.attr("width", function(d,i) { if (i === 0) { return selstringslen[i]+initialpadding+boxpadding; } else { return selstringslen[i]+boxpadding*2; }})
    		.attr("height", 19)
    		.attr("fill", "#F8F8F8") //http://www.w3schools.com/html/html_colors.asp
		.attr('stroke-width', '0.5')
		.attr('stroke', 'rgb(0,0,0)');

	    selgroup.selectAll("text")
    		.data(selstrings)
    		.enter()
    		.append("text")
    		.attr("x", function(d,i) {
		    // start at 2
		    if (i==0) { return initialpadding; }
		    // then use 2+width+10+width+10+width...
		    // for default padding of 5 on L/R
		    else { return d3.sum(selstringslen.slice(0,i))+initialpadding+i*boxpadding*2; } })
    			.attr("y", 14)
    			.attr("class", function(d,i) { return "seltext "+intStr[i]; })
    		.text(function(d,i) { return d; });

	    selgroup.selectAll("rect.selclick")
    		.data(selarray)
    		.enter()
    		.append("rect")
    		.attr("class", "selrect")
    		.attr("x", function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(selstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } })
    		.attr("y", 0)
    		.attr("width", function(d,i) { if (i === 0) { return selstringslen[i]+initialpadding+boxpadding; } else { return selstringslen[i]+boxpadding*2; }})
    		.attr("height", 19)
    		.attr("fill", "white") //http://www.w3schools.com/html/html_colors.asp
    		.attr("opacity", "0.0")
    		.on("mousedown", function(event,d) {
		    var i = selarray.indexOf(d);
		    if (stateSelType !== d) {
			stateSelType = d;
			activeHover = true;
			d3.selectAll("text.seltext").attr("fill","black")
			d3.select("text.seltext."+intStr[i]).attr("fill","white")
			d3.selectAll("rect.colorclick").attr("fill","#F8F8F8").attr("stroke","rgb(0,0,0)")
			d3.select("rect.colorclick."+intStr[i]).attr("fill","#428bca").attr("stroke","#428bca"); 
			d3.select(".selbutton.one").attr("class","btn btn-default btn-xs pull-right selbutton one");
			d3.select(".selbutton.two").attr("class","btn btn-default btn-xs pull-right selbutton two");
			d3.select(".selbutton."+intStr[i]).attr("class","btn btn-primary btn-xs pull-right selbutton "+intStr[i]);
			d3.selectAll(".state").attr("stroke-width",0.7);
		    }
    		});

	    selgroup.selectAll("line")
    		.data(selstrings.slice(0,selstrings.length-1))
    		.enter()
    		.append("line")
    		.attr("stroke","grey")
    		.attr("stroke-width","2")
    		.attr("x1", function(d,i) { 
		    return d3.sum(selstringslen.slice(0,i+1))+i*boxpadding+(i+1)*boxpadding+initialpadding;
		})
    		.attr("x2", function(d,i) { 
		    return d3.sum(selstringslen.slice(0,i+1))+i*boxpadding+(i+1)*boxpadding+initialpadding;
		})
    		.attr("y1", 0)
    		.attr("y2", 19); 

	    if (stateSelType) {
		var i = 1; 
	    }
	    else { 
		var i = 0; 
	    }

	    d3.selectAll("text.seltext").attr("fill","black")
	    d3.select("text.seltext."+intStr[i]).attr("fill","white")
	    d3.selectAll("rect.colorclick").attr("fill","#F8F8F8").attr("stroke","rgb(0,0,0)")
	    d3.select("rect.colorclick."+intStr[i]).attr("fill","#428bca").attr("stroke","#428bca");

	}

	function makeLegend(legendwidth,legendheight,textsize) { 

	    var legendarray = [0,1,2,3,4,5,6],
	    legendstringslen = [legendwidth,legendwidth,legendwidth,legendwidth,legendwidth,legendwidth,legendwidth,],
	    initialpadding = 0,
	    boxpadding = 0.25,
	    fulllegendboxwidth = legendarray.length*boxpadding*2-boxpadding+initialpadding+d3.sum(legendstringslen);

	    var legendgroup = canvas.append("g")
		.attr("class", "legendgroup")
		.attr("transform", "translate("+(w-50-fulllegendboxwidth)+","+(h-legendheight-legendheight-2)+")");

	    legendgroup.selectAll("rect.legendrect")
    		.data(legendarray)
    		.enter()
    		.append("rect")
    		.attr("class", function(d,i) { return "q"+i+"-8"; })
    		.attr("x", function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(legendstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } })
    		.attr("y", 0)
		       // "rx": 3,
		       // "ry": 3,
    		.attr("width", function(d,i) { return legendstringslen[i]; })
    		.attr("height", legendheight)
		.attr('stroke-width', '1')
		.attr('stroke', 'rgb(0,0,0)');

	    legendgroup.selectAll("text.legendtext")
		.data(["less happy","happier"])
		.enter()
		.append("text")
		.attr("x", function(d,i) {
		    if (i==0) { return 0; }
		    else { return fulllegendboxwidth-d.width(textsize+"px arial"); } })
    		.attr("y", legendheight+legendheight)
    		.attr("class", function(d,i) { return "legendtext"; })
		.attr("font-size", textsize+"px")
    		.text(function(d,i) { return d; });
	}

	var scaleFactor = legendscale(w);

	makeLegend((20+10*scaleFactor),(8+5*scaleFactor),(9+3*scaleFactor));

	//Define map projection
	var projection = d3.geoAlbersUsa()
	    .translate([w/2, h/2])
	    .scale(w*1.3);
	//.scale(1000);

	//Define path generator
	var path = d3.geoPath()
	    .projection(projection);

	var numColors = 20,
        hueRange = [240,60], // in degrees
        // see http://hslpicker.com/#ffd900
        saturation = 1, // full
        lightness = 0.5; // half
	var colors = Array(numColors);
	var colorStrings = Array(numColors);
	for (i = 0; i<numColors; i++) {
	    colors[i] = hslToRgb((hueRange[0]+(hueRange[1]-hueRange[0])/(numColors-1)*i)/360, saturation, lightness);
	    colorStrings[i] = "rgb(" + colors[i][0] + "," + colors[i][1] + "," + colors[i][2] + ")"
	}
	// console.log(colors);
	// console.log(colorStrings);
	
	//Define quantize scale to sort data values into buckets of color
	color = d3.scaleQuantize()
	//.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
            .range(colorStrings)
	    .domain([
		d3.min(allData, function(d) { return d.avhapps; }), 
		d3.max(allData, function(d) { return d.avhapps; })
	    ]);

	//Colors taken from colorbrewer.js, included in the D3 download

	// do the sorting
	indices = Array(allData.length-1);
	for (var i = 0; i < allData.length-1; i++) { indices[i] = i; }
	indices.sort(function(a,b) { return Math.abs(allData[a].avhapps) < Math.abs(allData[b].avhapps) ? 1 : Math.abs(allData[a].avhapps) > Math.abs(allData[b].avhapps) ? -1 : 0; });
	sortedStates = Array(allData.length-1);
	for (var i = 0; i < allData.length-1; i++) { sortedStates[i] = [i,indices[i],allStateNames[indices[i]]]; }
	// console.log(sortedStates);
	sortedStateList = Array(allData.length);
	for (var i = 0; i < allData.length; i++) { sortedStateList[indices[i]] = i+1; }

	stateFeatures = topojson.feature(geoJson,geoJson.objects.states).features;

	//Bind data and create one path per GeoJSON feature
	var states = canvas.selectAll("path")
	    .data(stateFeatures);
	
	states.enter()
	    .append("path")
	    .attr("d", function(d,i) { return path(d.geometry); } )
	    .attr("id", function(d,i) { return d.properties.name; } )
	    .attr("class",function(d,i) { return "state map "+d.properties.name[0]+d.properties.name.split(" ")[d.properties.name.split(" ").length-1]+" "+"q"+classColor(sortedStateList[i])+"-8"; } )
            .on("mousedown",state_clicked)
            .on("mouseover",state_hover)
            .on("mouseout",state_unhover);

	states.exit().remove();

	states
	    .attr("stroke","black")
	    .attr("stroke-width",".7");

	function state_clicked(event,d) { var i = stateFeatures.indexOf(d);
	    // next line verifies that the data and json line up
	    // console.log(d.properties.name); console.log(allData[i].name);

	    if (activeHover) { 
		// stop hovering
		activeHover = false;
		// remove the color
		d3.selectAll(".state").style("fill",null);
		if (stateSelType) {
		    // select the comparison
		    d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
			.attr("stroke-width",3);
		}
		else {
		    // toggle the reference
		    d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
			.attr("stroke-width",3);
		}
	    }
	    else {
		activeHover = true;
		d3.selectAll(".state").attr("stroke-width",0.7);
	    }

	    //.text("Average Happiness h").append("tspan").attr("baseline-shift","sub").text("avg");

	    

	    // if (shiftRef !== i) {
	    //     //console.log("reference "+allData[i].name);
	    //     shiftRef = i;
	    //     d3.selectAll(".state.map").attr("stroke-width",".7");
	    //     d3.selectAll(".state.list").attr("stroke","none");
	    //     d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
	    // 	.attr("stroke-width",3);
	    // }
	    // else { 
	    //     //console.log("reference everything");
	    //     shiftRef = 51;
	    //     d3.selectAll(".state.map").attr("stroke-width","0.7");
	    //     d3.selectAll(".state.list").attr("stroke","none");
	    //         //.attr("stroke-width",3);
	    // }
	    
	    // if (shiftRef !== shiftComp) {
	    //     shiftObj = shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
	    //     plotShift(d3.select('#shift01'),shiftObj.sortedMag.slice(0,200),
	    // 	      shiftObj.sortedType.slice(0,200),
	    // 	      shiftObj.sortedWords.slice(0,200),
	    // 	      shiftObj.sumTypes,
	    // 	      shiftObj.refH,
	    // 	      shiftObj.compH);
	    // }
	}

	function state_hover(event,d) { var i = stateFeatures.indexOf(d);
	    var bbox = this.getBBox(); 
	    var x = Math.floor(bbox.x + bbox.width/2.0);
	    var y = Math.floor(bbox.y + bbox.height/2.0);
	    // console.log(x);
	    // console.log(y);

	    var wordsstring = "Words Used: "+commaSeparateNumber(d3.sum(allData[i].freq)),// +"/"+commaSeparateNumber(d3.sum(allData[i].rawFreq)),
	    wordsstring2 = "Total Words: "+commaSeparateNumber(d3.sum(allData[i].rawFreq)),
	    USwordsstring = "US Words Used: "+commaSeparateNumber(d3.sum(allData[51].freq)),// +"/"+commaSeparateNumber(d3.sum(allData[i].rawFreq)),
	    USwordsstring2 = "US Total Words: "+commaSeparateNumber(d3.sum(allData[51].rawFreq)),
	    happsstring = "Average Happiness: "+allData[i].avhapps.toFixed(2)
	    //hoverboxheight = 115,
	    hoverboxheight = 125+51,
	    hoverboxwidth = d3.max([wordsstring.width('13px arial'),happsstring.width('15px arial'),wordsstring2.width('13px arial'),USwordsstring.width('13px arial'),USwordsstring2.width('13px arial')])+20,
	    hoverboxxoffset = 60;
	    var hoverboxyoffset = 30;
	    
	    // if it would wrap it over, move it to the left side
	    if ((x+hoverboxwidth+hoverboxxoffset)>w) {
		hoverboxxoffset = -hoverboxxoffset-hoverboxwidth;
	    }

	    // if it would wrap it over, move it to the left side
	    if ((y-hoverboxheight/2-hoverboxyoffset)<0) {
		hoverboxyoffset = -30;
	    }
	    
	    var hovergroup = canvas.append("g")
		.attr("class", "hoverinfogroup")
		.attr("transform", "translate("+(x+hoverboxxoffset)+","+(y-hoverboxheight/2-hoverboxyoffset)+")");

	    var hoverbox = hovergroup.append("rect")
		.attr("class", "hoverinfobox")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", hoverboxwidth)
		.attr("height", hoverboxheight)
		.attr("fill", "white")
		.attr("stroke", "black");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		.attr("y", 15)
		.attr("font-size", 15)
		.text(allData[i].name);

	    hovergroup.append("line")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		.attr("y", 15)
		.attr("font-size", 15)
		.text(allData[i].name);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 55,
		.attr("y", 38)
		.attr("font-size", 17)
		.text("Rank:"); // +"/51");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 59)
		.attr("y", 55)
		.attr("font-size", 40)
		.text(sortedStateList[i]); // +"/51");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 105)
		.attr("y", 56)
		.attr("font-size", 20)
		.text("out of 51");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 73,
		.attr("y", 79)
		.attr("font-size", 15)
		.text(happsstring);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 89,
		.attr("y", 97)
		.attr("font-size", 13)
		.text(wordsstring);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 106,
		.attr("y", 114)
		.attr("font-size", 13)
		.text(wordsstring2);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 106,
		.attr("y", 131)
		.attr("font-size", 13)
		.text("US Average Happiness: "+allData[51].avhapps.toFixed(2));

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 89,
		.attr("y", 97+51)
		.attr("font-size", 13)
		.text(USwordsstring);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 106,
		.attr("y", 114+51)
		.attr("font-size", 13)
		.text(USwordsstring2);

	    if (activeHover) {
		if (stateSelType) {
		    shiftComp = i;
		    d3.select(".complabel").text(allData[i].name);
		    compencoder.varval(allData[i].name);
		}
		else {
		    shiftRef = i;
		    d3.select(".reflabel").text(allData[i].name);
		    refencoder.varval(allData[i].name);
		}

		// next line verifies that the data and json line up
		// console.log(d.properties.name); console.log(allData[i].name.split(" ")[allData[i].name.split(" ").length-1]); 
		d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1]).style("fill","#428bca");

		if (shiftRef !== shiftComp) {
		    hedotools.shifter.shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
		    var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
		    hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+allData[shiftComp].name+" is "+happysad+" than "+allData[shiftRef].name+":"]).plot();
		}
	    }
	}

	function state_unhover(event,d) {

	    d3.select(".hoverinfogroup").remove();

	    if (activeHover) {
		// next line verifies that the data and json line up
		// console.log(d.properties.name); console.log(allData[i].name.split(" ")[allData[i].name.split(" ").length-1]); 
		// shiftComp = i;
		//console.log(".state.list."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1]);
		//d3.selectAll(".state.list."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
		//.style("fill",null);
		d3.select(this)
		    .style("fill",null);
	    }
	}

	function resizemap() {
	    w = parseInt(figure.style('width'));
	    h = w*650/900;
	    projection.translate([w/2, h/2]).scale(w*1.3);
	    canvas.selectAll("path").attr("d",path);
	    canvas.attr("width",w).attr("height",h);
	};

	d3.select(window).on("resize.map",resizemap);

    };


    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    function hslToRgb(h, s, l){
	var r, g, b;

	if(s == 0){
            r = g = b = l; // achromatic
	}else{
            function hue2rgb(p, q, t){
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if(t < 1/6) return p + (q - p) * 6 * t;
		if(t < 1/2) return q;
		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    var opublic = { setfigure: setfigure,
		    setdata: setdata,
		    plot: plot, };

    return opublic;

}();






hedotools.sankeyoncall = function() { 
    var test = function(i,data) {
	console.log("set in module");

	console.log(allDataOld);
	
	hedotools.shifter.shift(allDataOld[data[i].index].freq,allData[data[i].index].freq,lens,words);
	var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
	hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+data[i].name+" has become "+happysad+":"]).plot();


    }
    var opublic = { test: test, };
    return opublic;
}();

hedotools.sankey = function() { 

    var popuptimer;

    var figure;

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	// grabwidth();
	return hedotools.sankey;
    }

    var oldlist;
    var newlist;
    var stateNames;

    var oldindices;
    var newindices;
    var data;

    var setdata = function(a,b,c) {
	oldlist = a;
	newlist = b;
	stateNames = c;
	if ( stateNames[50] === "District of Columbia" ) {
	    stateNames[50] = "DC";
	}

	// do the sorting
	oldindices = Array(oldlist.length);
	for (var i = 0; i < oldlist.length; i++) { oldindices[i] = i; }

	// sort by abs magnitude
	// oldindices.sort(function(a,b) { return Math.abs(data[a]) < Math.abs(data[b]) ? 1 : Math.abs(data[a]) > Math.abs(data[b]) ? -1 : 0; });

	// sort by magnitude, parity preserving
	oldindices.sort(function(a,b) { return oldlist[a] < oldlist[b] ? 1 : oldlist[a] > oldlist[b] ? -1 : 0; });

	// do the sorting on new data
	newindices = Array(newlist.length);
	for (var i = 0; i < newlist.length; i++) { newindices[i] = i; }

	newindices.sort(function(a,b) { return newlist[a] < newlist[b] ? 1 : newlist[a] > newlist[b] ? -1 : 0; });

	data = Array(oldlist.length);
	for (var i=0; i<data.length; i++) {
	    data[i] = {
		"name": stateNames[i],
		"index": i,
		"oldindex": oldindices.indexOf(i),
		"newindex": newindices.indexOf(i),
		"change": newlist[i]-oldlist[i],
		"oldhapps": oldlist[i],
		"newhapps": newlist[i],
	    };
	}

	// console.log(data);
	// tmpglob = data;

	return hedotools.sankey;
    }

    // initialize everything so other function in this module have access
    var margin;
    var axeslabelmargin;
    var figwidth;
    var aspectRatio;
    var figheight;
    var width;
    var height;
    var figcenter;
    var leftOffsetStatic;

    var canvas;
    var x;
    var y;
    var axes;

    var oldstateselection;
    var newstateselction;
    var path;
    var sankeydata;
    var pathwidth;
    var pathselection;

    var listlabels;
    var extraSideWidth = [0,0];

    var useTip = false;
    var tip;

    var minwidth = 450;

    // make the plot
    var plot = function() {
	margin = {top: 0, right: 0, bottom: 0, left: 0};
	axeslabelmargin = {top: 0, right: 90+extraSideWidth[0], bottom: 0, left: 90+extraSideWidth[1]};
	figwidth = parseInt(figure.style('width')) - margin.left - margin.right;
	if (figwidth<minwidth) {
	    console.log("width is too small...");
	    d3.selectAll(".reftimelabel,.comptimelabel,.reftimelabelbottom,.comptimelabelbottom").remove();
	    figure.append("text").text("Unfortunately, this visualization will look terrible on your device. If you're on a phone, try rotating and refreshing, or looking from a desktop. Thanks :)");
	    return hedotools.sankey;
	}
	aspectRatio = 1.8+3.4*(oldlist.length-51)/(304-51);
	figheight = parseInt(figure.style('width'))*aspectRatio - margin.top - margin.bottom;
	// console.log("figheight is "+figheight);
	// figheight = 4576; // for the city sankey this seems good
	width = figwidth-axeslabelmargin.left-axeslabelmargin.right;
	height = figheight-axeslabelmargin.top-axeslabelmargin.bottom;
	figcenter = width/2;
	leftOffsetStatic = axeslabelmargin.left;

	var hovergroup = figure.append("div").attr("class", "hoverinfogroup")
	    .style("position", "absolute")
	    .style("top", "100px")
	    .style("left", "100px")
	    .style("visibility", "hidden");

	function hidehover() {
	    console.log("hiding hover");
	    d3.selectAll("path").transition().duration(500).style("opacity","1.0");
	    if (useTip) {
		hovergroup.style("visibility", "hidden");
	    }
	}

	// remove an old figure if it exists
	figure.select(".canvas").remove();

	canvas = figure.append("svg")
	    .attr("width",figwidth)
	    .attr("height",figheight)
	    .attr("id","sankeysvg")
	    .attr("class","canvas")

	// x scale, maps all the data to 
	x = d3.scaleLinear()
	    .domain([0,1])
	    .range([5,width-10]);

	// linear scale function
	y =  d3.scaleLinear()
	    .domain([newlist.length,1])
	    .range([height-20, 5]); 

	// create the axes themselves
	axes = canvas.append("g")
	    .attr("transform", "translate(" + (axeslabelmargin.left) + "," +
		  (axeslabelmargin.top) + ")")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "main");

	// if (useTip) {
	//     console.log("setting tip");
	//     tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
	//     axes.call(tip);
	// }

	oldstateselection = axes.selectAll("text.statetext.old")
	    .data(data)
	    .enter()
	    .append("text")
	    .attr("class", function(d,i) { return d.name+" statetext"; })
	    .attr("x",20)
	    .style("text-anchor", "end")
	    .attr("y",function(d,i) { return y(d.oldindex+1)+11; } )
            .text(function(d,i) { return (d.oldindex+1)+". "+d.name; });

	newstateselection = axes.selectAll("text.statetext.new")
	    .data(data)
	    .enter()
	    .append("text")
	    .attr("class", function(d,i) { return d.name+" statetext"; })
	    .attr("x",width-20)
	    .style("text-anchor", "start")
	    .attr("y",function(d,i) { return y(d.newindex+1)+11; } )
            .text(function(d,i) { return (d.newindex+1)+". "+d.name; });

	// create an instance of the sankey to make paths
	// horizontal sankey-style link path: this is the v3 d3.sankey().link()
	// generator inlined. Nodes are positioned manually above, so we only need
	// the path shape (a horizontal cubic Bezier), not the sankey layout.
	path = function(d) {
	    var x0 = d.source.x + d.source.dx,
		x1 = d.target.x,
		xi = d3.interpolateNumber(x0, x1),
		x2 = xi(0.5),
		x3 = xi(0.5),
		y0 = d.source.y + d.sy + d.dy / 2,
		y1 = d.target.y + d.ty + d.dy / 2;
	    return "M" + x0 + "," + y0
		+ "C" + x2 + "," + y0
		+ " " + x3 + "," + y1
		+ " " + x1 + "," + y1;
	};

	// create the sankey data thingy
	sankeydata = Array(oldlist.length);
	for (var i=0; i<data.length; i++) {
	    sankeydata[i] = {
		"source": {
		    "x": 20,
		    "dx": 2,
		    "y": y(data[i].oldindex+1)-8, 
		},
		"target": {
		    "x": width-22,
		    "dx": 2,
		    "y": y(data[i].newindex+1)-8,
		},
		"name": data[i].name,
		"oldhapps": data[i].oldhapps,
		"newhapps": data[i].newhapps,
		"oldindex": data[i].oldindex,
		"newindex": data[i].newindex,
		"sy": 10,
		"ty": 10,
		"dy": 10,
	    };
	}

	pathwidth = d3.scaleLinear()
	    .domain(d3.extent(data.map(function(d) { return Math.abs(d.change); })))
	    .range([2,13]);

	pathselection = axes.selectAll("path.sankey").data(sankeydata)
	    .enter()
	    .append("path")
            .attr("d", path)
		    .attr("fill", "none")
		    .attr("class", function(d,i) { return "r"+classColor(data[i].oldindex)+"-8"; })
		    .attr("stroke-width", function(d,i) { return pathwidth(Math.abs(data[i].change)); })
	    .on("mouseover", function(event,d) { var i = sankeydata.indexOf(d);
		// console.log(i);
		// console.log(data[i]);
		// var rectSelection = d3.select(this)
		//     .style({'opacity':'0.7',
		// 	    // 'stroke-width':'1.0',
		// 	   });

		var thispath = this;

		hedotools.sankeyoncall.test(i,data);

		d3.selectAll("path").transition().duration(750).style("opacity","0.1");
		d3.select(this).transition().duration(5).style("opacity","1.0");

		if (useTip) {

		    // var bbox = this.getBBox(); 
		    // var x = Math.floor(bbox.x + bbox.width/2.0); 
		    // var y = Math.floor(bbox.y + bbox.height/2.0);

		    var hoverboxheight = 90;
		    var hoverboxwidth = 200;
		    var hoverboxyoffset = 0;
		    var hoverboxxoffset = 0;

		    var x = d3.pointer(event, thispath)[0];
		    var y = d3.pointer(event, thispath)[1];

                    var hoverboxheightguess = 190;
		    if (refcity.length > 0) {
			hoverboxheightguess = 270;
		    }
		    if ((y+hoverboxheightguess)>height) { y-=(y+hoverboxheightguess-height); }
		    
		    // tip.show;
		    // console.log(d);

		    hovergroup.style("position", "absolute")
			.style("top", y+"px")
			.style("left", x+"px")
			.style("visibility", "visible");

		    hovergroup.selectAll("p,h3,button,br").remove();

		    hovergroup.append("h3")
			.attr("class","cityname")
			.text(d.name);

		    hovergroup.append("p")
			.attr("class","refhapps")
		    	.text(reftimeseldecoder().cached+" Happiness: "+parseFloat(d.oldhapps).toFixed(2));

		    hovergroup.append("p")
			.attr("class","refrank")
		    	.text(reftimeseldecoder().cached+" Rank: "+(d.oldindex+1));

		    hovergroup.append("p")
			.attr("class","comphapps")
		    	.text(comptimeseldecoder().cached+" Happiness: "+parseFloat(d.newhapps).toFixed(2));

		    hovergroup.append("p")
			.attr("class","comprank")
		    	.text(comptimeseldecoder().cached+" Rank: "+(d.newindex+1));

		    var popupshift = function(refyear,refname,compyear,compname) {
			refshifttimeencoder.varval(refyear);
			refshiftcityencoder.varval(refname);
			compshifttimeencoder.varval(compyear);
			compshiftcityencoder.varval(compname);
			// write a function to call on the load
			drawShift = function() {
			    hedotools.shifter._refF(refF);
			    hedotools.shifter._compF(compF);
			    hedotools.shifter.stop();
			    hedotools.shifter.shifter();
			    hedotools.shifter.setText(["Why "+compname+" in "+compyear+" is "+( ( hedotools.shifter._compH() > hedotools.shifter._refH() ) ? "happier" : "less happy" )+" than "+refname+" in "+refyear+":"]).plot();
			    $('#myModal').modal('show');
			}
			// load both of the files
			var csvLoadsRemaining = 2;
			// var reffile = "http://hedonometer.org/data/cities/word-vectors/"+reftimeseldecoder().cached+"/"+d.name+".csv";
			// if (parseInt(reftimeseldecoder().cached) < 2014) reffile+=".new"
			// var compfile = "http://hedonometer.org/data/cities/word-vectors/"+comptimeseldecoder().cached+"/"+d.name+".csv";
			// if (parseInt(comptimeseldecoder().cached) < 2014) compfile+=".new"
			var reffile = "http://hedonometer.org/data/cities/word-vectors/"+refyear+"/"+refname+".csv";
			if (parseInt(refyear) < 2014) reffile+=".new"
			var compfile = "http://hedonometer.org/data/cities/word-vectors/"+compyear+"/"+compname+".csv";
			if (parseInt(compyear) < 2014) compfile+=".new"
			console.log(reffile);
			console.log(compfile);
			var refF;
			var compF;
			d3.text(reffile).then(function(text) {
			    refF = text.split(",");
			    console.log(refF);
			    if (!--csvLoadsRemaining) drawShift();
			});
			d3.text(compfile).then(function(text) {
			    compF = text.split(",");
			    console.log(compF);
			    if (!--csvLoadsRemaining) drawShift();
			});
		    }

		    hovergroup.append("button")
			.attr("class","btn btn-sm btn-primary")
		    	.text("Shift city vs previous year")
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    popupshift(reftimeseldecoder().cached,d.name,comptimeseldecoder().cached,d.name);
			});

		    hovergroup.append("br");
		    hovergroup.append("br");

		    hovergroup.append("button")
			.attr("class","btn btn-sm btn-primary")
		    	.text("Shift city in "+reftimeseldecoder().cached+" vs sum "+reftimeseldecoder().cached)
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    popupshift(reftimeseldecoder().cached,"US",reftimeseldecoder().cached,d.name);
			});

		    hovergroup.append("br");
		    hovergroup.append("br");

		    hovergroup.append("button")
			.attr("class","btn btn-sm btn-primary")
		    	.text("Shift city in "+comptimeseldecoder().cached+" vs sum "+comptimeseldecoder().cached)
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    popupshift(comptimeseldecoder().cached,"US",comptimeseldecoder().cached,d.name);
			});

		    hovergroup.append("br");
		    hovergroup.append("br");


		    hovergroup.append("button")
			.attr("class","btn btn-xs btn-primary")
		    	.text("Select as reference for city-city comparison")
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    refcity = d.name;
			});

		    if (refcity.length > 0) {
			hovergroup.append("br");
			hovergroup.append("br");
			hovergroup.append("button")
			    .attr("class","btn btn-xs btn-primary")
		    	    .text("Compare against "+refcity+" in "+comptimeseldecoder().cached)
			    .on("click", function() {
				console.log(d);
				console.log(i);
				popupshift(comptimeseldecoder().cached,refcity,comptimeseldecoder().cached,d.name);
			    });
			hovergroup.append("br");
			hovergroup.append("br");
			hovergroup.append("button")
			    .attr("class","btn btn-xs btn-primary")
		    	    .text("Compare against "+refcity+" in "+reftimeseldecoder().cached)
			    .on("click", function() {
				console.log(d);
				console.log(i);
				popupshift(reftimeseldecoder().cached,refcity,reftimeseldecoder().cached,d.name);
			    });
		    }
		}
		
		clearTimeout(popuptimer);
		popuptimer = setTimeout(hidehover,3000);
	    })
	    .on("mouseout", function(event,d) {
		var timeout = 500;
		if (useTip) {
		    // hovergroup.style({
		    // 	"visibility": "hidden",
		    // });

		    timeout = 3000;
		    clearTimeout(popuptimer);

		    popuptimer = setTimeout(hidehover,timeout);
		}
		clearTimeout(popuptimer);
		popuptimer = setTimeout(hidehover,timeout);
		var rectSelection = d3.select(this)
		    .style('opacity', '1.0')
	    });

	return hedotools.sankey;
    };

    var replot = function() {
	// assuming that the data has been updated
	// console.log(oldstateselection);
	// console.log(newstateselection);

	console.log(data);
	
	oldstateselection.data(data)
	    .transition()
	    .duration(3000)
            .text(function(d,i) { return (d.oldindex+1)+". "+d.name; })
	    .attr("y",function(d,i) { return y(d.oldindex+1)+11; } );

    	newstateselection.data(data)
	    .transition()
	    .duration(3000)
            .text(function(d,i) { return (d.newindex+1)+". "+d.name; })
    	    .attr("y",function(d,i) { return y(d.newindex+1)+11; } );

	// create the sankey data thingy
	for (var i=0; i<data.length; i++) {
	    sankeydata[i] = {
		"source": {
		    "x": 20,
		    "dx": 2,
		    "y": y(data[i].oldindex+1)-8, 
		},
		"target": {
		    "x": width-22,
		    "dx": 2,
		    "y": y(data[i].newindex+1)-8,
		},
		"name": data[i].name,
		"oldhapps": data[i].oldhapps,
		"newhapps": data[i].newhapps,
		"oldindex": data[i].oldindex,
		"newindex": data[i].newindex,
		"sy": 10,
		"ty": 10,
		"dy": 10,
	    };
	}

	// update the width function
	pathwidth.domain(d3.extent(data.map(function(d) { return Math.abs(d.change); })));

	pathselection.data(sankeydata)
	    .transition()
	    .duration(3000)
            .attr("d", path)
		    // don't update this
		    // because the transition is applied by the css at the end
		    // and it messes up the whole effect
		    .attr("stroke-width", function(d,i) { return pathwidth(Math.abs(data[i].change)); });

	return hedotools.sankey;
    };

    // need functions to access updated properties
    var GETdata = function() {
	return data;
    };

    var GETnewindices = function() {
	return newindices;
    };

    var setTitles = function(titles) {
	listlabels = titles;
	return hedotools.sankey;
    };

    var setSideWidth = function(listTwoByOne) {
	extraSideWidth = listTwoByOne;
	return hedotools.sankey;
    };

    var setTipOn = function() {
	useTip = true;
	return hedotools.sankey;
    };

    var opublic = {
	plot: plot,
	setfigure: setfigure,
	setdata: setdata,
	data: GETdata,
	newindices: GETnewindices,
	replot: replot,
	setTitles: setTitles,
	setSideWidth: setSideWidth,
	setTipOn: setTipOn,
    };

    return opublic;
}();







// hedotools.shifter — the wordshift graph.
//
// As of v4.5 this is no longer implemented here; it lives in its own package,
// @andyreagan/d3-shifterator (extracted from this repo's old shifter.v4.js).
// We instantiate that package's factory once and expose it as the shared
// `hedotools.shifter` singleton that the dashboard modules (barchart, lens,
// map, sankey) drive via .shift(refF, compF, lens, words) and
// .setfigure(...).setText(...).plot().
//
// Load order on the page (and in bundle.sh): D3 v4, then the d3-shifterator
// UMD bundle (which defines the global `shifterator`), then this file.
//
// One compatibility shim: the dashboard modules call
//     setfigure(d3.select('#shift01'))
// passing a d3 SELECTION (the old hedotools.shifter API). d3-shifterator's
// setfigure expects a selector string or node (it runs d3.select() on its
// argument). Normalize a selection down to its node so both styles work.
hedotools.shifter = (function () {
    var instance = shifterator.shifterator();
    var setfigure = instance.setfigure;
    instance.setfigure = function (_) {
        var arg = (_ && typeof _.node === "function") ? _.node() : _;
        setfigure.call(instance, arg);
        return instance;
    };
    return instance;
})();
