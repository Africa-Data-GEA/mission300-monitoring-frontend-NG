import { useState } from 'react'
import Chart from 'react-apexcharts'
import type { AccessChannel } from '@/api/schemas/executive-overview'
import { FilterPills } from './filter-pills'
import { compactNumber, landingChartBase } from '../lib/landing-chart-theme'

const CHART_ID = 'landing-access-channels'
const CURRENT_RED = '#a8201a'
const GOLD = '#ffb800'

/** A lightweight current-versus-target view across delivery channels. */
export function AccessChannelsChart({ channels }: { channels: readonly AccessChannel[] }) {
  const [view, setView] = useState<'absolute' | 'share'>('absolute')

  if (channels.length === 0) return null

  const withTarget = channels.filter((channel) => channel.target !== null && channel.target > 0)
  const plotted = view === 'share' ? withTarget : channels
  if (plotted.length === 0) return null

  const series =
    view === 'share'
      ? [
          {
            name: 'Share of target',
            data: plotted.map((channel) =>
              Number(
                (
                  channel.percentComplete ?? ((channel.rawValue / (channel.target as number)) * 100)
                ).toFixed(1),
              ),
            ),
          },
        ]
      : [
          { name: 'Current', data: plotted.map((channel) => channel.rawValue) },
          { name: 'Target', data: plotted.map((channel) => channel.target) },
        ]

  const base = landingChartBase(CHART_ID)

  return (
    <figure id="access-channels" className="bg-[#f7f9fb] px-4 py-5 sm:px-6">
      <figcaption className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div>
          <h3 className="text-[1rem] leading-6 font-semibold text-landing-blue">
            Connections by delivery channel
          </h3>
          <p className="mt-0.5 text-[0.6875rem] leading-4 font-medium tracking-[0.06em] text-[#667684] uppercase">
            {view === 'share' ? 'Per cent of approved target' : 'Connections'}
          </p>
        </div>
        <FilterPills
          label="Choose how connections are compared"
          value={view}
          onChange={(id) => setView(id as 'absolute' | 'share')}
          options={[
            { id: 'absolute', label: 'Absolute' },
            { id: 'share', label: '% of target' },
          ]}
        />
      </figcaption>

      <div className="mt-3 min-w-0">
        <Chart
          type="line"
          height={245}
          series={series}
          options={{
            ...base,
            chart: {
              ...base.chart,
              id: CHART_ID,
              type: 'line',
              dropShadow: { enabled: false },
            },
            colors: view === 'share' ? [CURRENT_RED] : [CURRENT_RED, GOLD],
            stroke: {
              curve: 'smooth',
              width: view === 'share' ? 2 : [2, 1.5],
              dashArray: view === 'share' ? 0 : [0, 5],
              lineCap: 'round',
            },
            markers: {
              size: view === 'share' ? 4 : [4, 3],
              strokeWidth: 2,
              strokeColors: '#f7f9fb',
              hover: { sizeOffset: 2 },
            },
            fill: { type: 'solid', opacity: 1 },
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
            legend: {
              ...base.legend,
              show: view === 'absolute',
              position: 'bottom',
              fontSize: '11px',
            },
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
      </div>
    </figure>
  )
}
