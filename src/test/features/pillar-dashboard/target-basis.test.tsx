import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarDashboardPage } from '@/features/pillar-dashboard/pillar-dashboard-page'
import { HeadlineCard } from '@/features/pillar-dashboard/components/headline-card'
import { buildPillarDashboard } from '@/mocks/data/pillar-dashboard'
import { renderRoutesWithProviders } from '@/test/render'

/** Verify the target display for each pillar only makes claims supported by
 * its indicator data and reporting context. */
describe('Headline card target basis', () => {
  it('does not imply a target status for a private-capital reading that is missing', () => {
    const card = buildPillarDashboard('private-sector-participation').headlineCards[0]!
    renderRoutesWithProviders(
      [{ path: '/', element: <HeadlineCard card={{ ...card, rawValue: null, value: 'No data yet', target: 15499.8 }} /> }],
      { route: '/' },
    )

    expect(screen.getByText('No data yet')).toBeInTheDocument()
    expect(screen.queryByText('Target set · awaiting first report')).not.toBeInTheDocument()
    expect(screen.queryByText(/15,499\.8/)).not.toBeInTheDocument()
  })

  it('states the growth-rate commitment instead of reading as no target', async () => {
    renderRoutesWithProviders(
      [{ path: 'pillars/:pillar', element: <PillarDashboardPage /> }],
      { route: '/pillars/last-mile-access' },
    )

    const cards = await screen.findByRole('region', { name: 'Headline performance cards' }, { timeout: 5000 })
    const accessCard = within(cards)
      .getByRole('link', { name: 'Electricity Access Rate' })
      .closest('[data-slot="card"]') as HTMLElement

    expect(within(accessCard).getByText(/9%\/yr growth commitment/)).toBeInTheDocument()
    expect(within(accessCard).getByText(/growth rate, not a level/)).toBeInTheDocument()
    // The misleading state the reviewer saw must be gone from this card.
    expect(within(accessCard).queryByText('No confirmed target yet')).not.toBeInTheDocument()
  }, 60_000)

  it('still shows the plain no-target state where no commitment exists at all', async () => {
    renderRoutesWithProviders(
      [{ path: 'pillars/:pillar', element: <PillarDashboardPage /> }],
      { route: '/pillars/last-mile-access' },
    )

    const cards = await screen.findByRole('region', { name: 'Headline performance cards' }, { timeout: 5000 })
    // New Grid Connections has no approved annual target — it keeps the
    // original treatment, proving the new branch is scoped, not global.
    const gridCard = within(cards)
      .getByRole('link', { name: /New Grid Connections/ })
      .closest('[data-slot="card"]') as HTMLElement
    expect(within(gridCard).getByText('No confirmed target yet')).toBeInTheDocument()
  }, 60_000)

  it('does not claim a first report is pending when an access KPI has no value', () => {
    const card = buildPillarDashboard('last-mile-access').headlineCards.find(
      (item) => item.kpiId === 'M300-P2-003',
    )!
    renderRoutesWithProviders(
      [{ path: '/', element: <HeadlineCard card={{ ...card, rawValue: null, value: 'No data yet' }} /> }],
      { route: '/' },
    )

    const miniGridCard = screen
      .getByRole('link', { name: 'Mini-Grid Customer Connections' })
      .closest('[data-slot="card"]') as HTMLElement
    expect(within(miniGridCard).getByText('No reported value yet')).toBeInTheDocument()
    expect(within(miniGridCard).queryByText(/awaiting first report/i)).not.toBeInTheDocument()
  })
})
