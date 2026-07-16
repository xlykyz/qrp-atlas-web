import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://127.0.0.1:8001') },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: { reporter: ['text', 'html'] },
  },
});
