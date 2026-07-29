import Chart from 'react-apexcharts'
import { CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const MW_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

export function GenerationCapacityLineChart({
  points,
}: {
  points: readonly number[]
}) {
  return (
    <div
      role="img"
      aria-label="Available generation capacity trend"
      className="min-h-16"
    >
      <Chart
        type="line"
        height={72}
        series={[{ name: 'Available capacity', data: [...points] }]}
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
          // No `fill` here, deliberately: this is a `type: 'line'` chart, so
          // fill never renders a visible area under the curve — its only
          // effect turned out to be a real ApexCharts quirk where the
          // stroke's paint inherits `fill`'s color/opacity in sparkline
          // mode (confirmed by inspecting the rendered SVG: the line's own
          // `stroke` attribute took on the fill's gradient, then the fill's
          // opacity, no matter what `stroke.colors`/`stroke.opacity` said).
          // Omitting `fill` entirely leaves the stroke a plain, fully
          // opaque colour.
          tooltip: {
            x: { show: false },
            y: {
              formatter: (value: number) => `${MW_FORMATTER.format(value)} MW`,
              title: { formatter: () => '' },
            },
          },
        }}
      />
    </div>
  )
}
