// Flat config (ESLint 9+). Parse-only lint (no rules): catches syntax errors
// in the browser-global module sources without imposing style. The js/ files
// are classic scripts (they attach to a global `hedotools` namespace and use
// global d3/jQuery), so sourceType is 'script', not 'module'.
export default [
    {
        // vendored third-party code (Jason Davies' word cloud) — not ours to lint
        ignores: ['js/cloud.min.js', 'js/d3.layout.cloud.js', 'js/hedotools.v4.js'],
    },
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'script',
        },
        rules: {},
    },
];
