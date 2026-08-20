import type { ExecutiveOverview } from '@/api/schemas/executive-overview'
import type { EvolutionSeries } from '../components/performance-evolution'

/** Units matching each national-performance metric's own formatValue in
 * mocks/data/executive-overview.ts — kept here rather than parsed back out
 * of the formatted `value` string. */
const NATIONAL_PERFORMANCE_UNITS: Record<string, string> = {
  'renewable-share': '% of total generation',
  'metering-rate': '% of customers metered',
  'atcc-losses': '% aggregate technical, commercial & collection losses',
  'market-remittance': '% of market invoices remitted',
  'tariff-shortfall': '₦ trillion, outstanding',
  'private-capital': 'USD billion, cumulative',
}

/** A short institution label from a full provenance citation — mirrors
 * dashboard's bullet-metric-row.tsx's own `conciseDataSource`, duplicated
 * rather than imported: the public gateway must not depend on an
 * authenticated module (see api.ts's comment). */
function shortSource(source: string): string {
  return source.replace(/[.;].*$/, '').trim()
}

/**
 * Every real reporting series on the public overview payload, assembled
 * into one flat list for PerformanceEvolution — all six national-performance
 * metrics plus the two headline cards that carry their own history
 * (electricity access rate, generation capacity). Not a curated subset:
 * anything with two or more points is chartable.
 *
 * Every entry carries its real `provenance` and a `sourceLabel` — per
 * docs/public-gateway-home.md §01, every number on this page must show its
 * source institution, reporting period and validation status.
 */
export function buildEvolutionSeries(data: ExecutiveOverview): EvolutionSeries[] {
  return [
    ...data.nationalPerformance.map((metric) => ({
      id: metric.id,
      title: metric.title,
      unit: NATIONAL_PERFORMANCE_UNITS[metric.id] ?? '',
      points: metric.history,
      provenance: metric.provenance,
      sourceLabel: shortSource(metric.provenance.source),
    })),
    {
      id: 'access-rate',
      title: data.headlineCards.accessRate.title,
      unit: '% of population with electricity access',
      points: data.headlineCards.accessRate.sparkline,
      provenance: data.headlineCards.accessRate.provenance,
      sourceLabel: shortSource(data.headlineCards.accessRate.provenance.source),
    },
    {
      id: 'generation-capacity',
      title: data.headlineCards.generationCapacity.title,
      unit: 'MW available',
      points: data.headlineCards.generationCapacity.sparkline,
      provenance: data.headlineCards.generationCapacity.provenance,
      sourceLabel: shortSource(data.headlineCards.generationCapacity.provenance.source),
    },
  ]
}
