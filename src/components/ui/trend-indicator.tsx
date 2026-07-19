import { cn } from '@/lib/utils'
import { resolveTrend } from '@/lib/trend'
import type { Trend } from '@/types/domain'

/**
 * Period-on-period movement pill.
 * Arrow direction and colour semantics are decided by `resolveTrend`.
 */
export function TrendIndicator({
  trend,
  className,
}: {
  trend: Trend
  className?: string
}) {
  const { isFlat, isImproving, Icon } = resolveTrend(trend)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
        isFlat
          ? 'bg-status-no-data-bg text-status-no-data'
          : isImproving
            ? 'bg-status-on-track-bg text-trend-up'
            : 'bg-status-at-risk-bg text-trend-down',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {/*
        The arrow alone is not accessible, so state the movement in words for
        screen readers. Sighted users get the same meaning from the colour.
      */}
      <span className="sr-only">
        {isFlat ? 'No change' : isImproving ? 'Improving:' : 'Worsening:'}
      </span>
      {trend.label}
    </span>
  )
}
