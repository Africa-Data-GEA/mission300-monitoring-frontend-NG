import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppShell } from '@/components/layout/app-shell'

function renderShell(route = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <p>Home content</p> },
          { path: 'other', element: <p>Other content</p> },
        ],
      },
    ],
    { initialEntries: [route] },
  )

  return render(<RouterProvider router={router} />)
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

  /*
   * The sidebar is hidden below the lg breakpoint. This is a known gap —
   * there is no mobile navigation yet — and the assertion documents it so the
   * omission is deliberate rather than forgotten.
   */
  it('hides the sidebar below the large breakpoint', () => {
    renderShell()

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toHaveClass('hidden', 'lg:flex')
  })

  it('exposes exactly one main landmark', () => {
    renderShell()

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })
})
