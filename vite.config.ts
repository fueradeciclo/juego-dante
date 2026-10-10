import { defineConfig } from 'vite';
export default defineConfig({
  root: 'game',
  base: './',
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  preview: { host: '0.0.0.0', port: 4173, strictPort: true },
  build: { outDir: '../builds/web', emptyOutDir: true, target: ['es2022', 'safari16'], rollupOptions:{input:{juego:'game/index.html',animaciones:'game/animaciones.html'}} },
});
