import {
  READINESS_LABELS,
  type ReadinessTier,
} from '@/api/schemas/kpi-explorer'
import { cn } from '@/lib/utils'

const STYLES: Record<ReadinessTier, string> = {
  core: 'bg-brand-50 text-brand-700',
  supporting: 'bg-status-lagging-bg text-status-lagging',
  future: 'bg-surface-sunken text-text-muted',
}

/** Readiness-tier pill, shared by the catalogue table and the profile. */
export function ReadinessBadge({ tier }: { tier: ReadinessTier }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[tier],
      )}
    >
      {READINESS_LABELS[tier]}
    </span>
  )
}
