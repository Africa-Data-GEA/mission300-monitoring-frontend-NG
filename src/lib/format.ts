/**
 * Formatting helpers.
 *
 * All dates in the API are ISO 8601 strings in UTC. The dashboard is used by
 * Nigerian institutions, so timestamps render in Africa/Lagos unless a caller
 * says otherwise.
 */
const DISPLAY_TIME_ZONE = 'Africa/Lagos'

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: DISPLAY_TIME_ZONE,
  }).format(date)
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeZone: DISPLAY_TIME_ZONE,
  }).format(date)
}

/**
 * Relative "3 mins ago" label shown beside Last Updated.
 * Falls back to an absolute date once the gap exceeds a week, because
 * "43 days ago" is less useful to a reader than the actual date.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = date.getTime() - now.getTime()
  const diffMinutes = Math.round(diffMs / 60_000)

  if (Math.abs(diffMinutes) < 1) return 'just now'
  if (Math.abs(diffMinutes) > 60 * 24 * 7) return formatDate(iso)

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute')

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour')

  return formatter.format(Math.round(diffHours / 24), 'day')
}
