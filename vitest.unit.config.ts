import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json-summary', 'lcov'],
      lines: 0.8,
      statements: 0.8,
      functions: 0.8,
      branches: 0.8,
    },
  },
});
