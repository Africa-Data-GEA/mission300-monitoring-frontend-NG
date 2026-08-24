import Chart from 'react-apexcharts'
import type { ImprovementDirection, MetricProvenance, PillarId } from '@/api/schemas/common'
import { formatDate } from '@/lib/format'
import { ChartCard } from './chart-card'
import { compactNumber, landingChartBase } from '../lib/landing-chart-theme'

export interface EvolutionSeries {
  readonly id: string
  readonly title: string
  readonly unit: string
  /** Null where the payload carries no pillar for this series — it then shows
   * under "All pillars" only, rather than being filed under a guess. */
  readonly pillar: PillarId | null
  readonly points: readonly { period: string; value: number }[]
  /** Whether the metric improves as it rises or falls. ATC&C losses and the
   * tariff shortfall improve as they FALL, so the change summary below the
   * chart must not read a decline as bad news. */
  readonly direction: ImprovementDirection
  readonly provenance: MetricProvenance
  readonly sourceLabel: string
}

/**
 * One metric's history, as a line over its real reporting periods.
 *
 * A LINE, NOT AN AREA. The earlier build filled these with a gradient. A filled
 * area encodes the quantity between the line and zero as meaningful — which is
 * false for every metric here that is a percentage or a rate, and doubly false
 * for the ones whose axis does not start at zero. The line carries the same
 * information and claims less.
 *
 * The change summary under the title is computed from the series itself rather
 * than read from a `trend` field, so it can never disagree with the line
 * directly above it, and it is coloured by the metric's own improvement
 * direction rather than by the sign of the change.
 */
export function EvolutionChart({ series }: { series: EvolutionSeries }) {
  const chartId = `landing-evolution-${series.id}`
  const first = series.points[0]
  const last = series.points[series.points.length - 1]

  // A line needs two ends. The caller already filters to series with two or
  // more points; this is the guard that makes that contract checkable rather
  // than assumed.
  if (!first || !last) return null

  const change = last.value - first.value
  const isFlat = Math.abs(change) < Number.EPSILON
  const isImproving = series.direction === 'lower-is-better' ? change < 0 : change > 0

  const base = landingChartBase(chartId)

  return (
    <ChartCard
      id={`evolution-${series.id}`}
      title={series.title}
      unit={series.unit}
      controls={
        <p
          className={
            isFlat
              ? 'text-[0.8125rem] leading-5 font-semibold text-text-muted'
              : isImproving
                ? 'text-[0.8125rem] leading-5 font-semibold text-trend-up'
                : 'text-[0.8125rem] leading-5 font-semibold text-trend-down'
          }
        >
          {isFlat ? 'No change' : `${change > 0 ? '+' : ''}${compactNumber(change)}`}
          <span className="ml-1 font-normal text-text-subtle">
            {first.period} → {last.period}
          </span>
        </p>
      }
      source={`${series.sourceLabel} · last updated ${formatDate(series.provenance.lastUpdated)}`}
      chartId={chartId}
      dataset={{
        headers: ['Period', series.title, 'Unit', 'Source'],
        rows: series.points.map((point) => [point.period, point.value, series.unit, series.provenance.source]),
      }}
    >
      <Chart
        type="line"
        height={220}
        series={[{ name: series.title, data: series.points.map((point) => point.value) }]}
        options={{
          ...base,
          stroke: { curve: 'straight', width: 2 },
          markers: { size: 0, strokeWidth: 0, hover: { size: 5 } },
          xaxis: {
            ...base.xaxis,
            categories: series.points.map((point) => point.period),
            tickAmount: Math.min(series.points.length - 1, 5),
          },
          tooltip: {
            ...base.tooltip,
            y: {
              formatter: (value: number) => `${value.toLocaleString('en-US')}${series.unit ? ` — ${series.unit}` : ''}`,
            },
          },
        }}
      />
    </ChartCard>
  )
}
