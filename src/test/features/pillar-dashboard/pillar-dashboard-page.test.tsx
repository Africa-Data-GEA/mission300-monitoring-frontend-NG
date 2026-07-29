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
    expect(within(headlineCards).getByText('M300-P1-003')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Delivery status — programmes and projects' }),
    ).toBeInTheDocument()

    const kpis = screen.getByRole('table', {
      name: 'Key Performance Indicators tagged to this Compact pillar',
    })
    expect(within(kpis).getByText('Available (Dispatched) Generation Capacity')).toBeInTheDocument()

    const bottlenecks = screen.getByRole('table', {
      name: 'Ranked bottlenecks for this Compact pillar',
    })
    expect(within(bottlenecks).getByText('BTN-2025-022')).toBeInTheDocument()
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
