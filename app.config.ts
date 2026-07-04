import { createApp } from 'vinxi';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default createApp({
  routers: [
    {
      type: 'static',
      name: 'public',
      dir: './public',
      base: '/',
    },
    {
      type: 'client',
      name: 'client',
      handler: './app/client.tsx',
      target: 'browser',
      plugins: () => [
        TanStackRouterVite({
          routesDirectory: './app/routes',
          generatedRouteTree: './app/routeTree.gen.ts',
        }),
      ],
    },
    {
      type: 'http',
      name: 'ssr',
      handler: './app/ssr.tsx',
      target: 'server',
      plugins: () => [
        TanStackRouterVite({
          routesDirectory: './app/routes',
          generatedRouteTree: './app/routeTree.gen.ts',
        }),
      ],
    },
  ],
});
