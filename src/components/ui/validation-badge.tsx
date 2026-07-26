import { VALIDATION_LABELS, type ValidationStatus } from '@/api/schemas/kpi-explorer'
import { cn } from '@/lib/utils'

/**
 * Validation-status pill.
 *
 * Promoted from the KPI Explorer catalogue on its second use in the
 * Implementation Register — both modules use the same confirmed/provisional/
 * pending/data-gap vocabulary from kpi-explorer.ts.
 *
 * A data gap is neutral, not red — a data gap is a catalogue fact, and a
 * pending value must never read as confirmed.
 */
const STYLES: Record<ValidationStatus, string> = {
  confirmed: 'bg-status-on-track-bg text-status-on-track',
  provisional: 'bg-status-lagging-bg text-status-lagging',
  pending: 'bg-surface-sunken text-text-muted',
  'data-gap': 'bg-surface-sunken text-text-subtle',
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
