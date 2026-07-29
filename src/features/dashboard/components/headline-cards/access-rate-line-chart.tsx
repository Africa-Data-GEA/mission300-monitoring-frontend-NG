import Chart from 'react-apexcharts'
import { CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

export function AccessRateLineChart({ points }: { points: readonly number[] }) {
  return (
    <div role="img" aria-label="Electricity access rate trend" className="min-h-16">
      <Chart
        type="line"
        height={72}
        series={[{ name: 'Access rate', data: [...points] }]}
        options={{
          chart: {
            type: 'line',
            animations: { enabled: false },
            sparkline: { enabled: true },
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
          tooltip: {
            x: { show: false },
            y: {
              formatter: (value: number) => `${value}%`,
              title: { formatter: () => '' },
            },
          },
        }}
      />
    </div>
  )
}
