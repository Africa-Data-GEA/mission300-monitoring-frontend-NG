import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Topbar } from '@/components/layout/topbar'
// Notifications are backend-connected (useNotifications, a real query) -
// renderWithRouter alone has no QueryClientProvider, so it must be
// renderWithProviders here even though these tests don't touch filters.
import { renderWithProviders as renderWithRouter } from '@/test/render'

describe('Topbar', () => {
  it('renders as a banner landmark', () => {
    renderWithRouter(<Topbar />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the product mark', () => {
    renderWithRouter(<Topbar />)

    expect(screen.getByText('Mission 300')).toBeInTheDocument()
  })

  describe('search', () => {
    it('has an accessible name', () => {
      renderWithRouter(<Topbar />)

      expect(
        screen.getByRole('searchbox', {
          name: /Search pages, KPIs, programs and projects/,
        }),
      ).toBeInTheDocument()
    })

    /*
     * Search is interactive and exposes matching navigation targets.
     */
    it('is active and shows matching destinations', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Topbar />)

      const search = screen.getByRole('searchbox')
      expect(search).toBeEnabled()

      await user.type(search, 'Programs')
      expect(screen.getByRole('button', { name: /ProgramsDelivery tracking/ })).toBeInTheDocument()
    })
  })

  describe('notifications', () => {
    it('conveys the unread count in its accessible name', async () => {
      renderWithRouter(<Topbar />)

      expect(
        await screen.findByRole('button', { name: /Notifications, 3 unread/ }),
      ).toBeInTheDocument()
    })

    it('opens the notification panel and can mark all as read', async () => {
      const user = userEvent.setup()
      renderWithRouter(<Topbar />)

      await user.click(await screen.findByRole('button', { name: /Notifications, 3 unread/ }))
      expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
      expect(screen.getByText('Metering submission awaiting validation')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Mark all as read' }))
      expect(await screen.findByRole('button', { name: /Notifications, 0 unread/ })).toBeInTheDocument()
    })
  })

  it('exposes a filter toggle when the page supports executive filters', async () => {
    const user = userEvent.setup()
    let open = false
    renderWithRouter(
      <Topbar filtersOpen={open} onToggleFilters={() => { open = true }} />,
    )

    const toggle = screen.getByRole('button', { name: 'Open filters' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(open).toBe(true)
  })
})
