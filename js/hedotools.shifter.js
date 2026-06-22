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
