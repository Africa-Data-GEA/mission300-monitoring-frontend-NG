import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppShell } from '@/components/layout/app-shell'

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
  it('renders the top bar', () => {
    renderShell()

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the primary navigation', () => {
    renderShell()

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders the global filter bar', async () => {
    renderShell()

    expect(
      await screen.findByRole('region', { name: 'Dashboard filters' }),
    ).toBeInTheDocument()
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

      expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass(
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
