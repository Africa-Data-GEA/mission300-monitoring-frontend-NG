import { describe, expect, it } from 'vitest'
import {
  cycleHeading,
  defaultCompactReportParameters,
  formatAsOfDate,
  formatReportMonth,
  periodChoices,
} from '@/features/reports/lib/compact-report-parameters'

const PERIODS = [
  { value: 'all', label: 'All periods' },
  { value: '2020', label: '2020' },
  { value: '2025', label: '2025' },
  { value: 'q4-2025', label: 'Q4 2025' },
  { value: 'q1-2026', label: 'Q1 2026' },
]

describe('compact report parameters', () => {
  it('lists the newest periods first and never offers all periods', () => {
    expect(periodChoices(PERIODS).map((option) => option.value)).toEqual(['q1-2026', 'q4-2025', '2025', '2020'])
  })

  it('defaults to the latest quarter and today', () => {
    const parameters = defaultCompactReportParameters(PERIODS, new Date('2026-04-15T10:00:00Z'))
    expect(parameters).toEqual({ period: 'q1-2026', periodLabel: 'Q1 2026', asOfDate: '2026-04-15' })
  })

  it('falls back to all periods when none are listed', () => {
    expect(defaultCompactReportParameters([]).period).toBe('all')
  })

  it('words the cover heading from the period', () => {
    expect(cycleHeading('Q1 2026')).toBe('Q1 2026 reporting cycle')
  })

  it('formats the report month and the data date', () => {
    expect(formatReportMonth('2026-04-15')).toBe('April 2026')
    expect(formatAsOfDate('2026-05-05')).toBe('05 May 2026')
  })
})
