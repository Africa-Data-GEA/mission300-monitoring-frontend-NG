import type { PillarId } from '@/api/schemas/common'
import type { ExecutiveOverview } from '@/api/schemas/executive-overview'
import type { EvolutionSeries } from '../components/evolution-chart'

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
 * Every real reporting series on the public overview payload, assembled into one
 * flat list — all six national-performance metrics plus the two headline cards
 * that carry their own history. Not a curated subset: anything with two or more
 * points is chartable, so the page cannot quietly omit a series that moved the
 * wrong way.
 *
 * Every entry carries its real `provenance` — per §01 of the build spec, every
 * number on this page must show its source institution, reporting period and
 * validation status.
 *
 * ON THE TWO ASSIGNED PILLARS. `nationalPerformance` metrics arrive with their
 * own `pillar`; the two headline cards do not carry one on this payload, so the
 * access rate and generation capacity are assigned to the pillars they are by
 * definition the headline indicator of. That is a classification, not an
 * invented figure — but it lives here, in one visible place, rather than being
 * inferred inside the filter.
 */
export function buildEvolutionSeries(data: ExecutiveOverview): EvolutionSeries[] {
  return [
    ...data.nationalPerformance.map((metric) => ({
      id: metric.id,
      title: metric.title,
      unit: NATIONAL_PERFORMANCE_UNITS[metric.id] ?? '',
      pillar: metric.pillar as PillarId | null,
      points: metric.history,
      direction: metric.direction,
      provenance: metric.provenance,
      sourceLabel: shortSource(metric.provenance.source),
    })),
    {
      id: 'access-rate',
      title: data.headlineCards.accessRate.title,
      unit: '% of population with electricity access',
      pillar: 'last-mile-access' as PillarId,
      points: data.headlineCards.accessRate.sparkline,
      direction: 'higher-is-better' as const,
      provenance: data.headlineCards.accessRate.provenance,
      sourceLabel: shortSource(data.headlineCards.accessRate.provenance.source),
    },
    {
      id: 'generation-capacity',
      title: data.headlineCards.generationCapacity.title,
      unit: 'MW available',
      pillar: 'generation-network' as PillarId,
      points: data.headlineCards.generationCapacity.sparkline,
      direction: 'higher-is-better' as const,
      provenance: data.headlineCards.generationCapacity.provenance,
      sourceLabel: shortSource(data.headlineCards.generationCapacity.provenance.source),
    },
  ]
}
