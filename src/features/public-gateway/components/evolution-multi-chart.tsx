import Chart from 'react-apexcharts'
import { formatDate } from '@/lib/format'
import { ChartCard } from './chart-card'
import type { EvolutionSeries } from './evolution-chart'
import { LANDING_PALETTE, compactNumber, landingChartBase } from '../lib/landing-chart-theme'
import { periodToDate } from '../lib/evolution-series'

/**
 * Several indicators from the same pillar, sharing one unit, plotted as one
 * multi-line chart instead of a grid of single-metric charts.
 *
 * WHY THIS EXISTS. Reviewing "How the indicators have moved" one metric at a
 * time made it hard to see how a pillar was doing as a whole — three
 * percentage-based Financially Viable Utilities indicators sitting in three
 * separate cards cannot be compared at a glance the way three lines on one
 * axis can. Selecting a specific pillar now groups its chartable series by
 * unit and renders one combined chart per group (a pillar whose indicators
 * span several units — e.g. a %, a ₦ figure and a MW figure — still gets one
 * chart per unit, never one axis pretending three units are the same thing).
 *
 * A DATETIME AXIS, NOT SHARED CATEGORIES. The indicators being combined don't
 * all report on the same cadence — metering rate has quarters the other two
 * do not. A categorical axis has no way to express that gap and would
 * misalign the shorter series against the wrong labels. Anchoring every point
 * to its real calendar date lets ApexCharts place each line only where it
 * actually has a reading, leaving a true gap rather than a false one.
 *
 * THE LEGEND IS THE FILTER. Each line is independently toggleable by clicking
 * its legend entry — ApexCharts' own built-in behaviour — rather than a
 * second, redundant filter control next to a filter pill list that already
 * chose the pillar.
 */
export function EvolutionMultiChart({ unit, series }: { unit: string; series: readonly EvolutionSeries[] }) {
  if (series.length === 0) return null

  const chartId = `landing-evolution-multi-${series.map((entry) => entry.id).join('-')}`
  const base = landingChartBase(chartId)

  const apexSeries = series.map((entry) => ({
    name: entry.title,
    data: entry.points.map((point) => ({ x: periodToDate(point.period), y: point.value })),
  }))

  const sources = [...new Set(series.map((entry) => entry.sourceLabel))].join(' · ')
  const lastUpdated = series
    .map((entry) => entry.provenance.lastUpdated)
    .sort()
    .at(-1)

  return (
    <ChartCard
      id={`evolution-multi-${series[0]?.id ?? 'group'}`}
      title={series.length > 1 ? series.map((entry) => entry.title).join(' · ') : series[0]?.title ?? ''}
      unit={unit}
      source={lastUpdated ? `${sources} · last updated ${formatDate(lastUpdated)}` : sources}
      chartId={chartId}
      dataset={{
        headers: ['Indicator', 'Period', 'Value', 'Unit', 'Source'],
        rows: series.flatMap((entry) =>
          entry.points.map((point) => [entry.title, point.period, point.value, unit, entry.provenance.source]),
        ),
      }}
    >
      <Chart
        type="line"
        height={280}
        series={apexSeries}
        options={{
          ...base,
          colors: series.map((_entry, index) => LANDING_PALETTE[index % LANDING_PALETTE.length] ?? LANDING_PALETTE[0]),
          stroke: { curve: 'straight', width: 3, lineCap: 'round' },
          markers: { size: 4, strokeWidth: 2, strokeColors: '#ffffff', hover: { size: 6 } },
          xaxis: {
            ...base.xaxis,
            type: 'datetime',
            labels: {
              ...(base.xaxis as { labels?: object }).labels,
              datetimeUTC: true,
            },
          },
          yaxis: {
            ...base.yaxis,
            labels: {
              ...(base.yaxis as { labels?: object }).labels,
              formatter: (value: number) => compactNumber(value),
            },
          },
          tooltip: {
            ...base.tooltip,
            x: { format: 'MMM yyyy' },
            y: { formatter: (value: number) => `${value.toLocaleString('en-US')}${unit ? ` — ${unit}` : ''}` },
          },
          legend: { ...base.legend, show: true },
        }}
      />
    </ChartCard>
  )
}
