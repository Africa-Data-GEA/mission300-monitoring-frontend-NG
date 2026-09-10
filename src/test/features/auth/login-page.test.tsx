import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { LoginPage } from '@/features/auth/login-page'
import { PasswordPage } from '@/features/auth/password-page'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'
import { server } from '@/mocks/server'

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/account/login', element: <LoginPage /> },
      { path: '/account/password', element: <PasswordPage /> },
      { path: '/account/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/dashboard', element: <h1>Dashboard home</h1> },
    ],
    { initialEntries: ['/account/login'] },
  )

  return {
    router,
    ...render(<RouterProvider router={router} />),
  }
}

afterEach(() => sessionStorage.clear())

describe('LoginPage', () => {
  it('starts with email and validates before contacting the API', async () => {
    const user = userEvent.setup()
    renderLogin()

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Email address'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address')
  })

  it('identifies the account, reveals password, and can return to email', async () => {
    const user = userEvent.setup()
    const { router } = renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'g.etim@emrc.ng')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Welcome back, Grace' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/account/password')
    expect(screen.getByLabelText('Password')).toHaveFocus()
    expect(screen.getByText('g.etim@emrc.ng')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByLabelText('Email address')).toHaveValue('g.etim@emrc.ng')
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/account/login')
  })

  it('toggles password visibility and completes a valid login', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'g.etim@emrc.ng')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const password = await screen.findByLabelText('Password')

    await user.type(password, 'M300demo!')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard home' })).toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(sessionStorage.getItem('m300-auth') ?? '{}')).toMatchObject({
        accessToken: 'mock-token-usr-011',
        user: { email: 'g.etim@emrc.ng', role: 'system-administrator' },
      })
    })
  })

  it('shows the sign-in loader on the first click while the request is pending', async () => {
    const user = userEvent.setup()
    let finishLogin: (() => void) | undefined
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'g.etim@emrc.ng')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByLabelText('Password')

    server.use(
      http.post('/api/auth/login', async () => {
        await new Promise<void>((resolve) => {
          finishLogin = resolve
        })
        return HttpResponse.json({
          accessToken: 'token-123',
          user: {
            id: 'user-1',
            name: 'Grace Etim',
            email: 'g.etim@emrc.ng',
            role: 'system-administrator',
          },
        })
      }),
    )

    await user.type(screen.getByLabelText('Password'), 'M300demo!')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled()
    await waitFor(() => expect(finishLogin).toBeTypeOf('function'))
    finishLogin?.()
    expect(await screen.findByRole('heading', { name: 'Dashboard home' })).toBeInTheDocument()
  })

  it('surfaces an incorrect password without leaving the login flow', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'g.etim@emrc.ng')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.type(await screen.findByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The password you entered is incorrect.',
    )
    expect(screen.getByLabelText('Password')).toHaveValue('wrong-password')
  })

  it('opens the forgot-password page with the identified email and requests a reset', async () => {
    const user = userEvent.setup()
    const { router } = renderLogin()

    await user.type(screen.getByLabelText('Email address'), 'g.etim@emrc.ng')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await screen.findByLabelText('Password')
    await user.click(screen.getByRole('link', { name: 'Forgot password?' }))

    expect(router.state.location.pathname).toBe('/account/forgot-password')
    expect(screen.getByLabelText('Email address')).toHaveValue('g.etim@emrc.ng')

    await user.click(screen.getByRole('button', { name: 'Send reset instructions' }))

    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText(/reset instructions have been sent/i)).toBeInTheDocument()
  })
})
