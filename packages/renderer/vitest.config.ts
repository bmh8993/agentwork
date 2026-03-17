import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@opencode/skill-schema': path.resolve(__dirname, '../skill-schema/src'),
      '@opencode/skill-domain': path.resolve(__dirname, '../skill-domain/src'),
      '@opencode/skill-io': path.resolve(__dirname, '../skill-io/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    setupFiles: ['./src/test-setup.ts'],
  },
})
