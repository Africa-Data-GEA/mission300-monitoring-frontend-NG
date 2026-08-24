import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillarDashboardPage } from '@/features/pillar-dashboard/pillar-dashboard-page'
import { renderRoutesWithProviders } from '@/test/render'

/**
 * Review found the Electricity Access Rate card reading as though it had no
 * target, when the Compact commitment is simply expressed in another unit
 * (a growth rate, not a % level) — docs/M300 Monitoring Platform Feedback.pptx,
 * slide 6. The card must state that commitment rather than showing the bare
 * "No confirmed target yet" reserved for indicators with no target at all.
 */
describe('Headline card target basis', () => {
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
})
