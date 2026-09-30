import { useMemo } from 'react'
import type { FilterOption } from '@/types/filters'

/**
 * Splits a single "reporting period" dropdown into Year + Quarter, matching
 * the Executive Overview's global filter bar
 * (src/components/layout/global-filter-bar.tsx) — a flat list mixing
 * "Q4 2023" and "2023" in one dropdown reads as two different kinds of
 * value in the same list. Kept as its own copy here rather than imported
 * from that file: state-disco's period model additionally needs an
 * "All periods" value (its own real default - see
 * DEFAULT_STATE_DISCO_QUERY), which the global bar's Year/Quarter pair
 * doesn't have a slot for.
 */

export const ALL_PERIODS = 'all'

const QUARTER_TOKENS = ['q1', 'q2', 'q3', 'q4', 'fy'] as const
type QuarterToken = (typeof QUARTER_TOKENS)[number]
const QUARTER_LABELS: Record<QuarterToken, string> = {
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
  fy: 'Full year',
}

export function parsePeriod(period: string): { year: string; quarter: QuarterToken } | null {
  const quarterMatch = /^q([1-4])-(\d{4})$/i.exec(period)
  if (quarterMatch?.[1] && quarterMatch[2]) {
    return { year: quarterMatch[2], quarter: `q${quarterMatch[1]}` as QuarterToken }
  }
  const yearMatch = /^(\d{4})$/.exec(period)
  if (yearMatch?.[1]) return { year: yearMatch[1], quarter: 'fy' }
  return null
}

export function buildPeriod(year: string, quarter: QuarterToken): string {
  return quarter === 'fy' ? year : `${quarter}-${year}`
}

/** Groups the flat `reportingPeriods` option list into a year list (plus
 * "All periods") and, per year, only the quarters that actually exist for
 * it. */
export function useYearAndQuarterOptions(reportingPeriods: readonly FilterOption[]) {
  return useMemo(() => {
    const quartersByYear = new Map<string, FilterOption[]>()
    for (const option of reportingPeriods) {
      const parsed = parsePeriod(option.value)
      if (!parsed) continue
      const quarters = quartersByYear.get(parsed.year) ?? []
      quarters.push({ value: parsed.quarter, label: QUARTER_LABELS[parsed.quarter] })
      quartersByYear.set(parsed.year, quarters)
    }
    for (const quarters of quartersByYear.values()) {
      quarters.sort(
        (a, b) => QUARTER_TOKENS.indexOf(a.value as QuarterToken) - QUARTER_TOKENS.indexOf(b.value as QuarterToken),
      )
    }
    const yearOptions: FilterOption[] = [
      { value: ALL_PERIODS, label: 'All periods' },
      ...Array.from(quartersByYear.keys())
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => ({ value: year, label: year })),
    ]
    return { yearOptions, quartersByYear }
  }, [reportingPeriods])
}
