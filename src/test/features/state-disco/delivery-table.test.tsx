import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { StateDiscoPage } from '@/features/state-disco/pages/state-disco-page'
import { renderRoutesWithProviders } from '@/test/render'

/**
 * Review feedback on State & DisCo (docs/M300 Monitoring Platform
 * Feedback.pptx, slide 11): every date field should sort, every categorical
 * field should filter, and a field offered as a filter must also be readable
 * as a column — Service band was filterable but invisible in the table.
 */
async function renderPage() {
  renderRoutesWithProviders([{ path: 'state-disco', element: <StateDiscoPage /> }], {
    route: '/state-disco',
  })
  return screen.findByRole(
    'table',
    { name: /Utility delivery and compliance/i },
    { timeout: 5000 },
  )
}

describe('State & DisCo delivery table', () => {
  it('shows Service band as a column, because it is offered as a filter', async () => {
    const table = await renderPage()
    expect(within(table).getByRole('columnheader', { name: /Service band/i })).toBeInTheDocument()
    // Bands C–E exist in the data and must be reachable, not just A/B.
    expect(within(table).getByText('Band E')).toBeInTheDocument()
  }, 60_000)

  it('sorts Due date chronologically, not by its display label', async () => {
    const table = await renderPage()
    const user = userEvent.setup()

    await user.click(within(table).getByRole('button', { name: /Due date/i }))

    const dates = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.textContent ?? '')
    // Ascending by real date: Sep 2025 → Dec 2025 → Jan 2026 → Mar 2026 → Jun 2026.
    // Sorting the "31 Dec 2025"-style label as text would put Dec before Sep
    // and Jan before Mar, so this ordering only holds if the ISO date is used.
    const order = dates.map((text) => {
      if (text.includes('30 Sep 2025')) return 0
      if (text.includes('31 Dec 2025')) return 1
      if (text.includes('31 Jan 2026')) return 2
      if (text.includes('31 Mar 2026')) return 3
      return 4
    })
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order[0]).toBe(0)
  }, 60_000)
})
