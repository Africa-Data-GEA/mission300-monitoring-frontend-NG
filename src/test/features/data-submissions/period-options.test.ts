import { describe, expect, it } from 'vitest'
import { periodChoices } from '@/features/data-submissions/lib/period-options'

describe('periodChoices', () => {
  it('lists the current quarter and the seven before it, across a year boundary', () => {
    const quarters = periodChoices('Quarterly', 'Q2 2026')
    expect(quarters).toHaveLength(8)
    expect(quarters.slice(0, 4)).toEqual(['Q2 2026', 'Q1 2026', 'Q4 2025', 'Q3 2025'])
  })

  it('lists twelve months back from the current month', () => {
    const months = periodChoices('Monthly', 'February 2026')
    expect(months.slice(0, 3)).toEqual(['February 2026', 'January 2026', 'December 2025'])
    expect(months).toHaveLength(12)
  })

  it('lists five years for an annual dataset', () => {
    expect(periodChoices('Annual', '2025')).toEqual(['2025', '2024', '2023', '2022', '2021'])
  })

  it('falls back to the current period when the shape is unfamiliar', () => {
    expect(periodChoices('Quarterly', 'H1 2026')).toEqual(['H1 2026'])
  })
})
