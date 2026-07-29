import Chart from 'react-apexcharts'
import { CHART_BLUE } from '@/config/chart-colors'
import type { AccessChannel } from '../types'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'
const numberFormatter = new Intl.NumberFormat('en-US')

/**
 * Current progress toward the approved target for each delivery channel, as
 * one horizontal bar chart.
 *
 * Plotted as a single series — percent of target — against a fixed background
 * track, not a second "target" series: because current is already normalised
 * to percent-of-target, a target series is always exactly 100 for every
 * channel, so drawing it as a bar just produces a full-width bar behind a
 * short one on every row. A background track reads as the same "how far to
 * the target" story without that artefact.
 *
 * The bar's own label is the percentage only — the raw current and target
 * counts are deliberately left off the chart. They're already stated, in
 * full, on the channel card next to it; repeating them here just adds text
 * to parse without adding information, and risks the label overflowing on
 * channels with very small percentages.
 */
export function AccessDeliveryChart({ channels }: { channels: readonly AccessChannel[] }) {
  const withTarget = channels.filter(
    (channel): channel is AccessChannel & { percentComplete: number; target: number } =>
      channel.percentComplete !== null && channel.target !== null,
  )

  if (withTarget.length === 0) return null

  const categories = withTarget.map((channel) => channel.title)
  const longestLabel = Math.max(...categories.map((title) => title.length))

  return (
    <div
      role="img"
      aria-label="Current progress toward the approved target for each access delivery channel"
    >
      <Chart
        type="bar"
        height={Math.max(160, withTarget.length * 110)}
        series={[{ name: 'Current', data: withTarget.map((c) => c.percentComplete) }]}
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
            formatter: (value: number) => `${value.toFixed(0)}%`,
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
            y: {
              formatter: (value: number, opts) => {
                const dataPointIndex = opts?.dataPointIndex ?? 0
                const channel = withTarget[dataPointIndex]
                return `${value.toFixed(1)}% (${numberFormatter.format(channel?.rawValue ?? 0)} of ${numberFormatter.format(channel?.target ?? 0)})`
              },
            },
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
