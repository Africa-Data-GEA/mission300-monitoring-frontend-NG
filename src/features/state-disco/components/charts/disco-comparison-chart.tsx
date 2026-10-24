import Chart from 'react-apexcharts'
import type { DiscoComparisonRow } from '@/api/schemas/state-disco'
import { Card } from '@/components/ui/card'
import { CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/**
 * Replaces the old ComparisonBar div-pair (two flat CSS bars per row) with a
 * real grouped Apex bar chart — one DisCo per row, two series per metric
 * pair (received/billed or billed/collected), so the relationship between
 * the two figures reads as a chart rather than a stack of decorative divs.
 */
export function DiscoComparisonChart({
  title,
  rows,
  primaryLabel,
  secondaryLabel,
  primaryPercentKey,
  secondaryPercentKey,
  primaryValueKey,
  secondaryValueKey,
}: {
  title: string
  rows: readonly DiscoComparisonRow[]
  primaryLabel: string
  secondaryLabel: string
  primaryPercentKey: 'energyReceivedBarPercent' | 'revenueBilledBarPercent'
  secondaryPercentKey: 'energyBilledBarPercent' | 'revenueCollectedBarPercent'
  primaryValueKey: 'energyReceived' | 'revenueBilled'
  secondaryValueKey: 'energyBilled' | 'revenueCollected'
}) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">{title}</h3>
      <Chart
        type="bar"
        height={Math.max(160, rows.length * 70)}
        series={[
          { name: primaryLabel, data: rows.map((row) => row[primaryPercentKey]) },
          { name: secondaryLabel, data: rows.map((row) => row[secondaryPercentKey]) },
        ]}
        options={{
          chart: { type: 'bar', toolbar: { show: false }, fontFamily: FONT_FAMILY },
          plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '65%' } },
          colors: [CHART_BLUE.base, CHART_BLUE.darkest],
          // A brand-derived "lightest" colour can still read as near-white on
          // this card's white background (see buildChartScale's own comment)
          // - an outline keeps every bar legible as a shape regardless of how
          // close its fill ends up to the surface behind it.
          stroke: { show: true, width: 1, colors: ['var(--border-default)'] },
          dataLabels: { enabled: false },
          xaxis: {
            categories: rows.map((row) => row.name),
            max: 100,
            labels: { formatter: (value) => `${value}%` },
          },
          legend: { position: 'top', horizontalAlign: 'left', fontFamily: FONT_FAMILY },
          grid: { borderColor: 'var(--border-default)' },
          tooltip: {
            y: {
              formatter: (_value, opts) => {
                if (!opts) return ''
                const row = rows[opts.dataPointIndex]
                if (!row) return ''
                return opts.seriesIndex === 0 ? row[primaryValueKey] : row[secondaryValueKey]
              },
            },
          },
        }}
      />
    </Card>
  )
}
