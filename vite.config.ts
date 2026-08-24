import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig, type Plugin } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

/**
 * The app has no real backend in development — every /api call is meant to
 * be intercepted by MSW's service worker before it ever reaches this dev
 * server. If the worker misses a request (most commonly right after Vite
 * triggers a full-page reload, while the browser is still swapping in the
 * newly installed service worker), Vite's default SPA history fallback would
 * otherwise answer with index.html, and the request fails with a confusing
 * "expected JSON but received text/html" contract error that gives no hint
 * of the real cause.
 *
 * Registered directly (not returned from configureServer) so it runs before
 * Vite's internal middlewares, including the HTML fallback — an unmatched
 * /api/* request gets an honest 404 instead, and the console message says
 * plainly that the mock worker missed it.
 */
function apiFallbackPlugin(apiProxyEnabled = false): Plugin {
  return {
    name: 'api-fallback-404',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (apiProxyEnabled) return next()
        if (!req.url?.startsWith('/api/')) return next()

        res.statusCode = 404
        res.setHeader('content-type', 'application/json')
        res.end(
          JSON.stringify({
            message:
              `No mock handler matched ${req.url} — the mock service worker ` +
              'did not intercept this request. Hard-reload the page to ' +
              're-register it.',
          }),
        )
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      apiFallbackPlugin(Boolean(proxyTarget)),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      /*
       * CSS is not processed for tests. Assertions check class names and inline
       * styles, never computed styles, so running the Tailwind pipeline per test
       * file bought nothing and dominated the run time.
       */
      css: false,
      /*
       * jsdom environment setup is expensive on Windows. Left unbounded, enough
       * workers spawn to starve each other and trivial synchronous renders time
       * out. Capping workers keeps the suite comfortably inside the timeout.
       */
      testTimeout: 20_000,
      hookTimeout: 20_000,
      maxWorkers: 4,
    },
  }
})
