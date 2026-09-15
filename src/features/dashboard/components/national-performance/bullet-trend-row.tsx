import Chart from 'react-apexcharts'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { CHART_BLUE } from '@/config/chart-colors'
import type { BulletMetric } from '../../types'

const FONT_FAMILY = 'Google Sans, ui-sans-serif, system-ui, sans-serif'

/**
 * The trend-view counterpart to BulletMetricRow — stakeholder feedback
 * asked to see a target's evolution over the reporting cycle, not only its
 * current position against baseline/target. Reads the same `metric.history`
 * series the KPI Explorer's own charts are built from.
 */
export function BulletTrendRow({ metric }: { metric: BulletMetric }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-text-default">{metric.title}</h3>
        <InfoPopover
          provenance={metric.provenance}
          label={metric.title}
          details={[{ label: 'Target', value: metric.targetLabel }]}
        />
      </div>

      {metric.history.length >= 2 ? (
        <div className="mt-3 min-h-32 flex-1">
          <Chart
            type="area"
            height="100%"
            series={[{ name: metric.title, data: metric.history.map((point) => point.value) }]}
            options={{
              chart: {
                type: 'area',
                animations: { enabled: false },
                toolbar: { show: false },
                fontFamily: FONT_FAMILY,
              },
              colors: [CHART_BLUE.dark],
              stroke: { curve: 'smooth', lineCap: 'round', width: 2.5 },
              fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90, 100] },
              },
              markers: { size: 0, hover: { size: 5 } },
              // Was hidden entirely — a reader had no way to tell *when* a
              // dip happened without hovering every point. A real, labelled
              // axis (still light-touch: no ticks/border, small muted text)
              // answers that at a glance.
              xaxis: {
                categories: metric.history.map((point) => point.period),
                labels: { style: { colors: 'var(--text-subtle)', fontFamily: FONT_FAMILY, fontSize: '11px' } },
                axisTicks: { show: false },
                axisBorder: { show: false },
              },
              yaxis: { labels: { show: false } },
              // Left/right insets keep the first and last point's value
              // label and axis tick inside the plot area — at zero padding
              // both were clipped by the chart edge ("15.55" rendered as
              // "5.55", "Q3 2025" as "3 2025").
              grid: { show: false, padding: { left: 16, right: 16, top: 8, bottom: 0 } },
              tooltip: {
                y: {
                  formatter: (value: number) => `<strong>${value.toLocaleString('en-US')}</strong>`,
                  title: { formatter: (seriesName: string) => seriesName },
                },
              },
            }}
          />
        </div>
      ) : (
        <p className="mt-3 flex-1 text-xs text-text-subtle">
          Not enough reporting periods yet to plot a trend.
        </p>
      )}
    </Card>
  )
}
