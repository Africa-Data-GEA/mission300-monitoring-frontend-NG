import Chart from 'react-apexcharts'
import type { PillarHeadlineCard } from '@/api/schemas/pillar-dashboard'
import { CHART_BLUE } from '@/config/chart-colors'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/**
 * Current value vs. target across this pillar's headline KPIs, side by side.
 * Cards on their own only show one number each — this is the "how far from
 * target, at a glance, across all four" view the specification's headline
 * section otherwise leaves to the reader to assemble mentally.
 */
export function KpiPerformanceChart({ cards }: { cards: readonly PillarHeadlineCard[] }) {
  const charted = cards.filter(
    (card): card is PillarHeadlineCard & { rawValue: number; target: number } =>
      card.rawValue !== null && card.target !== null,
  )

  if (charted.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        No approved targets to chart for this pillar's headline indicators yet.
      </p>
    )
  }

  return (
    <Chart
      type="bar"
      height={320}
      series={[
        { name: 'Current', data: charted.map((card) => card.rawValue) },
        { name: 'Target', data: charted.map((card) => card.target) },
      ]}
      options={{
        chart: {
          type: 'bar',
          toolbar: { show: false },
          fontFamily: FONT_FAMILY,
        },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '32%' },
        },
        colors: [CHART_BLUE.dark, CHART_BLUE.lightest],
        dataLabels: { enabled: false },
        xaxis: {
          categories: charted.map((card) => card.title),
          labels: { style: { fontFamily: FONT_FAMILY, fontSize: '11px' } },
        },
        yaxis: {
          labels: { style: { fontFamily: FONT_FAMILY, fontSize: '12px' } },
        },
        legend: { fontFamily: FONT_FAMILY, fontSize: '12px' },
        grid: { borderColor: 'var(--border-default)' },
        tooltip: { y: { formatter: (value: number) => value.toLocaleString() } },
      }}
    />
  )
}
