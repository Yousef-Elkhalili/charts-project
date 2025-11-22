import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/charts-project/',   // ВАЖНО: имя репозитория, со слешами
});
