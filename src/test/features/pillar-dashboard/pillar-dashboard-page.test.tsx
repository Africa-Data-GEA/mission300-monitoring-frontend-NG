import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarDashboardPage } from '@/features/pillar-dashboard/pillar-dashboard-page'
import { renderRoutesWithProviders } from '@/test/render'

describe('PillarDashboardPage', () => {
  it('renders the headline cards, delivery status and bottlenecks for a pillar', async () => {
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

    expect(
      screen.getByRole('heading', { name: 'Programme and project delivery' }),
    ).toBeInTheDocument()

    const kpis = screen.getByRole('table', {
      name: 'Indicators tracked for this pillar',
    })
    expect(within(kpis).getByText('Available (Dispatched) Generation Capacity')).toBeInTheDocument()

    const bottlenecks = screen.getByRole('table', {
      name: 'Priority bottlenecks, most severe first',
    })
    expect(
      within(bottlenecks).getByText(
        'Transmission evacuation constraint limiting dispatch, North East',
      ),
    ).toBeInTheDocument()
    // The record identifier is deliberately absent from list tables — it
    // belongs on the bottleneck's own detail view.
    expect(within(bottlenecks).queryByText('BTN-2025-022')).not.toBeInTheDocument()
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
