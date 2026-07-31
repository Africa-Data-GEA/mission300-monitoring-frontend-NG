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
 *
 * EVERY channel gets a row, including one with no approved target. Filtering
 * those out left the chart showing two bars beside three cards, which reads as
 * a rendering fault rather than a deliberate gap. An untargeted channel plots
 * as an empty track labelled "No approved target" — the row is present and
 * accounted for, and no percentage is implied where none exists.
 */
export function AccessDeliveryChart({ channels }: { channels: readonly AccessChannel[] }) {
  if (channels.length === 0) return null

  const categories = channels.map((channel) => channel.title)
  const longestLabel = Math.max(...categories.map((title) => title.length))

  return (
    <div
      role="img"
      aria-label="Current progress toward the approved target for each access delivery channel"
    >
      <Chart
        type="bar"
        /*
          ~58px per row, not 110. At 110 with a 55% bar height the bars came
          out roughly 60px thick — heavier than the headline figures they
          annotate, and they left the card mostly empty space above and below
          the plot. A progress rail wants to read as a rail.
        */
        height={Math.max(140, channels.length * 58)}
        series={[
          {
            name: 'Current',
            // 0 rather than null: Apex drops null points entirely, taking the
            // row's background track with them and reopening the same gap.
            data: channels.map((c) => c.percentComplete ?? 0),
          },
        ]}
        options={{
          chart: {
            type: 'bar',
            toolbar: { show: false },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 500,
              dynamicAnimation: { enabled: true, speed: 500 },
            },
            fontFamily: FONT_FAMILY,
          },
          plotOptions: {
            bar: {
              horizontal: true,
              barHeight: '40%',
              borderRadius: 4,
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
            // Clears the bar's rounded end rather than sitting on top of it.
            offsetX: 22,
            textAnchor: 'start',
            formatter: (value: number, opts) =>
              channels[opts?.dataPointIndex ?? 0]?.percentComplete === null
                ? 'No approved target'
                : `${value.toFixed(0)}%`,
            style: {
              colors: ['var(--text-default)'],
              fontFamily: FONT_FAMILY,
              fontSize: '11px',
              fontWeight: 600,
            },
            background: { enabled: false },
          },
          colors: [CHART_BLUE.dark],
          grid: { padding: { right: 44, top: 0, bottom: 0 } },
          tooltip: {
            y: {
              formatter: (value: number, opts) => {
                const channel = channels[opts?.dataPointIndex ?? 0]
                if (!channel || channel.percentComplete === null) {
                  return `${numberFormatter.format(channel?.rawValue ?? 0)} delivered — no approved target`
                }
                return `${value.toFixed(1)}% (${numberFormatter.format(channel.rawValue)} of ${numberFormatter.format(channel.target ?? 0)})`
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
              maxWidth: Math.min(220, Math.max(110, longestLabel * 6.5)),
              style: {
                colors: 'var(--text-default)',
                fontFamily: FONT_FAMILY,
                fontSize: '12px',
              },
            },
          },
          legend: { show: false },
          /*
            The channel-name gutter is a fixed pixel width, so without these it
            keeps its full ~210px on a phone and squeezes the plot into what is
            left. Each step trades label room for rail length, and the smallest
            step drops the percentage labels entirely — below ~380px there is
            no room to place them clear of the bar, and the figure is on the
            channel card directly beneath anyway.
          */
          responsive: [
            {
              breakpoint: 640,
              options: {
                yaxis: {
                  labels: { maxWidth: 120, style: { fontSize: '11px' } },
                },
                dataLabels: { offsetX: 12, style: { fontSize: '10px' } },
                grid: { padding: { right: 28, top: 0, bottom: 0 } },
              },
            },
            {
              breakpoint: 380,
              options: {
                yaxis: {
                  labels: { maxWidth: 92, style: { fontSize: '10px' } },
                },
                dataLabels: { enabled: false },
                grid: { padding: { right: 8, top: 0, bottom: 0 } },
              },
            },
          ],
        }}
      />
    </div>
  )
}
