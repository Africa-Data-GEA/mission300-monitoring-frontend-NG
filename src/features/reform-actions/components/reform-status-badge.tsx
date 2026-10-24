import { REFORM_STATUS_LABELS, type ReformStatus } from '@/api/schemas/reform-actions'
import { cn } from '@/lib/utils'

const TONE: Record<ReformStatus, string> = {
  'not-yet-due': 'bg-surface-sunken text-text-muted',
  'in-progress-on-track': 'bg-emerald-50 text-emerald-700',
  'in-progress-minor-delays': 'bg-amber-50 text-amber-700',
  'in-progress-at-risk': 'bg-orange-50 text-orange-700',
  delayed: 'bg-red-50 text-red-700',
  completed: 'bg-brand-50 text-brand-700',
}

export function ReformStatusBadge({ status }: { status: ReformStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', TONE[status])}>
      {REFORM_STATUS_LABELS[status]}
    </span>
  )
}
