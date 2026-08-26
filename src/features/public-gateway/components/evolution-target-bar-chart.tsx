import Chart from 'react-apexcharts'
import { formatDate } from '@/lib/format'
import { ChartCard } from './chart-card'
import type { EvolutionSeries } from './evolution-chart'
import { FigureTrend } from './figure-trend'
import { deriveEvolutionTrend, formatSeriesValue } from '../lib/evolution-target'
import { LANDING_FONT_FAMILY, LANDING_PALETTE } from '../lib/landing-chart-theme'

/**
 * A magnitude target that isn't a 0–100 ratio — a horizontal bar for the
 * current value against a dashed target line. Same read as `TargetBarCard`
 * on the pillar dashboards (see `core-indicators-section.tsx`'s own note on
 * why a distant numeric target reads more honestly this way than forced into
 * a percentage-fill gauge), re-skinned in this page's own chart chrome.
 *
 * Also the fallback for a ratio metric that is trying to fall rather than
 * rise (ATC&C losses) — `isRatioTarget` excludes those from the gauge for the
 * same reason `core-indicators-section.tsx` does: a dial reading "percent of
 * the way to 100" is the wrong shape for a target you are trying to shrink
 * toward.
 */
export function EvolutionTargetBarChart({
  series,
  paletteIndex = 0,
}: {
  series: EvolutionSeries
  /** Indexed against the full chartable list — same reasoning as
   * `EvolutionChart.paletteIndex`. */
  paletteIndex?: number
}) {
  const target = series.target
  if (target === null) return null

  const percent = Math.min(100, Math.round((series.current / target) * 1000) / 10)
  const trend = deriveEvolutionTrend(series)
  const chartId = `landing-evolution-bar-${series.id}`
  const color = LANDING_PALETTE[paletteIndex % LANDING_PALETTE.length] ?? LANDING_PALETTE[0]
  const axisMax = Math.max(series.current, target) * 1.2 || 1

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
      <p className="font-landing-figure text-[1.75rem] leading-none font-bold tabular-nums text-text-default">
        {formatSeriesValue(series.current, series, true)}
      </p>

      <div className="mt-5">
        <Chart
          type="bar"
          height={100}
          series={[{ name: series.title, data: [series.current] }]}
          options={{
            chart: {
              id: chartId,
              type: 'bar',
              toolbar: { show: false },
              fontFamily: LANDING_FONT_FAMILY,
              animations: { enabled: false },
            },
            plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '48%' } },
            colors: [color],
            dataLabels: { enabled: false },
            xaxis: {
              categories: [''],
              min: 0,
              max: axisMax,
              labels: { show: false },
              axisTicks: { show: false },
              axisBorder: { show: false },
            },
            yaxis: { labels: { show: false } },
            grid: { show: false, padding: { left: 0, right: 16, top: 24, bottom: 0 } },
            annotations: {
              xaxis: [
                {
                  x: target,
                  strokeDashArray: 4,
                  borderColor: '#98a2b3',
                  label: {
                    text: `Target ${formatSeriesValue(target, series, true)}`,
                    orientation: 'horizontal',
                    offsetY: -8,
                    style: {
                      fontSize: '10px',
                      fontFamily: LANDING_FONT_FAMILY,
                      background: 'transparent',
                      color: '#667085',
                    },
                  },
                },
              ],
            },
            tooltip: {
              style: { fontFamily: LANDING_FONT_FAMILY, fontSize: '12px' },
              y: { formatter: (value: number) => formatSeriesValue(value, series) },
            },
          }}
        />
      </div>

      {trend && <FigureTrend trend={trend} className="mt-4" />}
    </ChartCard>
  )
}
