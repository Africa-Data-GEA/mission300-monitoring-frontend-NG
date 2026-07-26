import type { WorkflowStatus } from '@/api/schemas/data-submissions'
import { cn } from '@/lib/utils'

const toneClasses: Record<WorkflowStatus['tone'], string> = {
  neutral: 'bg-surface-sunken text-text-muted',
  info: 'bg-status-info/10 text-status-info',
  warning: 'bg-status-warning/15 text-text-default',
  danger: 'bg-status-at-risk/10 text-status-at-risk',
  success: 'bg-status-on-track/10 text-status-on-track',
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return (
    <span className={cn('inline-flex rounded-pill px-2 py-1 text-xs font-medium', toneClasses[status.tone])}>
      {status.label}
    </span>
  )
}
