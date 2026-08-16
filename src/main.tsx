import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { environment } from '@/config/environment'
import './index.css'

/**
 * Mock and hybrid modes no longer use a service worker. Importing
 * mocks/handlers.ts is what actually registers every route with
 * mocks/local-router.ts (each handler file's `http.get(...)` call has that
 * registration as a side effect) — dispatchLocalRequest has nothing to match
 * against until this import has run at least once, so it must complete
 * before the app renders and starts firing queries. `backend` mode skips
 * this entirely: it never touches mocks/* and goes straight to a real
 * `fetch()` against `VITE_API_BASE_URL`.
 */
async function loadMockHandlers() {
  if (!environment.usesBrowserMocks) return
  await import('@/mocks/handlers')
}

loadMockHandlers().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
})
