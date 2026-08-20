import Chart from 'react-apexcharts'
import { CHART_BLUE } from '@/config/chart-colors'
import type { KpiBreakdown } from '../api'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/**
 * One KPI's real per-DisCo/state breakdown as a horizontal bar chart —
 * mirrors AccessDeliveryChart's proven layout (background track, inline
 * data labels, no legend needed for a single series).
 */
export function RegionalPerformanceChart({
  title,
  items,
}: {
  title: string
  items: KpiBreakdown
}) {
  if (items.length === 0) return null

  const categories = items.map((item) => `${item.state} (${item.disco})`)
  const longestLabel = Math.max(...categories.map((label) => label.length))

  return (
    <div role="img" aria-label={`${title} by DisCo`}>
      <h3 className="text-sm font-medium text-text-muted">{title}</h3>
      <Chart
        type="bar"
        height={Math.max(140, items.length * 60)}
        series={[{ name: title, data: items.map((item) => item.value) }]}
        options={{
          chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: { enabled: false },
            fontFamily: FONT_FAMILY,
          },
          plotOptions: {
            bar: {
              horizontal: true,
              barHeight: '55%',
              borderRadius: 6,
              borderRadiusApplication: 'end',
              colors: {
                backgroundBarColors: ['var(--surface-sunken)'],
                backgroundBarOpacity: 1,
                backgroundBarRadius: 6,
              },
            },
          },
          dataLabels: {
            enabled: true,
            offsetX: 14,
            textAnchor: 'start',
            formatter: (value: number) => `${value.toFixed(1)}%`,
            style: {
              colors: ['var(--text-default)'],
              fontFamily: FONT_FAMILY,
              fontSize: '12px',
              fontWeight: 600,
            },
            background: { enabled: false },
          },
          colors: [CHART_BLUE.dark],
          grid: { padding: { right: 36, top: 8, bottom: 8 } },
          tooltip: {
            y: { formatter: (value: number) => `<strong>${value.toFixed(2)}%</strong>` },
          },
          xaxis: {
            min: 0,
            max: 100,
            categories,
            labels: {
              formatter: (value: string) => `${Math.round(Number(value))}%`,
              style: { colors: 'var(--text-muted)', fontFamily: FONT_FAMILY },
            },
          },
          yaxis: {
            labels: {
              maxWidth: Math.min(260, Math.max(120, longestLabel * 7)),
              style: { colors: 'var(--text-default)', fontFamily: FONT_FAMILY },
            },
          },
          legend: { show: false },
        }}
      />
    </div>
  )
}
