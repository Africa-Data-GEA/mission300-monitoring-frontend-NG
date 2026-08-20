import Chart from 'react-apexcharts'
import { InfoPopover } from '@/components/ui/info-popover'
import type { AccessChannel } from '@/features/dashboard/types'
import {
  LANDING_CHART_TITLE_CLASSES,
  LANDING_CHART_UNIT_CLASSES,
  landingChartBase,
} from '../lib/landing-chart-theme'

/**
 * "Access connections by channel" — modelled on IEA's fuel-mix bar chart,
 * but grouped rather than stacked: grid, mini-grid and solar-home-system
 * connections are independent delivery routes to the same 300M target, not
 * components that sum to one whole the way a fuel mix does. Current vs.
 * target per channel, from real AccessChannel figures (rawValue/target) —
 * the channel with no approved target yet (new grid connections, per
 * NationalStatement's own note) simply has no target bar.
 */
export function AccessChannelsChart({ channels }: { channels: readonly AccessChannel[] }) {
  if (channels.length === 0) return null

  const hasAnyTarget = channels.some((channel) => channel.target !== null)

  return (
    <section aria-labelledby="access-channels" className="mt-14">
      <h2
        id="access-channels"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        Access connections by channel
      </h2>

      <div className="mt-4">
        <p className={LANDING_CHART_TITLE_CLASSES}>Current connections against approved targets</p>
        <p className={LANDING_CHART_UNIT_CLASSES}>Connections</p>

        <div className="mt-3">
          <Chart
            type="bar"
            height={320}
            series={
              hasAnyTarget
                ? [
                    { name: 'Current', data: channels.map((channel) => channel.rawValue) },
                    { name: 'Target', data: channels.map((channel) => channel.target) },
                  ]
                : [{ name: 'Current', data: channels.map((channel) => channel.rawValue) }]
            }
            options={{
              ...landingChartBase(),
              plotOptions: { bar: { columnWidth: '55%', borderRadius: 2 } },
              xaxis: {
                ...landingChartBase().xaxis,
                categories: channels.map((channel) => channel.title),
              },
              tooltip: {
                ...landingChartBase().tooltip,
                y: { formatter: (value) => (value === null ? 'No approved target' : value.toLocaleString('en-US')) },
              },
            }}
          />
        </div>

        {/*
          Each channel's own source and validation status, per
          docs/public-gateway-home.md §01 — every number on this page must
          carry its provenance. One combined popover on the chart title
          would be dishonest here: the three channels don't necessarily
          share a source or a validation status.
        */}
        <ul aria-label="Sources for the figures above" className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {channels.map((channel) => (
            <li key={channel.id} className="flex items-center gap-1 text-xs text-text-muted">
              {channel.title}
              <InfoPopover
                label={`About ${channel.title}`}
                provenance={channel.provenance}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
