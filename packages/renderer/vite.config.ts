import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@opencode/run-orchestrator': path.resolve(__dirname, '../run-orchestrator/src'),
      '@opencode/skill-schema': path.resolve(__dirname, '../skill-schema/src'),
      '@opencode/skill-domain': path.resolve(__dirname, '../skill-domain/src'),
      '@opencode/skill-io': path.resolve(__dirname, '../skill-io/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
