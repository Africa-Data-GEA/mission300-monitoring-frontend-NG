import type { DeliveryStatus } from '@/types/domain'

/**
 * Solid fill colour per delivery status, for stacked bars and legends.
 *
 * Kept separate from the badge styles in status-badge.tsx: a badge needs a
 * tinted background with readable text, a bar segment needs a solid block.
 * Both draw from the same tokens so the vocabulary stays consistent.
 */
export const STATUS_FILL: Record<DeliveryStatus, string> = {
  completed: 'bg-brand-700',
  'on-track': 'bg-status-on-track',
  'at-risk': 'bg-status-lagging',
  lagging: 'bg-status-lagging',
  delayed: 'bg-status-delayed',
  blocked: 'bg-status-at-risk',
  'limited-data': 'bg-status-no-data',
  provisional: 'bg-status-no-data',
}

/** Human label per status, used in legends and screen-reader summaries. */
export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  completed: 'Completed',
  'on-track': 'On track',
  'at-risk': 'At risk',
  lagging: 'Lagging',
  delayed: 'Delayed',
  blocked: 'Blocked',
  'limited-data': 'Limited data',
  provisional: 'Provisional',
}
