import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import { MetricCardFrame } from '../metric-card-frame'
import type { MilestoneDeliveryCard as MilestoneDeliveryCardData } from '../../types'
import { HEADLINE_VALUE } from './headline-value'

/** A1. Priority milestones delivered on time. */
export function MilestoneDeliveryCard({
  data,
}: {
  data: MilestoneDeliveryCardData
}) {
  /*
   * Zero counts are noise on a card this size — "0 blocked" tells a reader
   * nothing they need at a glance, and the full breakdown is one click away in
   * the popover. Showing only what is non-zero also keeps the line from
   * wrapping.
   */
  const populated = data.breakdown.filter((entry) => entry.count > 0)

  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      details={[
        { label: 'Target', value: data.targetLabel },
        { label: 'Baseline', value: data.baselineLabel },
        {
          label: 'Full breakdown',
          value: data.breakdown
            .map((entry) => `${entry.count} ${entry.label}`)
            .join(', '),
        },
      ]}
    >
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className={cn(HEADLINE_VALUE, 'text-text-default')}>
          {data.percentComplete}%
        </span>
        {data.trend && <TrendIndicator trend={data.trend} />}
      </div>

      <ProgressBar
        value={data.percentComplete}
        label={data.title}
        className="mt-3"
      />

      <p className="mt-auto pt-2 text-xs text-text-muted">
        {populated.map((entry) => `${entry.count} ${entry.label}`).join(' • ')}
      </p>
    </MetricCardFrame>
  )
}
