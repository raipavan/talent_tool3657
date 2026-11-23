import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/* Redirect /admin cleanly to /admin/index.html during dev/preview. */
const adminIndex = (req: object, _res: unknown, next: () => void) => {
  const request = req as { url?: string };
  if (request.url === '/admin' || request.url === '/admin/') request.url = '/admin/index.html';
  next();
};
const contentManager = (): Plugin => ({
  name: 'content-manager-index',
  configureServer(server) {
    server.middlewares.use(adminIndex);
  },
  configurePreviewServer(server) {
    server.middlewares.use(adminIndex);
  },
});

export default defineConfig({
  plugins: [react(), contentManager()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4050',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4050',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://localhost:4050',
        changeOrigin: true,
      },
      '/robots.txt': {
        target: 'http://localhost:4050',
        changeOrigin: true,
      },
    },
  },
  build: {
    assetsDir: 'bundle',
  },
});
