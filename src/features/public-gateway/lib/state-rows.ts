import type { StateCoverageRow } from '@/api/schemas/state-disco'

export type StateSortKey =
  | 'state'
  | 'coverageBarPercent'
  | 'miniGridConnections'
  | 'solarHomeSystems'
  | 'activeProjects'

/**
 * The connection counts arrive pre-formatted as display strings ("1,240",
 * "12.4k") because the same payload feeds a table in the authenticated app that
 * must not re-format them. Sorting needs the magnitude back, so this recovers it
 * rather than asking the backend to send both — and it is a lossy recovery on
 * purpose: a value that cannot be parsed sorts last instead of sorting as zero,
 * which would silently promote it above real zeroes.
 */
export function numericValue(display: string): number {
  const cleaned = display.replace(/,/g, '').trim()
  const match = /^(-?[\d.]+)\s*([km])?/i.exec(cleaned)
  if (!match) return Number.NEGATIVE_INFINITY

  const magnitude = Number(match[1])
  if (Number.isNaN(magnitude)) return Number.NEGATIVE_INFINITY

  const suffix = match[2]?.toLowerCase()
  if (suffix === 'k') return magnitude * 1_000
  if (suffix === 'm') return magnitude * 1_000_000
  return magnitude
}

/** Descending on every column except the state name, which reads naturally
 * A–Z. A table that opens alphabetically on a ranking question buries the
 * answer; a name column that opens on Z–A is just annoying. */
export function sortStateRows(
  rows: readonly StateCoverageRow[],
  key: StateSortKey,
  descending: boolean,
): StateCoverageRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (key === 'state') return a.state.localeCompare(b.state)
    if (key === 'coverageBarPercent') return b.coverageBarPercent - a.coverageBarPercent
    return numericValue(b[key]) - numericValue(a[key])
  })
  return descending ? sorted : sorted.reverse()
}
