import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sidebar } from '@/components/layout/sidebar'
import { NAVIGATION } from '@/config/navigation'
import { renderWithRouter } from '@/test/render'

describe('Sidebar', () => {
  it('is exposed as the primary navigation landmark', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
  })

  it('renders the product name', () => {
    renderWithRouter(<Sidebar />)

    expect(screen.getByText('Mission 300')).toBeInTheDocument()
    expect(screen.getByText('Monitoring Dashboard')).toBeInTheDocument()
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

  describe('built versus planned pages', () => {
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

    it('renders unbuilt items as disabled buttons, not links', () => {
      renderWithRouter(<Sidebar />)

      const unbuilt = screen.getByRole('button', { name: /KPI explorer/ })
      expect(unbuilt).toBeDisabled()
      expect(
        screen.queryByRole('link', { name: /KPI explorer/ }),
      ).not.toBeInTheDocument()
    })

    it('explains unavailability to screen-reader users', () => {
      renderWithRouter(<Sidebar />)

      expect(screen.getByText('This section is not yet available.')).toBeInTheDocument()
    })

    it('links exactly the items marked ready', () => {
      renderWithRouter(<Sidebar />)

      const readyCount = NAVIGATION.flatMap((group) => group.items).filter(
        (item) => item.ready,
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
     * to the content.
     */
    it('renders inactive items on a light tint with no border', () => {
      renderWithRouter(<Sidebar />, { route: '/bottlenecks' })

      const inactive = screen.getByRole('link', { name: /Executive Overview/ })
      expect(inactive).toHaveClass('bg-surface-sunken')
      expect(inactive).not.toHaveClass('border')
      expect(inactive).not.toHaveClass('bg-brand-800')
    })

    it('tints unbuilt items the same way', () => {
      renderWithRouter(<Sidebar />)

      const unbuilt = screen.getByRole('button', { name: /KPI explorer/ })
      expect(unbuilt).toHaveClass('bg-surface-sunken')
      expect(unbuilt).not.toHaveClass('border')
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

    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveClass(
      'hidden',
    )
  })
})
