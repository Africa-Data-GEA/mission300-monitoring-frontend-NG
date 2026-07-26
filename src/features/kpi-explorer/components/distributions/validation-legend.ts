import type { ValidationStatus } from '@/api/schemas/kpi-explorer'

/**
 * Fill colour per validation status for the coverage bars.
 *
 * A data gap is neutral, not alarming — it is a catalogue fact, not a failure.
 * Shared by the pillar-coverage bar and its legend.
 */
export const STATUS_FILL: Record<ValidationStatus, string> = {
  confirmed: 'bg-status-on-track',
  provisional: 'bg-status-lagging',
  pending: 'bg-brand-300',
  'data-gap': 'bg-border-strong',
}

export const STATUS_ORDER: readonly ValidationStatus[] = [
  'confirmed',
  'provisional',
  'pending',
  'data-gap',
]
