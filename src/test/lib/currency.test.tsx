import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { formatCurrency, getCurrency, setActiveCurrency, useCurrency } from '@/lib/currency'

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
