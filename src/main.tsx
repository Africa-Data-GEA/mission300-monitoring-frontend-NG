import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import './index.css'

/**
 * In development the app runs entirely against MSW handlers, so the UI is
 * fully usable before gApp's backend exists. Set VITE_ENABLE_MOCKS=false to
 * point at a real API instead.
 */
/**
 * When mock handler code changes during development, MSW installs a new
 * service worker in the background — but the page you're looking at is
 * still controlled by the *old* one until you reload, so requests can miss
 * every handler that changed. Rather than requiring a manual hard reload
 * (the previous behaviour, surfaced as "No mock handler matched..." in the
 * console), reload automatically the one time control actually switches
 * over — the standard fix for this class of service-worker staleness.
 */
function reloadOnServiceWorkerUpdate() {
  if (!('serviceWorker' in navigator)) return
  let hasReloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloaded) return
    hasReloaded = true
    window.location.reload()
  })
}

async function enableMocking() {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return

  reloadOnServiceWorkerUpdate()

  const { worker } = await import('@/mocks/browser')

  /*
   * `warn` rather than `bypass`: an unmatched /api call silently falls through
   * to the dev server, which answers with the SPA shell and produces a
   * confusing JSON parse error downstream. Warning names the offending URL in
   * the console instead.
   */
  return worker.start({ onUnhandledRequest: 'warn' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
})
