import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Allows mobile devices on same Wi-Fi to connect
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});

