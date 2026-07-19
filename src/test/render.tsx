import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as rtlRender } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { ReactElement, ReactNode } from 'react'

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
 * Renders a component inside the providers it needs in production: a fresh
 * QueryClient (retries off, so a failing request surfaces immediately instead
 * of timing out the test) and a memory router.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const router = createMemoryRouter([{ path: '*', element: ui }], {
    initialEntries: [route],
  })

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

/** Wraps children in a QueryClientProvider without any routing. */
export function QueryWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
