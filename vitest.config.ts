import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@opencode/skill-schema': path.resolve(__dirname, './packages/skill-schema/src'),
      '@opencode/skill-domain': path.resolve(__dirname, './packages/skill-domain/src'),
      '@opencode/skill-io': path.resolve(__dirname, './packages/skill-io/src'),
      '@opencode/installer': path.resolve(__dirname, './packages/installer/src'),
      '@opencode/run-orchestrator': path.resolve(__dirname, './packages/run-orchestrator/src'),
      '@opencode/logging': path.resolve(__dirname, './packages/logging/src'),
      '@opencode/generator': path.resolve(__dirname, './packages/generator/src'),
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test-gates/**/*.{test,spec}.{ts,tsx}', 'packages/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test-gates/', '**/*.test.ts']
    }
  }
})
