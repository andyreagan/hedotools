import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Unit tests only. The specs under tests/browser are Playwright tests
        // (they use @playwright/test) and must not be collected by vitest.
        include: ['tests/unit/**/*.test.{js,mjs}'],
    },
});
