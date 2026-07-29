import { EXECUTION_STATUS_LABELS, type ExecutionStatus } from '@/api/schemas/programs'
import type { PillarDeliveryStatus } from '@/api/schemas/pillar-dashboard'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const BAR_COLORS: Record<ExecutionStatus, string> = {
  'on-track': 'bg-status-on-track',
  'at-risk': 'bg-status-lagging',
  delayed: 'bg-status-at-risk',
  blocked: 'bg-status-at-risk',
  completed: 'bg-brand-500',
}

/** Delivery status of this pillar's programmes and projects. */
export function DeliveryStatusPanel({ status }: { status: PillarDeliveryStatus }) {
  const populated = status.counts.filter((entry) => entry.count > 0)

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-text-default">
        Delivery status — programmes and projects
      </h2>

      {status.total === 0 ? (
        <p className="mt-3 text-sm text-text-muted">
          No programmes or projects are currently tagged to this pillar.
        </p>
      ) : (
        <>
          <div
            role="img"
            aria-label={populated
              .map((entry) => `${entry.count} ${EXECUTION_STATUS_LABELS[entry.status]}`)
              .join(', ')}
            className="mt-3 flex h-3 w-full overflow-hidden rounded-pill bg-surface-sunken"
          >
            {populated.map((entry) => (
              <div
                key={entry.status}
                className={cn(BAR_COLORS[entry.status])}
                style={{ width: `${(entry.count / status.total) * 100}%` }}
              />
            ))}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-muted">
            {populated.map((entry) => (
              <li key={entry.status} className="flex items-center gap-1.5">
                <span className={cn('size-2 rounded-full', BAR_COLORS[entry.status])} />
                {EXECUTION_STATUS_LABELS[entry.status]} ({entry.count})
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}
