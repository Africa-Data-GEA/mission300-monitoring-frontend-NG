import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { SetPasswordPage } from '@/features/auth/set-password-page'

describe('SetPasswordPage', () => {
  it('redeems a backend password link and returns to sign-in', async () => {
    const router = createMemoryRouter([
      { path: '/account/reset-password', element: <SetPasswordPage /> },
      { path: '/account/login', element: <h1>Sign in</h1> },
    ], { initialEntries: ['/account/reset-password?token=one-time-token'] })
    render(<RouterProvider router={router} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('New password'), 'NewPassword123!')
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPassword123!')
    await user.click(screen.getByRole('button', { name: 'Save password' }))
    expect(await screen.findByText('Password set. You can now log in.')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
