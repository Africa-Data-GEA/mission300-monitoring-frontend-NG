import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Topbar } from '@/components/layout/topbar'

describe('Topbar', () => {
  it('renders as a banner landmark', () => {
    render(<Topbar />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the product mark', () => {
    render(<Topbar />)

    expect(screen.getByText('M300')).toBeInTheDocument()
  })

  it('renders the signed-in user', () => {
    render(<Topbar />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  describe('search', () => {
    it('has an accessible name', () => {
      render(<Topbar />)

      expect(
        screen.getByRole('searchbox', {
          name: /Search navigations, KPIs, programs and pillars/,
        }),
      ).toBeInTheDocument()
    })

    /*
     * Search has no endpoint yet. It is disabled rather than wired to a no-op
     * so nobody mistakes it for a working feature during review.
     */
    it('is disabled until a search endpoint exists', () => {
      render(<Topbar />)

      expect(screen.getByRole('searchbox')).toBeDisabled()
    })
  })

  describe('notifications', () => {
    it('conveys the unread count in its accessible name', () => {
      render(<Topbar />)

      expect(
        screen.getByRole('button', { name: /Notifications, 99 or more unread/ }),
      ).toBeInTheDocument()
    })

    it('is disabled until a notifications endpoint exists', () => {
      render(<Topbar />)

      expect(screen.getByRole('button', { name: /Notifications/ })).toBeDisabled()
    })
  })

  it('hides the decorative user initials from assistive technology', () => {
    render(<Topbar />)

    expect(screen.getByText('JO')).toHaveAttribute('aria-hidden', 'true')
  })
})
