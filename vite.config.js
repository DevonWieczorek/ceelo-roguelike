import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ceelo-roguelike/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
