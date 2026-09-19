import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@/mocks/server'

// Every test runs against the same MSW handlers the app uses in development,
// so a contract change breaks tests rather than silently drifting.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

/*
 * jsdom does not implement the pointer-capture or scroll APIs that Radix
 * primitives call during open/close transitions. Without these stubs, any test
 * that opens a Select or Popover throws "hasPointerCapture is not a function".
 * These are environment gaps, not behaviour under test.
 *
 * Guarded on `Element` existing at all: a handful of test files declare
 * `@vitest-environment node` (real fetch/multipart integration tests that
 * need Node's own File/FormData classes throughout, not jsdom's), and this
 * setup file still runs for them - there is no DOM to patch there.
 */
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
}

// Radix measures available space via ResizeObserver, which jsdom also lacks.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
