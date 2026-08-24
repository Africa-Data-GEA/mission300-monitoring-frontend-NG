import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarDashboardPage } from '@/features/pillar-dashboard/pillar-dashboard-page'
import { renderRoutesWithProviders } from '@/test/render'

describe('PillarDashboardPage', () => {
  it('renders headline cards and linked delivery records for a pillar', async () => {
    renderRoutesWithProviders(
      [{ path: 'pillars/:pillar', element: <PillarDashboardPage /> }],
      { route: '/pillars/generation-network' },
    )

    expect(
      await screen.findByRole('heading', { name: 'Generation & Network' }, { timeout: 3000 }),
    ).toBeInTheDocument()

    const headlineCards = screen.getByRole('region', { name: 'Headline performance cards' })
    expect(headlineCards).toBeInTheDocument()
    // The indicator identifier is deliberately absent from headline cards — it
    // belongs on the indicator's KPI Explorer profile.
    expect(within(headlineCards).queryByText('M300-P1-003')).not.toBeInTheDocument()

    const delivery = screen.getByRole('table', {
      name: 'Programmes and projects contributing to this pillar',
    })
    expect(within(delivery).getByRole('link', { name: 'Transmission Rehabilitation Programme' })).toBeInTheDocument()
    expect(within(delivery).getByRole('link', { name: 'North East 330kV Line Upgrade' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search delivery records')).toBeInTheDocument()
    expect(screen.getByText('Record type')).toBeInTheDocument()

    // Priority bottlenecks is no longer part of the pillar dashboard.
    expect(
      screen.queryByRole('table', { name: 'Priority bottlenecks, most severe first' }),
    ).not.toBeInTheDocument()
    // Generation & Network carries the most Core Indicators of any pillar, so
    // this case renders far more ApexCharts than the others and exceeds the
    // default 20s budget in jsdom on a slow machine. The assertions themselves
    // are fast — only the render is heavy — so the timeout is raised rather
    // than the coverage reduced.
  }, 60_000)

  it('shows a DisCo-level performance breakdown for Financially Viable Utilities', async () => {
    renderRoutesWithProviders(
      [{ path: 'pillars/:pillar', element: <PillarDashboardPage /> }],
      { route: '/pillars/financially-viable-utilities' },
    )

    expect(
      await screen.findByRole('heading', { name: 'Financially Viable Utilities' }, { timeout: 3000 }),
    ).toBeInTheDocument()

    const table = screen.getByRole('table', { name: 'Distribution company performance by utility' })
    expect(within(table).getByText('Ikeja DisCo')).toBeInTheDocument()
    expect(within(table).getByText('Metering rate')).toBeInTheDocument()
    expect(within(table).getByText('Collection efficiency')).toBeInTheDocument()
  })

  it('shows a milestone tracker chart for a pillar whose only core indicator is a status-type KPI', async () => {
    renderRoutesWithProviders(
      [{ path: 'pillars/:pillar', element: <PillarDashboardPage /> }],
      { route: '/pillars/regional-integration' },
    )

    expect(
      await screen.findByRole('heading', { name: 'Regional Integration' }, { timeout: 3000 }),
    ).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Supporting indicators' })).toBeInTheDocument()
    const tracker = screen.getByRole('heading', { name: 'Milestones and governance reforms' })
      .closest('[data-slot="card"]') as HTMLElement
    expect(tracker).toBeInTheDocument()
    expect(
      within(tracker).getByText('Nigeria Interconnected with Synchronised West African Grid'),
    ).toBeInTheDocument()
    expect(within(tracker).getByText('Not started')).toBeInTheDocument()
  })

  it('shows an error state for an unknown pillar', async () => {
    renderRoutesWithProviders(
      [{ path: 'pillars/:pillar', element: <PillarDashboardPage /> }],
      { route: '/pillars/not-a-real-pillar' },
    )

    expect(
      await screen.findByText('Pillar dashboard could not be loaded'),
    ).toBeInTheDocument()
  })
})
