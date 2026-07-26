import type { PerformanceMetric } from '@/api/schemas/state-disco'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'

export function PerformanceCard({ metric }: { metric: PerformanceMetric }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text-muted">{metric.title}</p>
        <InfoPopover
          label={metric.title}
          provenance={metric.provenance}
          details={[
            { label: 'Benchmark', value: metric.benchmarkLabel },
            { label: 'Variance', value: metric.varianceLabel },
          ]}
        />
      </div>
      <p className="mt-3 text-3xl font-semibold text-text-default">{metric.value}</p>
      <p className="mt-1 min-h-10 text-xs text-text-muted">{metric.supportingLabel}</p>
      <ProgressBar className="mt-3" label={`${metric.title} progress`} value={metric.progressPercent} />
      <p className="mt-2 text-xs text-text-muted">{metric.varianceLabel}</p>
      <TrendIndicator className="mt-3" trend={metric.trend} />
    </Card>
  )
}
