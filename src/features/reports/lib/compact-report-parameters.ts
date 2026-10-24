export interface CompactReportParameters {
  readonly period: string
  readonly periodLabel: string
  readonly cycle: string
  readonly dataYear: string
  readonly reportMonth: string
  readonly asOfDate: string
}

export const CYCLE_OPTIONS = [
  { value: 'First', label: 'First cycle' },
  { value: 'Second', label: 'Second cycle' },
  { value: 'Third', label: 'Third cycle' },
  { value: 'Fourth', label: 'Fourth cycle' },
]

export function dataYearOptions(now = new Date()) {
  const latest = now.getFullYear()
  return [latest - 2, latest - 1, latest, latest + 1].map((year) => ({ value: String(year), label: String(year) }))
}

export function defaultCompactReportParameters(
  periods: readonly { value: string; label: string }[],
  now = new Date(),
): CompactReportParameters {
  const first = periods.find((option) => option.value !== 'all')
  return {
    period: first?.value ?? 'all',
    periodLabel: first?.label ?? 'All periods',
    cycle: 'Second',
    dataYear: String(now.getFullYear() - 1),
    reportMonth: now.toISOString().slice(0, 7),
    asOfDate: now.toISOString().slice(0, 10),
  }
}

export function formatReportMonth(value: string): string {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return value
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function formatAsOfDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function cycleHeading(parameters: Pick<CompactReportParameters, 'cycle' | 'dataYear'>): string {
  return `${parameters.cycle} cycle of data collection ${parameters.dataYear}`
}
