import Chart from 'react-apexcharts'
import { CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

export function GenerationCapacityChart({
  points,
}: {
  points: readonly number[]
}) {
  return (
    <div
      role="img"
      aria-label="Available generation capacity trend"
      className="mt-2 min-h-20"
    >
      <Chart
        type="line"
        height={80}
        series={[{ name: 'Available capacity', data: [...points] }]}
        options={{
          chart: {
            type: 'line',
            sparkline: { enabled: true },
            toolbar: { show: false },
            animations: { enabled: false },
            fontFamily: FONT_FAMILY,
          },
          colors: [CHART_BLUE.dark],
          stroke: { curve: 'smooth', width: 3 },
          markers: {
            size: 3,
            strokeWidth: 2,
            strokeColors: 'var(--surface)',
            hover: { size: 5 },
          },
          grid: { padding: { top: 8, right: 6, bottom: 4, left: 6 } },
          tooltip: {
            y: {
              formatter: (value: number) => `${(value / 1000).toFixed(2)} GW`,
              title: { formatter: () => '' },
            },
          },
        }}
      />
    </div>
  )
}
