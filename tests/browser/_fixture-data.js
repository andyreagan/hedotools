// Shared synthetic data for the browser fixtures. Loaded via <script> so each
// fixture stays a standalone, browser-openable file without re-deriving the
// same LabMT-style word-vector boilerplate in every one.
window.hedoTest = (function () {
    // deterministic pseudo-random in [0, 1)
    function hash(n) { var r = Math.sin(n) * 43758.5453; return r - Math.floor(r); }
    // N word labels
    function words(N) { var w = []; for (var i = 0; i < N; i++) w.push("word" + i); return w; }
    // N happiness scores in [1, 9]
    function lens(N) { var l = []; for (var i = 0; i < N; i++) l.push(1 + hash(i * 12.9898) * 8); return l; }
    // a length-N frequency vector, varied by seed
    function freq(seed, N) {
        var f = [];
        for (var i = 0; i < N; i++) f.push(10 + Math.floor(hash((seed + 1) * 3.1 + i * 7.7) * 500));
        return f;
    }
    return { hash: hash, words: words, lens: lens, freq: freq };
})();
