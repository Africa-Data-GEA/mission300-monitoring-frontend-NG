import Chart from 'react-apexcharts'
import type { DeliveryRow } from '@/api/schemas/state-disco'
import { Card } from '@/components/ui/card'
import { getChartBlueScale } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/** A quick shape-of-the-portfolio donut for the delivery & compliance
 * table below it — milestone text, evidence and bottlenecks stay in the
 * table (they don't reduce to a chart), but "how many milestones are in
 * each execution status" does. */
export function DeliveryStatusChart({ rows }: { rows: readonly DeliveryRow[] }) {
  const counts = new Map<string, number>()
  for (const row of rows) counts.set(row.executionStatus, (counts.get(row.executionStatus) ?? 0) + 1)
  const labels = [...counts.keys()]
  const series = [...counts.values()]

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">Milestones by execution status</h3>
      <Chart
        type="donut"
        height={220}
        series={series}
        options={{
          chart: { type: 'donut', fontFamily: FONT_FAMILY },
          labels,
          colors: [...getChartBlueScale()],
          legend: { position: 'bottom', fontFamily: FONT_FAMILY },
          dataLabels: {
            enabled: true,
            formatter: (_value, opts) => (opts ? String(opts.w.globals.series[opts.seriesIndex]) : ''),
          },
          stroke: { width: 0 },
        }}
      />
    </Card>
  )
}
