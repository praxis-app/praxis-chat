import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules/**', 'dist/**', 'view/**', 'common/**'],
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
  },
});
