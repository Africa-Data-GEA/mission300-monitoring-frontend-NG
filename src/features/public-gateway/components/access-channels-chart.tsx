import { useState } from 'react'
import Chart from 'react-apexcharts'
import type { AccessChannel } from '@/api/schemas/executive-overview'
import { ChartCard } from './chart-card'
import { FilterPills } from './filter-pills'
import { LANDING_MUTED, compactNumber, landingChartBase } from '../lib/landing-chart-theme'

const CHART_ID = 'landing-access-channels'

/**
 * Access connections by delivery channel — current against approved target.
 *
 * GROUPED, NOT STACKED. Grid, mini-grid and solar home systems are independent
 * routes to the same target, not components that sum to one whole the way a
 * fuel mix does. Stacking them would assert an aggregate nobody has approved.
 *
 * THE VIEW TOGGLE IS THE POINT OF THIS CHART. The three channels differ by an
 * order of magnitude, so on an absolute axis the smaller two are a smear at the
 * bottom and the chart says only "grid is biggest", which the reader already
 * knew. Switching to share-of-target re-bases every channel on its own approved
 * commitment and answers the question that actually matters: which delivery
 * route is keeping its promise. Neither view is the honest one on its own —
 * absolute hides progress, percentage hides scale — so the page offers both
 * rather than picking for the reader.
 *
 * A channel with no approved target drops out of the percentage view entirely
 * and is named in the footnote. It is not shown at 0%, and no target is inferred
 * for it: publishing the absence of a target is itself a credibility signal.
 */
export function AccessChannelsChart({ channels }: { channels: readonly AccessChannel[] }) {
  const [view, setView] = useState<'absolute' | 'share'>('absolute')

  if (channels.length === 0) return null

  const withTarget = channels.filter((channel) => channel.target !== null)
  const withoutTarget = channels.filter((channel) => channel.target === null)
  const plotted = view === 'share' ? withTarget : channels

  if (plotted.length === 0) return null

  const series =
    view === 'share'
      ? [
          {
            name: 'Share of approved target',
            data: plotted.map((channel) =>
              // percentComplete is the API's own computed figure; falling back
              // to the ratio keeps the chart correct if only the raw pair is
              // sent, rather than dropping a bar.
              Number(
                (channel.percentComplete ?? (channel.rawValue / (channel.target as number)) * 100).toFixed(1),
              ),
            ),
          },
        ]
      : [
          { name: 'Current', data: plotted.map((channel) => channel.rawValue) },
          { name: 'Approved target', data: plotted.map((channel) => channel.target) },
        ]

  const base = landingChartBase(CHART_ID)

  return (
    <ChartCard
      id="access-channels"
      title="Connections by delivery channel"
      description="Each channel is an independent route to the national access target, reported separately by the institution responsible for it."
      unit={view === 'share' ? 'Per cent of approved target' : 'Connections'}
      controls={
        <FilterPills
          label="Choose how connections are compared"
          value={view}
          onChange={(id) => setView(id as 'absolute' | 'share')}
          options={[
            { id: 'absolute', label: 'Absolute' },
            { id: 'share', label: '% of target' },
          ]}
        />
      }
      source={channels.map((channel) => `${channel.title} — ${channel.provenance.source}`).join(' · ')}
      chartId={CHART_ID}
      dataset={{
        headers: ['Channel', 'Current', 'Approved target', 'Share of target (%)', 'Source', 'Last updated'],
        rows: channels.map((channel) => [
          channel.title,
          channel.rawValue,
          channel.target,
          channel.percentComplete,
          channel.provenance.source,
          channel.provenance.lastUpdated,
        ]),
      }}
      footnote={
        withoutTarget.length > 0
          ? `${withoutTarget.map((channel) => channel.title).join(', ')} has no approved target yet, so it is shown by volume only and is excluded from the share-of-target view.`
          : undefined
      }
    >
      <Chart
        type="bar"
        height={320}
        series={series}
        options={{
          ...base,
          colors: view === 'share' ? ['#004972'] : ['#004972', LANDING_MUTED],
          plotOptions: {
            bar: { columnWidth: view === 'share' ? '38%' : '58%', borderRadius: 0, dataLabels: { position: 'top' } },
          },
          xaxis: {
            ...base.xaxis,
            categories: plotted.map((channel) => channel.title),
          },
          yaxis: {
            ...base.yaxis,
            max: view === 'share' ? 100 : undefined,
            labels: {
              ...(base.yaxis as { labels?: object }).labels,
              formatter: (value: number) =>
                view === 'share' ? `${value.toFixed(0)}%` : compactNumber(value),
            },
          },
          legend: { ...base.legend, show: view === 'absolute' },
          tooltip: {
            ...base.tooltip,
            y: {
              formatter: (value: number | null) =>
                value === null
                  ? 'No approved target'
                  : view === 'share'
                    ? `${value.toFixed(1)}% of target`
                    : value.toLocaleString('en-US'),
            },
          },
        }}
      />
    </ChartCard>
  )
}
