import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
type ViteConfigWithTest = import('vite').UserConfig & {
  // Allow Vitest-specific config without pulling in its full types
  test?: unknown;
};

const config: ViteConfigWithTest = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
};

// https://vite.dev/config/
export default defineConfig(config);
