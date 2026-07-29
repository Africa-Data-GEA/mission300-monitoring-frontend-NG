import {
  EXECUTION_STATUS_LABELS,
  type ExecutionStatus,
} from '@/api/schemas/programs'
import { cn } from '@/lib/utils'

const STYLES: Record<ExecutionStatus, string> = {
  'on-track': 'bg-status-on-track-bg text-status-on-track',
  'at-risk': 'bg-status-lagging-bg text-status-lagging',
  delayed: 'bg-status-at-risk-bg text-status-at-risk',
  blocked: 'bg-status-at-risk-bg text-status-at-risk',
  completed: 'bg-brand-50 text-brand-700',
}

export function ExecutionStatusBadge({ status }: { status: ExecutionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status],
      )}
    >
      {EXECUTION_STATUS_LABELS[status]}
    </span>
  )
}
