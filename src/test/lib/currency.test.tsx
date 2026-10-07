import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { formatCurrency, formatUsd, getCurrency, setActiveCurrency, useCurrency } from '@/lib/currency'

const originalCurrency = { ...getCurrency() }
afterEach(() => { setActiveCurrency(originalCurrency) })

describe('Configured currency', () => {
  it('uses the configured symbol and chart code instead of a fixed dollar', () => {
    setActiveCurrency({ code: 'EUR', symbol: '€', locale: 'de-DE' })
    expect(formatCurrency('750M')).toBe('€750M')
    expect(formatCurrency('750M', { svgSafe: true })).toBe('EUR 750M')
  })

  it('updates rendered currency when branding changes', () => {
    const { result } = renderHook(() => {
      useCurrency()
      return formatCurrency('27.7M')
    })
    act(() => { setActiveCurrency({ code: 'GBP', symbol: '£', locale: 'en-GB' }) })
    expect(result.current).toBe('£27.7M')
  })
})

describe('US dollar amounts', () => {
  it('are printed as dollars when the configured currency is the naira', () => {
    setActiveCurrency({ code: 'NGN', symbol: '₦', locale: 'en-NG' })
    expect(formatUsd('750,000,000')).toBe('US$750,000,000')
    expect(formatCurrency('750,000,000')).toBe('₦750,000,000')
  })

  it('do not change when the configured currency changes', () => {
    setActiveCurrency({ code: 'GHS', symbol: '₵', locale: 'en-GH' })
    expect(formatUsd('27.7M')).toBe('US$27.7M')
  })
})
