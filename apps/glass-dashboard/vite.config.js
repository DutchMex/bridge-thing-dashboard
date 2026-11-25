import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { bridgething, daemonProxy } from './scripts/bridgething.ts';

export default defineConfig(async ({ command }) => ({
  plugins: [react(), bridgething()],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  server: command === 'serve' ? { host: true, proxy: await daemonProxy() } : {},
}));
