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
  // The backend reuses change:0 for two different situations - a genuine
  // flat reading, and no prior period existing to compare against at all.
  // trend.label already says which one it is ("No prior period recorded
  // yet"), so the sr-only prefix below must not also claim "No change" -
  // that would tell screen reader users the metric held steady when
  // nothing was actually being compared.
  const hasNoPriorPeriod = isFlat && /no prior period/i.test(trend.label)

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
        Skipped entirely when there's no prior period - trend.label already
        says so on its own.
      */}
      {!hasNoPriorPeriod && (
        <span className="sr-only">
          {isFlat ? 'No change' : isImproving ? 'Improving:' : 'Worsening:'}
        </span>
      )}
      {trend.label}
    </span>
  )
}
