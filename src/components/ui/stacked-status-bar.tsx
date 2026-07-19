import { STATUS_FILL, STATUS_LABEL } from '@/lib/status-colors'
import { cn } from '@/lib/utils'
import type { DeliveryStatus } from '@/types/domain'

export interface StatusCount {
  readonly status: DeliveryStatus
  readonly count: number
}

/**
 * Horizontal stacked bar of record counts by delivery status — the visual the
 * specification mandates for the pillar side of the Section D split panel.
 *
 * Counts are counted, never averaged: the specification is explicit that
 * unrelated performance percentages must not be averaged into a single score.
 */
export function StackedStatusBar({
  counts,
  total,
  label,
  emptyLabel = 'No approved priority records',
  className,
}: {
  counts: readonly StatusCount[]
  total: number
  /** Pillar name, used to build the accessible description. */
  label: string
  emptyLabel?: string
  className?: string
}) {
  const populated = counts.filter((entry) => entry.count > 0)

  /*
   * A pillar with no approved records must read as "nothing to report" rather
   * than rendering an empty or, worse, a full-width bar that implies a status.
   */
  if (total === 0 || populated.length === 0) {
    return (
      <p className={cn('text-xs text-text-subtle', className)}>{emptyLabel}</p>
    )
  }

  const description = `${label}: ${populated
    .map((entry) => `${entry.count} ${STATUS_LABEL[entry.status].toLowerCase()}`)
    .join(', ')}, ${total} total`

  return (
    <div
      role="img"
      aria-label={description}
      className={cn('flex h-2.5 w-full overflow-hidden rounded-pill', className)}
    >
      {populated.map((entry) => (
        <div
          key={entry.status}
          data-testid={`segment-${entry.status}`}
          title={`${STATUS_LABEL[entry.status]}: ${entry.count}`}
          className={STATUS_FILL[entry.status]}
          style={{ width: `${(entry.count / total) * 100}%` }}
        />
      ))}
    </div>
  )
}

/** Shared legend for the stacked bars. */
export function StatusLegend({
  statuses,
  className,
}: {
  statuses: readonly DeliveryStatus[]
  className?: string
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {statuses.map((status) => (
        <li key={status} className="flex items-center gap-1.5 text-xs text-text-muted">
          <span
            aria-hidden="true"
            className={cn('size-2 shrink-0 rounded-full', STATUS_FILL[status])}
          />
          {STATUS_LABEL[status]}
        </li>
      ))}
    </ul>
  )
}
