export interface CompactReportParameters {
  readonly period: string
  readonly periodLabel: string
  readonly asOfDate: string
}

const QUARTER_LABEL = /^Q[1-4] \d{4}$/

export function periodChoices(periods: readonly { value: string; label: string }[]) {
  return periods.filter((option) => option.value !== 'all').reverse()
}

export function defaultCompactReportParameters(
  periods: readonly { value: string; label: string }[],
  now = new Date(),
): CompactReportParameters {
  const choices = periodChoices(periods)
  const latest = choices.find((option) => QUARTER_LABEL.test(option.label)) ?? choices[0]
  return {
    period: latest?.value ?? 'all',
    periodLabel: latest?.label ?? 'All periods',
    asOfDate: now.toISOString().slice(0, 10),
  }
}

export function formatReportMonth(asOfDate: string): string {
  const [year, month] = asOfDate.split('-').map(Number)
  if (!year || !month) return asOfDate
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function formatAsOfDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function cycleHeading(periodLabel: string): string {
  return `${periodLabel} reporting cycle`
}
