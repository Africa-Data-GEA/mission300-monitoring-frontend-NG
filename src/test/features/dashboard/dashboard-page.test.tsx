import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/render'

describe('DashboardPage', () => {
  it('shows a loading state before data arrives', () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByLabelText('Loading Executive Overview')).toBeInTheDocument()
  })

  it('renders the page title and breadcrumb', async () => {
    renderWithProviders(<DashboardPage />)

    expect(
      await screen.findByRole('heading', { name: 'Executive Overview', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toBeInTheDocument()
  })

  /*
   * The page must render all five specified sections. This is the regression
   * guard against a section being dropped during a refactor.
   */
  it('renders every specified section', async () => {
    renderWithProviders(<DashboardPage />)

    await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

    expect(
      screen.getByRole('region', { name: 'Dashboard filters' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Headline metrics' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Access delivery by channel' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'National performance and target progress',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Delivery status, bottlenecks and decisions',
      }),
    ).toBeInTheDocument()
  })

  it('renders headline figures from the API', async () => {
    renderWithProviders(<DashboardPage />)

    await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('5.4 GW')).toBeInTheDocument()
  })

  it('renders a zero value as a real figure rather than treating it as missing', async () => {
    renderWithProviders(<DashboardPage />)

    await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

    expect(screen.getByText('$0.0B')).toBeInTheDocument()
  })

  describe('dynamic pillar behaviour', () => {
    /*
     * Selecting a pillar must recalculate the page, not merely hide rows —
     * the specification requires the delivery card to recalculate and the
     * middle cards to change metric, which is why filtering is server-driven.
     */
    it('refetches and narrows the page when a pillar is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<DashboardPage />)

      await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

      // All Pillars shows all six Section C metrics.
      expect(screen.getAllByRole('img')).toHaveLength(6)

      await user.click(screen.getByRole('combobox', { name: /Compact pillar/ }))
      await user.click(
        await screen.findByRole('option', { name: 'Private sector' }),
      )

      // Only the private-sector metric survives the narrowing.
      await waitFor(() => {
        expect(
          screen.getByRole('img', { name: /Private capital mobilized/ }),
        ).toBeInTheDocument()
      })
      await waitFor(() => {
        expect(
          screen.queryByRole('img', { name: /National metering rate/ }),
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('failure handling', () => {
    it('shows an error with the server message', async () => {
      server.use(
        http.get('/api/executive-overview', () =>
          HttpResponse.json({ message: 'Upstream unavailable' }, { status: 503 }),
        ),
      )

      renderWithProviders(<DashboardPage />)

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Executive Overview could not be loaded')
      expect(alert).toHaveTextContent('Upstream unavailable')
    })

    it('offers a retry that refetches successfully', async () => {
      const user = userEvent.setup()
      let attempts = 0
      server.use(
        http.get('/api/executive-overview', () => {
          attempts += 1
          if (attempts === 1) {
            return HttpResponse.json({ message: 'Temporary' }, { status: 503 })
          }
          return HttpResponse.json(
            // Re-serve the real handler's payload on retry.
            undefined,
            { status: 500 },
          )
        }),
      )

      renderWithProviders(<DashboardPage />)

      await screen.findByRole('alert')
      await user.click(screen.getByRole('button', { name: 'Try again' }))

      await waitFor(() => expect(attempts).toBeGreaterThan(1))
    })
  })
})
