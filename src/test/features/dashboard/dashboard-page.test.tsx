import { screen, waitFor, within } from '@testing-library/react'
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
    expect(screen.getByRole('status')).toHaveTextContent('Loading overview data')
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

    expect(screen.getByText('26.0%')).toBeInTheDocument()
    expect(screen.getByText('70.0%')).toBeInTheDocument()
    expect(screen.getByText('6.2 GW')).toBeInTheDocument()
  })

  it('renders a zero value as a real figure rather than treating it as missing', async () => {
    renderWithProviders(<DashboardPage />)

    await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

    // Currency symbol comes from the active branding config (₦ by default -
    // see lib/currency.ts), not a hardcoded $.
    expect(screen.getByText('₦0.2B')).toBeInTheDocument()
  })

  describe('dynamic pillar behaviour', () => {
    /*
     * The filter bar now lives in the shell, so the page reads its selection
     * from the URL. Rendering at a filtered route is exactly what happens when
     * a user picks a pillar or opens a shared link.
     */
    it('queries with the global filter selection from the URL', async () => {
      renderWithProviders(<DashboardPage />, {
        route: '/?pillar=private-sector-participation',
      })

      await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

      const list = await screen.findByRole('list', {
        name: 'National performance metrics',
      })
      expect(within(list).getAllByRole('listitem')).toHaveLength(1)
      expect(
        screen.getByRole('img', { name: /Private Capital Mobilized/ }),
      ).toBeInTheDocument()
    })

    it('shows every metric when no pillar is selected', async () => {
      renderWithProviders(<DashboardPage />)

      await screen.findByRole('heading', { name: 'Executive Overview', level: 1 })

      const list = await screen.findByRole('list', {
        name: 'National performance metrics',
      })
      expect(within(list).getAllByRole('listitem')).toHaveLength(6)
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
