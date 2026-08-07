import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Sidebar } from '@/components/layout/sidebar'
import { NAVIGATION } from '@/config/navigation'
import { renderWithProviders as renderWithRouter } from '@/test/render'

describe('Sidebar', () => {
  it('is exposed as the primary navigation landmark', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders the brand mark', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByAltText('gEApp')).toHaveClass('h-11')
  })

  it('renders the signed-in user and role', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('hides the decorative user initials from assistive technology', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByText('JD')).toHaveAttribute('aria-hidden', 'true')
  })

  it('opens account actions, profile editing and the help centre', async () => {
    const user = userEvent.setup()
    renderWithRouter(<Sidebar />)

    await user.click(screen.getByRole('button', { name: 'Open user menu' }))
    expect(screen.getByRole('button', { name: 'View and edit profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help centre' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View and edit profile' }))
    expect(screen.getByRole('dialog', { name: 'Your profile' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toHaveValue('John Doe')
  })

  it('renders every navigation group heading', () => {
    renderWithRouter(<Sidebar />)

    for (const group of NAVIGATION) {
      expect(screen.getByText(group.label)).toBeInTheDocument()
    }
  })

  it('renders every navigation item', () => {
    renderWithRouter(<Sidebar />)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const group of NAVIGATION) {
      for (const item of group.items) {
        expect(within(nav).getByText(item.label)).toBeInTheDocument()
      }
    }
  })

  describe('navigation readiness', () => {
    /*
     * Pages that do not exist yet must not render as links — a link that goes
     * nowhere is worse than a control that is visibly unavailable.
     */
    it('renders ready items as links', () => {
      renderWithRouter(<Sidebar />)

      expect(
        screen.getByRole('link', { name: /Executive Overview/ }),
      ).toHaveAttribute('href', '/')
    })

    it('renders Reports & exports as a ready link', () => {
      renderWithRouter(<Sidebar />)

      const reports = screen.getByRole('link', { name: /Reports & exports/ })
      expect(reports).toHaveAttribute('href', '/reports')
    })

    it('keeps the unavailable-page description accessible for planned items', () => {
      renderWithRouter(<Sidebar />)

      expect(
        screen.getByText('This section is not yet available.'),
      ).toHaveClass('sr-only')
    })

    it('links exactly the items marked ready', () => {
      renderWithRouter(<Sidebar />)

      const readyCount = NAVIGATION.flatMap((group) => group.items).filter(
        (item) => item.ready && !item.children,
      ).length

      expect(screen.getAllByRole('link')).toHaveLength(readyCount)
    })
  })

  describe('active state', () => {
    it('fills the current route with the brand green and reverses the text', () => {
      renderWithRouter(<Sidebar />, { route: '/' })

      const active = screen.getByRole('link', { name: /Executive Overview/ })
      expect(active).toHaveClass('bg-brand-800', 'text-text-inverse')
    })

    /*
     * Inactive items sit on a light tint rather than carrying a border: at
     * this density a border per row draws more attention to the chrome than
     * to the content. Ready-but-inactive links use a lighter (10% opacity)
     * tint than disabled/unbuilt items, so the two read as distinct states.
     */
    it('renders inactive items on a light tint with no border', () => {
      renderWithRouter(<Sidebar />, { route: '/bottlenecks' })

      const inactive = screen.getByRole('link', { name: /Executive Overview/ })
      expect(inactive).toHaveClass('bg-surface-sunken/10')
      expect(inactive).not.toHaveClass('border')
      expect(inactive).not.toHaveClass('bg-brand-800')
    })

    it('uses the inactive tint for other ready pages', () => {
      renderWithRouter(<Sidebar />)

      const reports = screen.getByRole('link', { name: /Reports & exports/ })
      expect(reports).toHaveClass('bg-surface-sunken/10')
      expect(reports).not.toHaveClass('border')
    })

    /*
     * Executive Overview lives at "/", so without `end` it would stay
     * highlighted on every route.
     */
    it('does not mark the index route as active on other routes', () => {
      renderWithRouter(<Sidebar />, { route: '/bottlenecks' })

      expect(
        screen.getByRole('link', { name: /Executive Overview/ }),
      ).not.toHaveClass('bg-brand-800')
    })
  })

  it('accepts a className override', () => {
    renderWithRouter(<Sidebar className="hidden lg:flex" />)

    expect(screen.getByRole('complementary')).toHaveClass(
      'hidden',
    )
  })
})
