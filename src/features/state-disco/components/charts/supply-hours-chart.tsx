import Chart from 'react-apexcharts'
import type { UtilityOperationsRow } from '@/api/schemas/state-disco'
import { Card } from '@/components/ui/card'
import { getChartBlueScale } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const BANDS = ['A', 'B', 'C', 'D', 'E'] as const

function parseHours(label: string): number {
  const match = /^([\d.]+)/.exec(label)
  return match ? Number(match[1]) : 0
}

/** Replaces the per-band mini progress-bar cells in the old supply-and-tariff
 * table with one grouped column chart — Band A to E on the axis, one series
 * per DisCo, so the whole matrix reads as a single shape instead of five
 * separate table columns of small bars. */
export function SupplyHoursChart({ rows }: { rows: readonly UtilityOperationsRow[] }) {
  const series = rows.map((row) => ({
    name: row.utility,
    data: BANDS.map((band) => {
      const cell = row.bands.find((entry) => entry.band === band)
      return cell ? parseHours(cell.supplyHours) : 0
    }),
  }))

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">Average daily supply hours by band</h3>
      <Chart
        type="bar"
        height={280}
        series={series}
        options={{
          chart: { type: 'bar', toolbar: { show: false }, fontFamily: FONT_FAMILY },
          plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } },
          colors: getChartBlueScale().slice(0, Math.max(2, rows.length)),
          dataLabels: { enabled: false },
          xaxis: { categories: BANDS.map((band) => `Band ${band}`) },
          yaxis: { title: { text: 'Hours / day', style: { fontFamily: FONT_FAMILY } } },
          legend: { position: 'top', horizontalAlign: 'left', fontFamily: FONT_FAMILY },
          grid: { borderColor: 'var(--border-default)' },
          tooltip: {
            y: {
              formatter: (value, opts) => {
                const row = rows[opts.seriesIndex]
                const band = BANDS[opts.dataPointIndex]
                const cell = row?.bands.find((entry) => entry.band === band)
                return cell ? `${value} h/day · ${cell.tariff}` : `${value} h/day`
              },
            },
          },
        }}
      />
    </Card>
  )
}
