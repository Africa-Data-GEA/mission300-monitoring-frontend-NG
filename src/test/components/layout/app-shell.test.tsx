import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '@/components/layout/app-shell'
import { saveAuthSession } from '@/features/auth/auth-session'

// Both are fire-and-forget background warmers unrelated to what this file
// tests (drawer/filter-bar behaviour), and their async/deferred nature (a
// setTimeout, a queryClient.prefetchQuery) can otherwise resolve mid-test
// and race with assertions. Stub them so this file only exercises AppShell's
// own chrome.
vi.mock('@/app/route-chunks', () => ({ prefetchRouteChunks: () => undefined }))
vi.mock('@/features/dashboard/api', () => ({ prefetchExecutiveOverview: () => Promise.resolve() }))

/**
 * AppShell mounts the global filter bar, which fetches its options, so the
 * shell needs a QueryClient as well as a router — the same providers it has in
 * production.
 */
function renderShell(route = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          // handle.globalFilters mirrors the real router (src/app/router.tsx):
          // AppShell only renders the filter bar for routes that opt in.
          {
            index: true,
            element: <p>Home content</p>,
            handle: { globalFilters: true },
          },
          { path: 'other', element: <p>Other content</p> },
          // The drawer's first real Sidebar link points at /dashboard -
          // defined here so "follow a nav link" navigates successfully
          // instead of 404ing (a wildcard sibling here would instead shadow
          // the index route above, which is worse).
          { path: 'dashboard', element: <p>Dashboard content</p> },
        ],
      },
    ],
    { initialEntries: [route] },
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('AppShell', () => {
  // Sidebar (rendered inside AppShell) filters nav items through
  // canUserReachModule(session.user, item.moduleKey) - with no session,
  // the nav renders empty, which breaks anything that queries a nav link.
  beforeEach(() => {
    saveAuthSession({
      accessToken: 'mock-token-usr-011',
      user: {
        id: 'usr-011',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'system-administrator',
      },
    })
  })
  afterEach(() => sessionStorage.clear())

  it('renders the top bar', () => {
    renderShell()

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the primary navigation', () => {
    renderShell()

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('opens and closes the global filter bar from the sticky header', async () => {
    const user = userEvent.setup()
    renderShell()

    expect(screen.queryByRole('region', { name: 'Dashboard filters' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open filters' }))
    expect(
      await screen.findByRole('region', { name: 'Dashboard filters' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close filter panel' }))
    expect(screen.queryByRole('region', { name: 'Dashboard filters' })).not.toBeInTheDocument()
  })

  it('renders routed content in a main landmark', () => {
    renderShell()

    expect(screen.getByRole('main')).toHaveTextContent('Home content')
  })

  it('swaps content when the route changes without losing the chrome', () => {
    renderShell('/other')

    expect(screen.getByRole('main')).toHaveTextContent('Other content')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('exposes exactly one main landmark', () => {
    renderShell()

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  describe('responsive navigation', () => {
    /*
     * The persistent sidebar is hidden below the lg breakpoint, so a drawer
     * has to take its place — otherwise the whole information architecture is
     * unreachable on a tablet or phone.
     */
    it('hides the persistent sidebar below the large breakpoint', () => {
      renderShell()

      expect(screen.getByRole('complementary')).toHaveClass(
        'hidden',
        'lg:flex',
      )
    })

    it('offers a drawer toggle', () => {
      renderShell()

      expect(
        screen.getByRole('button', { name: 'Open navigation' }),
      ).toBeInTheDocument()
    })

    it('opens a second navigation when the toggle is pressed', async () => {
      const user = userEvent.setup()
      renderShell()

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      expect(screen.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(2)
    })

    it('reflects the drawer state via aria-expanded', async () => {
      const user = userEvent.setup()
      renderShell()

      const toggle = screen.getByRole('button', { name: 'Open navigation' })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')

      await user.click(toggle)

      expect(
        screen.getByRole('button', { name: 'Close navigation' }),
      ).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes the drawer on Escape', async () => {
      const user = userEvent.setup()
      renderShell()

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))
      expect(screen.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(2)

      await user.keyboard('{Escape}')

      expect(screen.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(1)
    })

    /*
     * Following a link must dismiss the drawer, or the new page opens behind
     * the overlay.
     */
    it('closes the drawer when a link is followed', async () => {
      const user = userEvent.setup()
      renderShell()

      await user.click(screen.getByRole('button', { name: 'Open navigation' }))

      const drawer = screen.getAllByRole('navigation', { name: 'Primary' })[1]!
      const [link] = Array.from(drawer.querySelectorAll('a'))
      await user.click(link!)

      expect(screen.getAllByRole('navigation', { name: 'Primary' })).toHaveLength(1)
    })
  })
})
