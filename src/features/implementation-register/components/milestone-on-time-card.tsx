import type { MilestoneOnTimeCard as MilestoneOnTimeCardData } from '@/api/schemas/implementation-register'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { MetricIcon } from '@/config/metric-icons'

/** A2. Priority milestones delivered on time. */
export function MilestoneOnTimeCard({ data }: { data: MilestoneOnTimeCardData }) {
  const breakdown = [
    { label: 'Due', count: data.dueCount },
    { label: 'Completed', count: data.completedCount },
    { label: 'Delayed', count: data.delayedCount },
    { label: 'Blocked', count: data.blockedCount },
  ].filter((entry) => entry.count > 0)

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
          <MetricIcon name={data.icon} className="size-4 text-brand-600" />
        </span>
        <InfoPopover
          provenance={data.provenance}
          label={data.title}
          details={[{ label: 'Target', value: data.targetLabel }]}
        />
      </div>

      <p title={data.title} className="mt-3 line-clamp-2 min-h-9 text-sm text-text-muted">
        {data.title}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="text-4xl leading-none font-semibold tracking-tight text-text-default">
          {data.percentOnTime}%
        </span>
        {data.trend && <TrendIndicator trend={data.trend} />}
      </div>

      <ProgressBar value={data.percentOnTime} label={data.title} className="mt-3" />

      <p className="mt-auto pt-3 text-xs text-text-muted">
        {breakdown.map((entry) => `${entry.count} ${entry.label}`).join(' • ')}
      </p>
    </Card>
  )
}
