import { BulletChart } from '@/components/ui/bullet-chart'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SourceBadge } from '@/components/ui/status-badge'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { BulletMetric } from '../types'

/**
 * Section C — National Performance and Target Progress.
 *
 * Every metric is a horizontal bullet chart on its own scale, showing
 * baseline, current value, the expected value for the selected period, and
 * the approved target where one exists.
 */
export function NationalPerformanceSection({
  metrics,
}: {
  metrics: readonly BulletMetric[]
}) {
  return (
    <Card variant="well" className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-text-default">
          National performance and target progress
        </h2>
        <BulletLegend />
      </div>

      <ul className="mt-4 grid gap-3 xl:grid-cols-2">
        {metrics.map((metric) => (
          <li key={metric.id}>
            <BulletMetricRow metric={metric} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

function BulletMetricRow({ metric }: { metric: BulletMetric }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-text-default">{metric.title}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <SourceBadge source={metric.source} />
          <InfoPopover
            provenance={metric.provenance}
            label={metric.title}
            details={[
              { label: 'Target', value: metric.targetLabel },
              { label: 'Baseline', value: String(metric.baseline) },
              {
                label: 'Expected this period',
                value: metric.expected === null ? null : String(metric.expected),
              },
              { label: 'Note', value: metric.caption },
            ]}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-2xl font-semibold tracking-tight text-text-default">
          {metric.value}
        </span>
        {metric.trend && <TrendIndicator trend={metric.trend} />}
      </div>

      <BulletChart
        className="mt-3"
        current={metric.current}
        baseline={metric.baseline}
        expected={metric.expected}
        target={metric.target}
        scaleMin={metric.scaleMin}
        scaleMax={metric.scaleMax}
        direction={metric.direction}
        label={metric.title}
        valueLabel={metric.value}
      />

      {/* Target only. Caveats and methodology are in the popover. */}
      <p className="mt-2 text-xs text-text-muted">{metric.targetLabel}</p>
    </Card>
  )
}

/** Explains the three tick marks, which are otherwise unlabelled. */
function BulletLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-0.5 rounded-full bg-text-subtle" />
        Baseline
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-0.5 rounded-full bg-text-muted" />
        Expected this period
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-1 rounded-full bg-text-default" />
        Target
      </li>
    </ul>
  )
}
