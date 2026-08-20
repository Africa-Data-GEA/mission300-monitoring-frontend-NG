import { useMemo } from 'react'
import Chart from 'react-apexcharts'
import type { KpiCatalogueRow } from '@/api/schemas/kpi-explorer'
import { getChartBlueScale } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/**
 * How many of this pillar's indicators fall into each KPI Matrix category
 * (Output, Outcome, System Performance, Financial and similar) — the
 * closest thing this dashboard has to a results-framework view, since
 * category isn't yet mapped to a separately published results framework or
 * national theory of change (see the note beside this chart). Counting by
 * category is still useful on its own: it shows at a glance whether a
 * pillar's indicator set leans toward measuring activity (Output) or
 * results (Outcome).
 */
export function IndicatorCategoryChart({ rows }: { rows: readonly KpiCatalogueRow[] }) {
  const { labels, series } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of rows) counts.set(row.category, (counts.get(row.category) ?? 0) + 1)
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
    return { labels: sorted.map(([label]) => label), series: sorted.map(([, count]) => count) }
  }, [rows])

  if (labels.length === 0) return null

  return (
    <Chart
      type="donut"
      height={180}
      width={180}
      series={series}
      options={{
        chart: { type: 'donut', fontFamily: FONT_FAMILY },
        labels,
        colors: [...getChartBlueScale()],
        legend: { position: 'right', fontFamily: FONT_FAMILY, fontSize: '12px' },
        dataLabels: {
          enabled: true,
          formatter: (_value, opts) => (opts ? String(opts.w.globals.series[opts.seriesIndex]) : ''),
        },
        stroke: { width: 0 },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: { show: true, label: 'Indicators', fontFamily: FONT_FAMILY },
              },
            },
          },
        },
      }}
    />
  )
}
