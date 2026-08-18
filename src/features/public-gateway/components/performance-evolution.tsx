import Chart from 'react-apexcharts'
import {
  LANDING_CHART_TITLE_CLASSES,
  LANDING_CHART_UNIT_CLASSES,
  landingChartBase,
} from '../lib/landing-chart-theme'

export interface EvolutionSeries {
  id: string
  title: string
  unit: string
  points: readonly { period: string; value: number }[]
}

/**
 * "Evolution of ..." line charts, modelled on the IEA electricity data
 * explorer's evolution charts — a bold title, a grey unit subtitle, then a
 * single smoothed line across real reporting periods. Pulls history from
 * every metric that has one (see public-gateway-page.tsx for what's
 * assembled into `series`): all six national-performance metrics plus the
 * electricity access rate and generation capacity headline cards — not a
 * curated pair, so every real reporting series on this payload gets a chart.
 */
export function PerformanceEvolution({ series }: { series: readonly EvolutionSeries[] }) {
  const chartable = series.filter((entry) => entry.points.length >= 2)

  if (chartable.length === 0) return null

  return (
    <section aria-labelledby="performance-evolution" className="mt-14">
      <h2
        id="performance-evolution"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        Evolution over time
      </h2>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        {chartable.map((entry) => (
          <div key={entry.id}>
            <p className={LANDING_CHART_TITLE_CLASSES}>Evolution of {entry.title.toLowerCase()}</p>
            <p className={LANDING_CHART_UNIT_CLASSES}>{entry.unit}</p>

            <div className="mt-3">
              <Chart
                type="area"
                height={260}
                series={[{ name: entry.title, data: entry.points.map((point) => point.value) }]}
                options={{
                  ...landingChartBase(),
                  xaxis: {
                    ...landingChartBase().xaxis,
                    categories: entry.points.map((point) => point.period),
                  },
                  stroke: { curve: 'smooth', width: 2.5 },
                  fill: {
                    type: 'gradient',
                    gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 95, 100] },
                  },
                  markers: { size: 0, hover: { size: 5 } },
                  legend: { show: false },
                  tooltip: {
                    ...landingChartBase().tooltip,
                    y: { formatter: (value) => `${value.toLocaleString('en-US')}` },
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
