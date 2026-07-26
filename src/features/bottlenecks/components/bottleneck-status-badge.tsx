import {
  BOTTLENECK_STATUS_LABELS,
  type BottleneckStatus,
} from '@/api/schemas/bottlenecks'
import { cn } from '@/lib/utils'

const STYLES: Record<BottleneckStatus, string> = {
  open: 'bg-status-lagging-bg text-status-lagging',
  'in-progress': 'bg-status-lagging-bg text-status-lagging',
  blocked: 'bg-status-at-risk-bg text-status-at-risk',
  escalated: 'bg-status-at-risk-bg text-status-at-risk',
  resolved: 'bg-status-on-track-bg text-status-on-track',
}

export function BottleneckStatusBadge({ status }: { status: BottleneckStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status],
      )}
    >
      {BOTTLENECK_STATUS_LABELS[status]}
    </span>
  )
}
