import { TriangleAlert } from 'lucide-react'
import type { AlertCard as AlertCardData } from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { cn } from '@/lib/utils'

/**
 * One Section A headline alert card.
 *
 * The specification restricts operational benchmarks to these four cards and
 * every one targets zero, so a non-zero count is always the alert state —
 * unlike the dashboard's headline cards, there is no "good" non-zero value
 * here to render calmly.
 */
export function AlertCard({ data }: { data: AlertCardData }) {
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
          <TriangleAlert
            aria-hidden="true"
            className={cn('size-4', isClear ? 'text-brand-600' : 'text-status-at-risk')}
          />
        </span>
        <InfoPopover
          provenance={data.provenance}
          label={data.title}
          details={[{ label: 'Target', value: data.targetLabel }]}
        />
      </div>

      <p
        title={data.title}
        className="mt-3 line-clamp-2 min-h-9 text-sm text-text-muted"
      >
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
