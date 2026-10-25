import Chart from 'react-apexcharts'
import { CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

export function AccessRateLineChart({
  points,
  label = 'Electricity access rate',
  unit = '%',
}: {
  points: readonly { period: string; value: number }[]
  label?: string
  unit?: string
}) {
  const suffix = unit === '%' ? '%' : unit ? ` ${unit}` : ''
  return (
    <div role="img" aria-label={`${label} trend`} className="min-h-20">
      <Chart
        type="line"
        height={92}
        series={[{ name: label, data: points.map((point) => point.value) }]}
        options={{
          chart: {
            type: 'line',
            animations: { enabled: false },
            toolbar: { show: false },
            fontFamily: FONT_FAMILY,
          },
          colors: [CHART_BLUE.dark],
          stroke: {
            curve: 'smooth',
            lineCap: 'round',
            width: 2.5,
          },
          markers: {
            size: 0,
            hover: { size: 4 },
          },
          // Deliberately no `fill` — see generation-capacity-line-chart.tsx
          // for why: on a `type: 'line'` sparkline it never renders a
          // visible area, and its only real effect is making the stroke
          // itself inherit the fill's colour/opacity.
          //
          // A real (if compact) axis, not sparkline mode — a reader can now
          // tell *when* a published figure dipped without hovering every
          // point.
          xaxis: {
            categories: points.map((point) => point.period),
            labels: { style: { colors: 'var(--text-subtle)', fontFamily: FONT_FAMILY, fontSize: '10px' } },
            axisTicks: { show: false },
            axisBorder: { show: false },
          },
          yaxis: { labels: { show: false } },
          grid: { show: false, padding: { left: 0, right: 0, top: 4, bottom: 0 } },
          tooltip: {
            y: {
              formatter: (value: number) => `<strong>${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}</strong>`,
              title: { formatter: () => '' },
            },
          },
        }}
      />
    </div>
  )
}
