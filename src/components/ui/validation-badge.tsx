import { VALIDATION_LABELS, type ValidationStatus } from '@/api/schemas/kpi-explorer'
import { cn } from '@/lib/utils'

/**
 * Validation-status pill, using the M300 KPI Matrix's own five-value
 * vocabulary (confirmed / public-source / requires-validation / provisional
 * / future).
 *
 * Promoted from the KPI Explorer catalogue on its second use in Programs.
 *
 * `future` (no data available yet) is neutral, not red — it is a catalogue
 * fact, and a value pending confirmation must never read as confirmed.
 */
const STYLES: Record<ValidationStatus, string> = {
  confirmed: 'bg-status-on-track-bg text-status-on-track',
  'public-source': 'bg-brand-50 text-brand-700',
  'requires-validation': 'bg-status-lagging-bg text-status-lagging',
  provisional: 'bg-status-lagging-bg text-status-lagging',
  future: 'bg-surface-sunken text-text-subtle',
}

export function ValidationBadge({ status }: { status: ValidationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[status],
      )}
    >
      {VALIDATION_LABELS[status]}
    </span>
  )
}
