import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
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
})
