import { describe, expect, it } from 'vitest'
import {
  cycleHeading,
  defaultCompactReportParameters,
  formatAsOfDate,
  formatReportMonth,
} from '@/features/reports/lib/compact-report-parameters'

const PERIODS = [
  { value: 'all', label: 'All periods' },
  { value: 'q1-2026', label: 'Q1 2026' },
  { value: 'q4-2025', label: 'Q4 2025' },
]

describe('compact report parameters', () => {
  it('defaults to the first real period, the second cycle and last year', () => {
    const parameters = defaultCompactReportParameters(PERIODS, new Date('2026-04-15T10:00:00Z'))
    expect(parameters).toMatchObject({
      period: 'q1-2026',
      periodLabel: 'Q1 2026',
      cycle: 'Second',
      dataYear: '2025',
      reportMonth: '2026-04',
      asOfDate: '2026-04-15',
    })
  })

  it('falls back to all periods when none are listed', () => {
    expect(defaultCompactReportParameters([]).period).toBe('all')
  })

  it('words the cycle like the SE4ALL cover', () => {
    expect(cycleHeading({ cycle: 'Second', dataYear: '2025' })).toBe('Second cycle of data collection 2025')
  })

  it('formats the report month and the data date', () => {
    expect(formatReportMonth('2026-04')).toBe('April 2026')
    expect(formatAsOfDate('2026-05-05')).toBe('05 May 2026')
  })
})
