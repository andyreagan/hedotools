import { defineConfig, devices } from '@playwright/test';

// Browser tests load each module as a plain <script> alongside D3 v4 (from
// node_modules) and assert against the SVG it renders. No build step — the
// fixtures point straight at the js/ sources, so tests run against current code.
export default defineConfig({
    testDir: './tests/browser',
    testMatch: '**/*.spec.mjs',
    fullyParallel: true,
    reporter: 'list',
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
