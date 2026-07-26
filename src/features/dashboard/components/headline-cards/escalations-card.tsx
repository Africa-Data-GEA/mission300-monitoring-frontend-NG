import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'
import { MetricCardFrame } from '../metric-card-frame'
import type { EscalationsCard as EscalationsCardData } from '../../types'
import { HEADLINE_VALUE } from './headline-value'

/** A4. Critical escalations requiring leadership attention. */
export function EscalationsCard({ data }: { data: EscalationsCardData }) {
  // Zero unresolved escalations is the target state, so present it calmly
  // rather than as an alert.
  const isClear = data.unresolvedCritical === 0 && data.overdueDecisions === 0

  return (
    <MetricCardFrame
      title={data.title}
      icon={data.icon}
      source={data.source}
      provenance={data.provenance}
      tone={isClear ? 'default' : 'alert'}
      details={[{ label: 'Target', value: data.targetLabel }]}
    >
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span
          className={cn(
            HEADLINE_VALUE,
            isClear ? 'text-status-on-track' : 'text-status-at-risk',
          )}
          // Screen readers otherwise hear a bare number with no unit.
          aria-label={`${data.unresolvedCritical} unresolved critical escalations`}
        >
          {data.unresolvedCritical}
        </span>
        {data.trend && <TrendIndicator trend={data.trend} />}
      </div>

      <p className="mt-auto pt-3 text-xs text-text-muted">
        {data.overdueDecisions} overdue · longest {data.longestDaysUnresolved}d
      </p>
    </MetricCardFrame>
  )
}
