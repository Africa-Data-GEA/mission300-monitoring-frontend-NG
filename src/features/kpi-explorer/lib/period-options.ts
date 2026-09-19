export type PeriodKind = 'quarter' | 'year'

const QUARTER_COUNT = 8
const YEAR_COUNT = 6

/** Descending list of the last N quarters, e.g. ["Q3 2026", "Q2 2026", ...]. */
export function buildQuarterOptions(referenceDate = new Date()): string[] {
  const currentQuarter = Math.floor(referenceDate.getUTCMonth() / 3) + 1
  const currentYear = referenceDate.getUTCFullYear()

  const options: string[] = []
  let quarter = currentQuarter
  let year = currentYear
  for (let i = 0; i < QUARTER_COUNT; i++) {
    options.push(`Q${quarter} ${year}`)
    quarter -= 1
    if (quarter === 0) {
      quarter = 4
      year -= 1
    }
  }
  return options
}

/** Descending list of the last N years as plain strings, e.g. ["2026", "2025", ...]. */
export function buildYearOptions(referenceDate = new Date()): string[] {
  const currentYear = referenceDate.getUTCFullYear()
  return Array.from({ length: YEAR_COUNT }, (_, i) => String(currentYear - i))
}

/** A period already in "Qn YYYY" form is a quarter; a bare year, or anything
 * else, defaults to the year picker rather than leaving free text. */
export function detectPeriodKind(period: string): PeriodKind {
  return /^Q[1-4]\s\d{4}$/.test(period.trim()) ? 'quarter' : 'year'
}
