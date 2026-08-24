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
export interface CurrencyConfig {
  /** ISO 4217 code, e.g. "NGN". Used where a symbol will not render. */
  code: string
  /** Display symbol, e.g. "₦". */
  symbol: string
  /** BCP 47 locale for digit grouping, e.g. "en-NG". */
  locale: string
}

const activeCurrency: CurrencyConfig = {
  code: 'NGN',
  symbol: '₦',
  locale: 'en-NG',
}

/** Set by BrandProvider when the admin-configured currency changes. */
export function setActiveCurrency(next: Partial<CurrencyConfig>): void {
  Object.assign(activeCurrency, next)
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
 * `currency` overrides the active currency for a figure that is genuinely
 * reported in another one — mobilised international private capital, for
 * instance, is quoted in USD regardless of the host country.
 */
export function formatCurrency(
  amount: string,
  { svgSafe = false, currency }: { svgSafe?: boolean; currency?: CurrencyConfig } = {},
): string {
  const active = currency ?? activeCurrency
  return svgSafe ? `${active.code} ${amount}` : `${active.symbol}${amount}`
}

/** The US dollar, for figures reported in USD by convention rather than by locale. */
export const USD: CurrencyConfig = { code: 'USD', symbol: '$', locale: 'en-US' }
