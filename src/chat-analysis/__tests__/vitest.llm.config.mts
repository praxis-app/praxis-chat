import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/chat-analysis/**/*.{test,spec}.ts'],
  },
});
