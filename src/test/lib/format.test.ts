import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/format'

/*
 * All assertions here are timezone-sensitive by design: the helpers pin output
 * to Africa/Lagos (UTC+1) so a developer in another timezone sees the same
 * values a Nigerian user would.
 */
describe('formatDateTime', () => {
  it('renders an ISO timestamp in Africa/Lagos', () => {
    // 09:12 UTC is 10:12 in Lagos (UTC+1, no daylight saving).
    expect(formatDateTime('2025-10-14T09:12:00Z')).toContain('10:12')
  })

  it('includes the date as well as the time', () => {
    const result = formatDateTime('2025-10-14T09:12:00Z')

    expect(result).toContain('2025')
    expect(result).toContain('14')
  })

  it('returns an em dash for an unparseable value', () => {
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  it('returns an em dash for an empty string', () => {
    expect(formatDateTime('')).toBe('—')
  })
})

describe('formatDate', () => {
  it('renders the date without a time component', () => {
    const result = formatDate('2025-10-14T09:12:00Z')

    expect(result).toContain('2025')
    expect(result).not.toContain('10:12')
  })

  it('returns an em dash for an unparseable value', () => {
    expect(formatDate('nope')).toBe('—')
  })

  /*
   * A UTC timestamp late in the day rolls into the next date in Lagos.
   * Pinning this prevents a future refactor from silently dropping the zone.
   */
  it('applies the Lagos offset when it changes the calendar day', () => {
    expect(formatDate('2025-10-14T23:30:00Z')).toContain('15')
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2025-10-14T12:00:00Z')

  it('reports sub-minute gaps as "just now"', () => {
    expect(formatRelativeTime('2025-10-14T11:59:40Z', now)).toBe('just now')
  })

  it('reports minutes', () => {
    expect(formatRelativeTime('2025-10-14T11:57:00Z', now)).toBe('3 minutes ago')
  })

  it('reports hours once past an hour', () => {
    expect(formatRelativeTime('2025-10-14T09:00:00Z', now)).toBe('3 hours ago')
  })

  it('reports days once past a day', () => {
    expect(formatRelativeTime('2025-10-11T12:00:00Z', now)).toBe('3 days ago')
  })

  /*
   * Beyond a week "43 days ago" is less useful than the actual date, so the
   * helper deliberately switches representation.
   */
  it('falls back to an absolute date beyond one week', () => {
    const result = formatRelativeTime('2025-08-01T12:00:00Z', now)

    expect(result).not.toContain('ago')
    expect(result).toContain('2025')
  })

  it('handles future timestamps without crashing', () => {
    expect(formatRelativeTime('2025-10-14T12:05:00Z', now)).toBe('in 5 minutes')
  })

  it('returns an em dash for an unparseable value', () => {
    expect(formatRelativeTime('nope', now)).toBe('—')
  })
})
