import {
  ESCALATION_STATUS_LABELS,
  type EscalationStatus,
} from '@/api/schemas/bottlenecks'
import { cn } from '@/lib/utils'

/** `not-escalated` is neutral, not alarming — most bottlenecks never need to
 * escalate, so the absence of escalation is not itself a problem. */
const STYLES: Record<EscalationStatus, string> = {
  'not-escalated': 'bg-surface-sunken text-text-muted',
  escalated: 'bg-status-lagging-bg text-status-lagging',
  overdue: 'bg-status-at-risk-bg text-status-at-risk',
  resolved: 'bg-status-on-track-bg text-status-on-track',
}

export function EscalationStatusBadge({ status }: { status: EscalationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status],
      )}
    >
      {ESCALATION_STATUS_LABELS[status]}
    </span>
  )
}
