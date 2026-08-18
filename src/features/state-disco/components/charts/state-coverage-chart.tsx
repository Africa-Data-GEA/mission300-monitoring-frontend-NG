import Chart from 'react-apexcharts'
import type { StateCoverageRow } from '@/api/schemas/state-disco'
import { Card } from '@/components/ui/card'
import { CHART_BLUE, getChartAccent } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/** Replaces the flat CSS bar in the old "Validated coverage" table cell with
 * one horizontal Apex bar chart across every state — the accent colour
 * marks the state still provisional, so it stands out as the one that
 * still needs validating rather than reading as just another bar. */
export function StateCoverageChart({ rows }: { rows: readonly StateCoverageRow[] }) {
  const accent = getChartAccent()

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">Validated coverage by state</h3>
      <Chart
        type="bar"
        height={Math.max(160, rows.length * 60)}
        series={[{ name: 'Validated coverage', data: rows.map((row) => row.coverageBarPercent) }]}
        options={{
          chart: { type: 'bar', toolbar: { show: false }, fontFamily: FONT_FAMILY },
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 3,
              barHeight: '55%',
              distributed: true,
            },
          },
          colors: rows.map((row) => (row.validationLabel === 'Confirmed' ? CHART_BLUE.dark : accent)),
          dataLabels: {
            enabled: true,
            formatter: (value) => `${value}%`,
            style: { fontFamily: FONT_FAMILY, colors: ['var(--text-default)'] },
            offsetX: 20,
          },
          xaxis: { categories: rows.map((row) => row.state), max: 100, labels: { formatter: (value) => `${value}%` } },
          legend: { show: false },
          grid: { borderColor: 'var(--border-default)' },
          tooltip: {
            y: {
              formatter: (value, opts) => `${value}% — ${opts ? rows[opts.dataPointIndex]?.validationLabel : ''}`,
            },
          },
        }}
      />
    </Card>
  )
}
