import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { RequireAuth } from '@/features/auth/require-auth'
import { saveAuthSession } from '@/features/auth/auth-session'

function renderProtectedRoute() {
  const router = createMemoryRouter(
    [
      { path: '/account/login', element: <h1>Sign in</h1> },
      {
        path: '/dashboard',
        element: (
          <RequireAuth>
            <h1>Protected dashboard</h1>
          </RequireAuth>
        ),
      },
    ],
    { initialEntries: ['/dashboard'] },
  )

  render(<RouterProvider router={router} />)
  return router
}

afterEach(() => sessionStorage.clear())

describe('authentication integration', () => {
  it('redirects an unauthenticated visitor to sign in', async () => {
    const router = renderProtectedRoute()

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/account/login')
  })

  it('allows a valid backend session into protected routes', () => {
    saveAuthSession({
      accessToken: 'valid-token',
      expiresAt: '2099-01-01T00:00:00Z',
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'system-administrator',
      },
    })

    renderProtectedRoute()

    expect(screen.getByRole('heading', { name: 'Protected dashboard' })).toBeInTheDocument()
  })

  it('rejects an expired backend session', async () => {
    saveAuthSession({
      accessToken: 'expired-token',
      expiresAt: '2020-01-01T00:00:00Z',
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'system-administrator',
      },
    })

    renderProtectedRoute()

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(sessionStorage.getItem('m300-auth')).toBeNull()
  })
})
