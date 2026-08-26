import type { EvolutionSeries } from '../components/evolution-chart'
import type { Trend } from '@/api/schemas/common'
import { compactNumber } from './landing-chart-theme'

/**
 * Same predicate `core-indicators-section.tsx` uses to choose between a
 * radial gauge and a target-bar on the pillar dashboard — reused here so §03
 * makes the same call for the same reason: a genuine 0–100% ratio reads
 * naturally as "percent of the way to 100", everything else (a magnitude
 * target, or a percentage a metric is trying to fall towards) reads more
 * honestly as a bar against a line.
 */
export function isRatioTarget(series: EvolutionSeries): boolean {
  return (
    series.unit.trim().startsWith('%') &&
    series.direction === 'higher-is-better' &&
    series.target !== null &&
    series.target > 0 &&
    series.target <= 100
  )
}

/** A series has a real, chartable target when the target itself and the axis
 * it sits on are both known — a target with no scale has nothing to plot it
 * against. */
export function hasChartableTarget(series: EvolutionSeries): boolean {
  return series.target !== null && series.target > 0
}

/**
 * Period-on-period movement, shaped as the page's own `Trend` — so it can be
 * handed straight to `FigureTrend`, the same component the headline strip
 * already uses, rather than inventing a second trend renderer for these two
 * chart types.
 */
export function deriveEvolutionTrend(series: EvolutionSeries): Trend | null {
  if (series.points.length < 2) return null
  const first = series.points[0]!
  const last = series.points[series.points.length - 1]!
  const change = Math.round((last.value - first.value) * 100) / 100
  if (change === 0) return null
  return {
    change,
    label: `${change > 0 ? '+' : ''}${change.toLocaleString('en-US')} since ${first.period}`,
    direction: series.direction,
  }
}

/**
 * A raw number, dressed in the series' own unit — a `%` suffix for a ratio,
 * otherwise the bare figure. The descriptive unit strings this page carries
 * ("₦ trillion, outstanding") already appear once, under the chart title via
 * `ChartCard`'s own `unit` prop; repeating them on every value here would be
 * the same information twice in one card.
 */
export function formatSeriesValue(value: number, series: EvolutionSeries, compact = false): string {
  const formatted = compact ? compactNumber(value) : value.toLocaleString('en-US')
  return series.unit.trim().startsWith('%') ? `${formatted}%` : formatted
}
