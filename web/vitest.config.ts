// vitest.config.ts

/// <reference types="vitest" />

import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig, // ⬅️ on réutilise 100 % du vite.config
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/__tests__/',
          'src/tests/fixtures/',
          '**/*.d.ts',
          '**/*.config.*',
          'dist/',
        ],
        thresholds: {
          global: { branches: 70, functions: 70, lines: 70, statements: 70 },
        },
      },
    },
  })
);
