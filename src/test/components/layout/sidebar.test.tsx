import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Sidebar } from '@/components/layout/sidebar'
import { NAVIGATION } from '@/config/navigation'
import { saveAuthSession } from '@/features/auth/auth-session'
import { canRoleReachModule } from '@/features/auth/role-access'
import { renderWithProviders as renderWithRouter } from '@/test/render'

describe('Sidebar', () => {
  // Sidebar filters every nav item through canUserReachModule(session.user,
  // item.moduleKey) - with no session, everything is filtered out and the
  // nav renders empty. system-administrator has the 'all' access sentinel,
  // which covers every item except the ones ADMIN_ALL_EXCLUDES carves back
  // out (institution-overview is an Institutional Data Provider's own
  // self-scoped page), so these structural tests assert against the items
  // the role can actually reach rather than all of NAVIGATION.
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

  const visibleItems = () =>
    NAVIGATION.flatMap((group) => group.items).filter((item) =>
      canRoleReachModule('system-administrator', item.moduleKey),
    )

  it('is exposed as the primary navigation landmark', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders the brand mark', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByAltText(/Mission 300/)).toHaveClass('h-10')
  })

  it('renders the signed-in user and role', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('System Administrator')).toBeInTheDocument()
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
    // The dialog's "Full name" field is seeded from the fetched account
    // record (GET /api/users/me), not the session's own cached name - usr-011
    // resolves to Grace Etim in the mock administration data.
    expect(screen.getByLabelText('Full name')).toHaveValue('Grace Etim')
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
    for (const item of visibleItems()) {
      expect(within(nav).getByText(item.label)).toBeInTheDocument()
    }
  })

  it('hides a nav item the role cannot reach', () => {
    renderWithRouter(<Sidebar />)

    const hidden = NAVIGATION.flatMap((group) => group.items).filter(
      (item) => !canRoleReachModule('system-administrator', item.moduleKey),
    )
    expect(hidden.length).toBeGreaterThan(0)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const item of hidden) {
      expect(within(nav).queryByText(item.label)).not.toBeInTheDocument()
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
      ).toHaveAttribute('href', '/dashboard')
    })

    it('renders Reports & exports as a dropdown that reveals its four pages', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Sidebar />)

      const reports = screen.getByRole('button', { name: /Reports & exports/ })
      expect(reports).toHaveAttribute('aria-expanded', 'false')

      await user.click(reports)

      expect(reports).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('link', { name: 'Report Builder' })).toHaveAttribute('href', '/reports/builder')
      expect(screen.getByRole('link', { name: 'Compact & CPR export' })).toHaveAttribute('href', '/reports/exports')
      expect(screen.getByRole('link', { name: 'KPI methodology export' })).toHaveAttribute('href', '/reports/methodology')
      expect(screen.getByRole('link', { name: 'Saved reports' })).toHaveAttribute('href', '/reports/saved')
    })

    it('opens the Reports & exports dropdown on a reports page and marks that page active', () => {
      renderWithRouter(<Sidebar />, { route: '/reports/saved' })

      expect(screen.getByRole('button', { name: /Reports & exports/ })).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('link', { name: 'Saved reports' })).toHaveClass('bg-chart-accent')
    })

    it('keeps the unavailable-page description accessible for planned items', () => {
      renderWithRouter(<Sidebar />)

      expect(
        screen.getByText('This section is not yet available.'),
      ).toHaveClass('sr-only')
    })

    it('links exactly the items marked ready', () => {
      renderWithRouter(<Sidebar />)

      const readyCount = visibleItems().filter(
        (item) => item.ready && !item.children,
      ).length

      // Scoped to the nav landmark: the header brand mark is also an <a>,
      // but it isn't one of NAVIGATION's own items.
      const nav = screen.getByRole('navigation', { name: 'Primary' })
      expect(within(nav).getAllByRole('link')).toHaveLength(readyCount)
    })
  })

  describe('active state', () => {
    it('fills the current route with the brand green and reverses the text', () => {
      renderWithRouter(<Sidebar />, { route: '/dashboard' })

      const active = screen.getByRole('link', { name: /Executive Overview/ })
      expect(active).toHaveClass('bg-chart-accent', 'text-brand-900')
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
      expect(inactive).not.toHaveClass('bg-chart-accent')
    })

    it('uses the inactive tint for other ready pages', () => {
      renderWithRouter(<Sidebar />)

      const programs = screen.getByRole('link', { name: /Programs/ })
      expect(programs).toHaveClass('bg-surface-sunken/10')
      expect(programs).not.toHaveClass('border')
    })

    /*
     * Executive Overview lives at "/", so without `end` it would stay
     * highlighted on every route.
     */
    it('does not mark the index route as active on other routes', () => {
      renderWithRouter(<Sidebar />, { route: '/bottlenecks' })

      expect(
        screen.getByRole('link', { name: /Executive Overview/ }),
      ).not.toHaveClass('bg-chart-accent')
    })
  })

  it('accepts a className override', () => {
    renderWithRouter(<Sidebar className="hidden lg:flex" />)

    expect(screen.getByRole('complementary')).toHaveClass(
      'hidden',
    )
  })
})
