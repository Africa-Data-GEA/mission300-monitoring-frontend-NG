import {
  REGISTER_PRIORITY_LABELS,
  type RegisterPriority,
} from '@/api/schemas/implementation-register'
import { cn } from '@/lib/utils'

export function PriorityBadge({ priority }: { priority: RegisterPriority }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        priority === 'priority'
          ? 'bg-status-at-risk-bg text-status-at-risk'
          : 'bg-surface-sunken text-text-muted',
      )}
    >
      {REGISTER_PRIORITY_LABELS[priority]}
    </span>
  )
}
