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
async function enableMocking() {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return

  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
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
