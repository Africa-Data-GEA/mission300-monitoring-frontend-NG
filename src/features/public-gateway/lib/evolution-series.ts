import type { PillarId } from '@/api/schemas/common'
import type { PublicOverview } from '@/api/schemas/executive-overview'
import type { EvolutionSeries } from '../components/evolution-chart'
import { getCurrency } from '@/lib/currency'

/** Units matching each national-performance metric's own formatValue in
 * mocks/data/executive-overview.ts — kept here rather than parsed back out
 * of the formatted `value` string. */
const NATIONAL_PERFORMANCE_UNITS: Record<string, string> = {
  'renewable-share': '% of total generation',
  'metering-rate': '% of customers metered',
  'atcc-losses': '% aggregate technical, commercial & collection losses',
  'market-remittance': '% of market invoices remitted',
}

/**
 * Turns a period label ("2025", "Q3 2025") into a real date, so series with
 * different reporting cadences can share one datetime axis without their
 * points landing on the wrong tick.
 *
 * WHY THIS MATTERS. Metering rate reports quarterly from Q3 2024; ATC&C
 * losses and DisCo remittance start at Q1 2025 — three quarters later. A
 * shared *categorical* axis (the default for a single-series chart on this
 * page) has no notion of that gap: it would either misalign the shorter
 * series against the wrong labels or silently drop the extra points.
 * Anchoring every point to its real calendar date is what lets ApexCharts
 * place each line only where it actually has data.
 */
export function periodToDate(period: string): number {
  const quarter = /^Q([1-4])\s+(\d{4})$/.exec(period)
  if (quarter) {
    const q = Number(quarter[1])
    const year = Number(quarter[2])
    return Date.UTC(year, (q - 1) * 3, 1)
  }
  const year = /^(\d{4})$/.exec(period)
  if (year) return Date.UTC(Number(year[1]), 0, 1)
  // Falls back to whatever Date can parse rather than throwing — a period
  // label this page has not seen yet should not take the chart down.
  const parsed = Date.parse(period)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Reduces a descriptive unit string to the scale it actually plots on — the
 * key several indicators must share to be grouped onto one chart.
 *
 * The raw unit strings are deliberately specific ("% of customers metered",
 * "% aggregate technical, commercial & collection losses") because that
 * detail belongs in each indicator's own label. But three indicators that are
 * all a percentage share one y-axis whether or not their descriptions match
 * word for word — grouping on the full string would treat those three
 * percentages as three different scales and defeat the point of combining
 * them at all.
 */
export function unitGroupKey(unit: string): string {
  if (unit.startsWith('%')) return '%'
  return unit.split(' ')[0] ?? unit
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
export function buildEvolutionSeries(data: PublicOverview): EvolutionSeries[] {
  const currency = getCurrency()
  const units: Record<string, string> = {
    ...NATIONAL_PERFORMANCE_UNITS,
    'tariff-shortfall': `${currency.code} trillion, outstanding`,
    'private-capital': `${currency.code} billion, cumulative`,
  }
  return [
    ...data.nationalPerformance.map((metric) => ({
      id: metric.id,
      title: metric.title,
      value: metric.value,
      unit: units[metric.id] ?? '',
      pillar: metric.pillar as PillarId | null,
      points: metric.history,
      direction: metric.direction,
      provenance: metric.provenance,
      sourceLabel: shortSource(metric.provenance.source),
      current: metric.current,
      target: metric.target,
      baseline: metric.baseline,
      scaleMin: metric.scaleMin,
      scaleMax: metric.scaleMax,
    })),
    {
      id: 'access-rate',
      title: data.headlineCards.accessRate.title,
      value: data.headlineCards.accessRate.value,
      unit: '% of population with electricity access',
      pillar: 'last-mile-access' as PillarId,
      points: data.headlineCards.accessRate.sparkline,
      direction: 'higher-is-better' as const,
      provenance: data.headlineCards.accessRate.provenance,
      sourceLabel: shortSource(data.headlineCards.accessRate.provenance.source),
      current: data.headlineCards.accessRate.rawValue,
      // No numeric target on this payload, only a target label — see
      // headline-figures.ts's own reasoning for why that must stay unfilled
      // rather than drawn against an assumed 100%.
      target: null,
      baseline: null,
      scaleMin: null,
      scaleMax: null,
    },
    {
      id: 'generation-capacity',
      title: data.headlineCards.generationCapacity.title,
      value: data.headlineCards.generationCapacity.value,
      unit: 'MW available',
      pillar: 'generation-network' as PillarId,
      points: data.headlineCards.generationCapacity.sparkline,
      direction: 'higher-is-better' as const,
      provenance: data.headlineCards.generationCapacity.provenance,
      sourceLabel: shortSource(data.headlineCards.generationCapacity.provenance.source),
      current: data.headlineCards.generationCapacity.availableMw,
      // Available-of-installed is a real, published ratio, not an invented
      // target — same reasoning headline-figures.ts already applies to this
      // same pair for the KPI strip's own bullet chart.
      target: data.headlineCards.generationCapacity.installedMw,
      baseline: null,
      scaleMin: 0,
      scaleMax: data.headlineCards.generationCapacity.installedMw,
    },
  ]
}
