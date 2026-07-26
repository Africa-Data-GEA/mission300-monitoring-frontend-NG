import type { DelayedOrBlockedCard, EvidenceOverdueCard } from '@/api/schemas/implementation-register'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { MetricIcon } from '@/config/metric-icons'
import { cn } from '@/lib/utils'

/**
 * A3/A4. Exception card, shared by "Delayed or blocked records" and "Records
 * requiring evidence or update" — both are zero-target alert counts with the
 * same shape, matching bottlenecks' AlertCard styling.
 */
export function ExceptionCard({ data }: { data: DelayedOrBlockedCard | EvidenceOverdueCard }) {
  const isClear = data.count === 0

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
            isClear ? 'bg-brand-50' : 'bg-status-at-risk-bg',
          )}
        >
          <MetricIcon
            name={data.icon}
            className={cn('size-4', isClear ? 'text-brand-600' : 'text-status-at-risk')}
          />
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
        <span
          className={cn(
            'text-4xl leading-none font-semibold tracking-tight whitespace-nowrap',
            isClear ? 'text-status-on-track' : 'text-status-at-risk',
          )}
        >
          {data.count}
        </span>
        <TrendIndicator trend={data.trend} />
      </div>

      <p className="mt-auto pt-3 text-xs text-text-muted">{data.supportingLabel}</p>
    </Card>
  )
}
