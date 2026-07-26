import {
  SEVERITY_LABELS,
  type RegisterSeverity,
} from '@/api/schemas/bottlenecks'
import { cn } from '@/lib/utils'

const STYLES: Record<RegisterSeverity, string> = {
  critical: 'bg-status-at-risk-bg text-status-at-risk',
  high: 'bg-status-lagging-bg text-status-lagging',
  medium: 'bg-surface-sunken text-text-muted',
  low: 'bg-surface-sunken text-text-subtle',
}

export function SeverityBadge({ severity }: { severity: RegisterSeverity }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[severity],
      )}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  )
}
