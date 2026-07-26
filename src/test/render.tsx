import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as rtlRender } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { ReactElement, ReactNode } from 'react'
import { GlobalFiltersProvider } from '@/app/global-filters'

function createTestQueryClient() {
  // Retries off, so a failing request surfaces immediately rather than
  // timing the test out.
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

/**
 * Renders a component inside a memory router. Use for components that only
 * need routing context (navigation, links).
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  const router = createMemoryRouter([{ path: '*', element: ui }], {
    initialEntries: [route],
  })

  return rtlRender(<RouterProvider router={router} />)
}

/**
 * Renders a component inside the providers it has in production: a fresh
 * QueryClient, a memory router, and the global filter store.
 *
 * The filter provider is included because it is mounted by AppShell around
 * every page — a page that reads filters must be testable the same way it
 * runs.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  const queryClient = createTestQueryClient()

  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: <GlobalFiltersProvider>{ui}</GlobalFiltersProvider>,
      },
    ],
    { initialEntries: [route] },
  )

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

/** Wraps children in a QueryClientProvider without any routing. */
export function QueryWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  )
}
