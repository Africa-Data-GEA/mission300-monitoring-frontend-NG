import { BulletChart } from '@/components/ui/bullet-chart'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SourceBadge } from '@/components/ui/status-badge'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { BulletMetric } from '../../types'

/** One Section C metric: value, trend and its bullet chart. */
export function BulletMetricRow({ metric }: { metric: BulletMetric }) {
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
