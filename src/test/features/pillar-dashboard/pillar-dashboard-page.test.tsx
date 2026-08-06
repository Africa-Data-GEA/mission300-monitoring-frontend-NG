import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarDashboardPage } from '@/features/pillar-dashboard/pillar-dashboard-page'
import { renderRoutesWithProviders } from '@/test/render'

describe('PillarDashboardPage', () => {
  it('renders the headline cards and KPI table for a pillar', async () => {
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

    const kpis = screen.getByRole('table', {
      name: 'Indicators tracked for this pillar',
    })
    expect(within(kpis).getByText('Available (Dispatched) Generation Capacity')).toBeInTheDocument()

    // Priority bottlenecks is no longer part of the pillar dashboard.
    expect(
      screen.queryByRole('table', { name: 'Priority bottlenecks, most severe first' }),
    ).not.toBeInTheDocument()
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
