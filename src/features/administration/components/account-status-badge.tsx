import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from '@/api/schemas/administration'
import { cn } from '@/lib/utils'

/** Account status colouring. Suspended is the only one that reads as a problem. */
const STATUS_STYLES: Record<AccountStatus, string> = {
  active: 'bg-status-on-track-bg text-status-on-track',
  pending: 'bg-status-lagging-bg text-status-lagging',
  inactive: 'bg-status-no-data-bg text-status-no-data',
  suspended: 'bg-status-at-risk-bg text-status-at-risk',
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      {ACCOUNT_STATUS_LABELS[status]}
    </span>
  )
}
