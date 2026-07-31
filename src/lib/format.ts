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

/**
 * How far a delivery deadline is away, or how far past due it is.
 *
 * Shown beneath the absolute end date in delivery tables. The absolute date
 * answers "when", but for a project already marked delayed the question a
 * reader actually has is "by how much", and making them subtract two dates in
 * their head is where that reading stops happening.
 *
 * Overdue is phrased as "4 months overdue" rather than Intl's "4 months ago":
 * a deadline in the past is a live problem, not a historical event.
 */
export function formatDeadline(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000)
  if (days === 0) return 'due today'

  const magnitude = Math.abs(days)
  const [value, unit] =
    magnitude < 31
      ? ([days, 'day'] as const)
      : magnitude < 365
        ? ([Math.round(days / 30), 'month'] as const)
        : ([Math.round(days / 365), 'year'] as const)

  if (days > 0) {
    return new Intl.RelativeTimeFormat('en', { numeric: 'always' }).format(
      value,
      unit,
    )
  }

  const overdueBy = Math.abs(value)
  return `${overdueBy} ${unit}${overdueBy === 1 ? '' : 's'} overdue`
}
