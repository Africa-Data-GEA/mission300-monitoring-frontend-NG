import type { ValidationStatus } from '@/api/schemas/kpi-explorer'

/**
 * Fill colour per validation status for the coverage bars.
 *
 * `future` (no data available yet) is neutral, not alarming — it is a
 * catalogue fact, not a failure. Shared by the pillar-coverage bar and its
 * legend.
 */
export const STATUS_FILL: Record<ValidationStatus, string> = {
  confirmed: 'bg-status-on-track',
  'public-source': 'bg-brand-400',
  'requires-validation': 'bg-status-lagging',
  provisional: 'bg-brand-300',
  future: 'bg-border-strong',
}

export const STATUS_ORDER: readonly ValidationStatus[] = [
  'confirmed',
  'public-source',
  'requires-validation',
  'provisional',
  'future',
]
