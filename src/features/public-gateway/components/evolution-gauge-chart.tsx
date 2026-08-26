import Chart from 'react-apexcharts'
import { formatDate } from '@/lib/format'
import { ChartCard } from './chart-card'
import type { EvolutionSeries } from './evolution-chart'
import { FigureTrend } from './figure-trend'
import { deriveEvolutionTrend, formatSeriesValue } from '../lib/evolution-target'
import { LANDING_FONT_FAMILY, LANDING_PALETTE } from '../lib/landing-chart-theme'

/**
 * A genuine 0–100% ratio, plotted current-inside-target — same read as
 * `GaugeCard` on the pillar dashboards (see `core-indicators-section.tsx`),
 * re-skinned in this page's own chart chrome rather than importing that
 * component, which depends on the authenticated app's `Card`/`InfoPopover`.
 *
 * Renders in place of `EvolutionChart`'s line for any national-performance
 * metric with an approved target `isRatioTarget` accepts — current-vs-target
 * is the question a reader of a Compact record actually has for a metering
 * rate or a market-remittance figure, not "what did the line do".
 */
export function EvolutionGaugeChart({
  series,
  paletteIndex = 0,
}: {
  series: EvolutionSeries
  /** Indexed against the full chartable list, not the currently-visible one —
   * same reasoning as `EvolutionChart.paletteIndex`, so a metric's colour
   * does not shift when the pillar filter narrows the set. */
  paletteIndex?: number
}) {
  const target = series.target
  if (target === null) return null

  const percent = Math.min(100, Math.round((series.current / target) * 1000) / 10)
  const trend = deriveEvolutionTrend(series)
  const chartId = `landing-evolution-gauge-${series.id}`
  const color = LANDING_PALETTE[paletteIndex % LANDING_PALETTE.length] ?? LANDING_PALETTE[0]

  return (
    <ChartCard
      id={`evolution-${series.id}`}
      title={series.title}
      unit={series.unit}
      controls={
        <p className="text-[0.8125rem] leading-5 font-semibold text-text-muted">{percent}% to target</p>
      }
      source={`${series.sourceLabel} · last updated ${formatDate(series.provenance.lastUpdated)}`}
      chartId={chartId}
      dataset={{
        headers: ['Metric', 'Current', 'Target', 'Unit', 'Source'],
        rows: [[series.title, series.current, target, series.unit, series.provenance.source]],
      }}
    >
      <div className="relative">
        <Chart
          type="radialBar"
          height={200}
          series={[percent, 100]}
          options={{
            chart: { id: chartId, type: 'radialBar', fontFamily: LANDING_FONT_FAMILY, animations: { enabled: false } },
            colors: [color, '#eaecf0'],
            labels: ['Current', 'Target'],
            plotOptions: {
              radialBar: {
                hollow: { size: '54%' },
                track: { show: false },
                dataLabels: { name: { show: false }, value: { show: false } },
              },
            },
            stroke: { lineCap: 'round' },
            legend: { show: false },
            tooltip: {
              style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '12px' },
              y: {
                formatter: (value: number) =>
                  formatSeriesValue(value === percent ? series.current : target, series),
              },
            },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <span className="font-landing-figure max-w-full truncate text-[1.5rem] leading-tight font-bold tabular-nums text-text-default">
            {formatSeriesValue(series.current, series, true)}
          </span>
          <span className="mt-0.5 max-w-full truncate text-[0.75rem] leading-tight text-text-subtle">
            of {formatSeriesValue(target, series, true)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[0.75rem] leading-4 text-text-subtle">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: color }} />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#eaecf0]" />
          Target
        </span>
      </div>

      {trend && <FigureTrend trend={trend} className="mt-2.5" />}
    </ChartCard>
  )
}
