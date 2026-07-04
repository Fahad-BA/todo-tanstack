import { defineConfig } from 'vinxi';
import { tanstackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  routers: {
    public: {
      type: 'static',
      dir: './public',
      base: '/',
    },
    client: {
      type: 'client',
      handler: './app/client.tsx',
      target: 'browser',
      plugins: () => [tanstackRouterVite()],
    },
    ssr: {
      type: 'http',
      handler: './app/ssr.tsx',
      target: 'server',
    },
  },
});