import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PerformanceTrends } from '@/api/schemas/state-disco'
import { PerformanceTrendsSection } from '@/features/state-disco/components/performance-trends-section'

vi.mock('react-apexcharts', () => ({ default: () => <div data-testid="chart" /> }))

const point = (period: string, label: string, overrides: Partial<PerformanceTrends['points'][number]> = {}) => ({
  period,
  label,
  meteringRate: 45,
  atccLossRate: 40,
  collectionEfficiency: 75,
  remittancePerformance: 90,
  reportingDiscos: 12,
  ...overrides,
})

const trends: PerformanceTrends = {
  meta: { title: 'Performance trends', description: 'd', lastUpdatedLabel: 'Just now', sourceLabel: 'NERC' },
  selectedUtility: 'National (all DisCos)',
  points: [
    point('q4-2025', 'Q4 2025', { meteringRate: 44, remittancePerformance: 95 }),
    point('q1-2026', 'Q1 2026', { meteringRate: 47, remittancePerformance: 100.4 }),
    point('q2-2026', 'Q2 2026', { meteringRate: 49, remittancePerformance: null }),
  ],
}

function card(title: string) {
  return screen.getByRole('heading', { name: title }).closest('div')!.parentElement!
}

describe('PerformanceTrendsSection', () => {
  it('draws one chart per metric', () => {
    render(<PerformanceTrendsSection trends={trends} />)

    expect(screen.getByRole('heading', { name: 'Performance trends' })).toBeInTheDocument()
    for (const title of ['Metering rate', 'ATC&C loss rate', 'Collection efficiency', 'Market-remittance performance']) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
    expect(screen.getAllByTestId('chart')).toHaveLength(4)
  })

  it('shows the latest reported quarter for each metric, skipping quarters with no data', () => {
    render(<PerformanceTrendsSection trends={trends} />)

    expect(within(card('Metering rate')).getByText('49%')).toBeInTheDocument()
    expect(within(card('Metering rate')).getByText('+5 pts since Q4 2025')).toBeInTheDocument()

    const remittance = card('Market-remittance performance')
    expect(within(remittance).getByText('100.4%')).toBeInTheDocument()
    expect(within(remittance).getByText(/Q1 2026/)).toBeInTheDocument()
  })

  it('says so when no quarter has data for a metric', () => {
    render(
      <PerformanceTrendsSection
        trends={{ ...trends, points: trends.points.map((p) => ({ ...p, remittancePerformance: null })) }}
      />,
    )

    const remittance = card('Market-remittance performance')
    expect(within(remittance).getByText('Not reported')).toBeInTheDocument()
    expect(within(remittance).getByText('No quarter has data for this metric yet.')).toBeInTheDocument()
  })
})
