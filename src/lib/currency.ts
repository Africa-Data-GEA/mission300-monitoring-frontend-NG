/**
 * The active display currency.
 *
 * Deliberately mutable (not `as const`/frozen), following the same pattern as
 * CHART_BLUE in src/config/chart-colors.ts: `BrandProvider` writes the
 * admin-configured currency here at runtime, so every formatter picks up the
 * new value on its next call with no change to the call site. Read it through
 * the functions below inside a render body or a per-request builder — never
 * copy it into a module-level constant computed once at import time.
 *
 * Currency must never be hardcoded at a call site: review feedback was that
 * extending this platform to another Compact country has to be a
 * configuration change, not a code change (docs/M300 Monitoring Platform
 * Feedback.pptx, slide 3).
 */
import { useSyncExternalStore } from 'react'

export interface CurrencyConfig {
  /** ISO 4217 code, e.g. "NGN". Used where a symbol will not render. */
  code: string
  /** Display symbol, e.g. "₦". */
  symbol: string
  /** BCP 47 locale for digit grouping, e.g. "en-NG". */
  locale: string
}

let activeCurrency: CurrencyConfig = {
  code: 'NGN',
  symbol: '₦',
  locale: 'en-NG',
}

const currencyListeners = new Set<() => void>()
const subscribeCurrency = (listener: () => void) => {
  currencyListeners.add(listener)
  return () => { currencyListeners.delete(listener) }
}
const getCurrencySnapshot = () => activeCurrency

/** Re-render currency displays when the branding configuration changes. */
export function useCurrency(): Readonly<CurrencyConfig> {
  return useSyncExternalStore(subscribeCurrency, getCurrencySnapshot, getCurrencySnapshot)
}

/** Set by BrandProvider when the admin-configured currency changes. */
export function setActiveCurrency(next: Partial<CurrencyConfig>): void {
  const updated = { ...activeCurrency, ...next }
  if (updated.code === activeCurrency.code && updated.symbol === activeCurrency.symbol && updated.locale === activeCurrency.locale) return
  activeCurrency = updated
  currencyListeners.forEach(listener => listener())
}

export function getCurrency(): Readonly<CurrencyConfig> {
  return activeCurrency
}

/** The locale to group digits by. Use instead of a literal 'en-NG'. */
export function getLocale(): string {
  return activeCurrency.locale
}

/**
 * Formats an amount in the active currency.
 *
 * `svgSafe` spells out the ISO code instead of the symbol: several currency
 * glyphs (the naira sign among them) do not render inside ApexCharts' SVG
 * text nodes and fall back to a bare letter, so charts pass `svgSafe: true`.
 *
 * The symbol, code and locale come from the active branding configuration.
 */
export function formatCurrency(
  amount: string,
  { svgSafe = false }: { svgSafe?: boolean } = {},
): string {
  const active = activeCurrency
  return svgSafe ? `${active.code} ${amount}` : `${active.symbol}${amount}`
}
