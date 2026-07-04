import { createStartHandler, defaultRenderHandler } from '@tanstack/start/server'
import { createRouter } from './router'

const router = createRouter()

export default createStartHandler({
  createRouter,
  getRouterManifest: () => ({
    routes: {},
  }),
})(defaultRenderHandler)