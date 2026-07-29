import { FUNDING_STATUS_LABELS, type FundingStatus } from '@/api/schemas/programs'
import { cn } from '@/lib/utils'

const STYLES: Record<FundingStatus, string> = {
  committed: 'bg-status-lagging-bg text-status-lagging',
  disbursing: 'bg-status-on-track-bg text-status-on-track',
  'fully-disbursed': 'bg-brand-50 text-brand-700',
  'at-risk': 'bg-status-at-risk-bg text-status-at-risk',
  unfunded: 'bg-surface-sunken text-text-subtle',
}

export function FundingStatusBadge({ status }: { status: FundingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status],
      )}
    >
      {FUNDING_STATUS_LABELS[status]}
    </span>
  )
}
