import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useGlobalFilters } from '@/app/global-filters'
import { Button } from '@/components/ui/button'
import { DateRangeField } from '@/components/ui/date-range-field'
import { SelectField } from '@/components/ui/select-field'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilterOptions } from '@/features/filters/api'
import { CUSTOM_PERIOD, DEFAULT_FILTER_VALUES } from '@/types/filters'
import type { FilterOption } from '@/types/filters'

/** The backend only understands period cutoffs at year/quarter granularity
 * (see ExecutiveOverviewService's periodSortKey) - a true arbitrary date
 * range isn't backed anywhere, so a picked range resolves to "as of the
 * quarter its end date falls in" rather than promising day-level precision
 * nothing behind it can honour. */
function toQuarterPeriod(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `q${quarter}-${date.getFullYear()}`
}

/** `filters.period` stays a single "q{1-4}-{year}" / bare "{year}" string -
 * every consumer on the backend (ExecutiveOverviewService.periodSortKey,
 * FiltersService.sortPeriodsDescending, etc.) and the other filter bars
 * (state-disco, KPI explorer, report builder) already parse that shape, so
 * the Year/Quarter split below is presentation-only: two controls that
 * read and write the same underlying value.
 */
const QUARTER_TOKENS = ['q1', 'q2', 'q3', 'q4', 'fy'] as const
type QuarterToken = (typeof QUARTER_TOKENS)[number]
const QUARTER_LABELS: Record<QuarterToken, string> = {
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
  fy: 'Full year',
}

function parsePeriod(period: string): { year: string; quarter: QuarterToken } | null {
  const quarterMatch = /^q([1-4])-(\d{4})$/i.exec(period)
  if (quarterMatch) return { year: quarterMatch[2], quarter: `q${quarterMatch[1]}` as QuarterToken }
  const yearMatch = /^(\d{4})$/.exec(period)
  if (yearMatch) return { year: yearMatch[1], quarter: 'fy' }
  return null
}

function buildPeriod(year: string, quarter: QuarterToken): string {
  return quarter === 'fy' ? year : `${quarter}-${year}`
}

/** Groups the flat `reportingPeriods` option list into a year list plus,
 * per year, only the quarters/full-year rows that actually exist for it -
 * so picking a year narrows the quarter dropdown to what's really there
 * instead of offering combinations the backend has no data for. */
function useYearAndQuarterOptions(reportingPeriods: readonly FilterOption[]) {
  return useMemo(() => {
    const quartersByYear = new Map<string, FilterOption[]>()
    for (const option of reportingPeriods) {
      const parsed = parsePeriod(option.value)
      if (!parsed) continue
      const quarters = quartersByYear.get(parsed.year) ?? []
      quarters.push({ value: parsed.quarter, label: QUARTER_LABELS[parsed.quarter] })
      quartersByYear.set(parsed.year, quarters)
    }
    for (const quarters of quartersByYear.values()) {
      quarters.sort((a, b) => QUARTER_TOKENS.indexOf(a.value as QuarterToken) - QUARTER_TOKENS.indexOf(b.value as QuarterToken))
    }
    const yearOptions: FilterOption[] = Array.from(quartersByYear.keys())
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => ({ value: year, label: year }))
    return { yearOptions, quartersByYear }
  }, [reportingPeriods])
}

/**
 * The application-wide filter bar.
 *
 * Lives in the shell rather than on a page, because the specification's
 * filters narrow every module that supports the breakdown — not just the
 * Executive Overview. Selection is held in the URL by GlobalFiltersProvider,
 * so every page's query reads the same values and a filtered view is a
 * shareable link.
 *
 * Six of the seven specified filters are exposed here: `period`, `pillar`,
 * `institution` and `technology` narrow Executive Overview's delivery
 * section directly; `priority` and `distributionCompany` now do too (see
 * ExecutiveOverviewService.buildDeliveryStatus on the backend).
 * `geographicScope` stays out — it's an aggregation-LEVEL toggle
 * (national/state/DisCo), not a narrowing filter, and making it real means
 * reshaping every headline card into a per-state/per-DisCo breakdown, not
 * adding a control here.
 */
export function GlobalFilterBar({ onClose }: { onClose?: () => void }) {
  const { filters, setFilter, reset } = useGlobalFilters()
  const { data: options, isPending } = useFilterOptions()
  const { yearOptions, quartersByYear } = useYearAndQuarterOptions(options?.reportingPeriods ?? [])

  // The picked range itself is held locally (react-day-picker's own shape,
  // not a shareable URL value) - once both ends are picked, its "to" date
  // is converted to the nearest quarter and written into `filters.period`
  // (see toQuarterPeriod below), which IS what every page's query reads.
  // A half-selected range (from with no "to" yet) intentionally does not
  // touch filters.period.
  const [customRange, setCustomRange] = useState<DateRange | undefined>()

  function handleCustomRangeChange(range: DateRange | undefined) {
    setCustomRange(range)
    if (range?.from && range?.to) setFilter('period', toQuarterPeriod(range.to))
  }

  if (isPending || !options) {
    return <Skeleton className="h-16 w-full rounded-card" />
  }

  const isDirty = Object.entries(DEFAULT_FILTER_VALUES).some(
    ([key, value]) => filters[key as keyof typeof filters] !== value,
  )

  const isCustomPeriod = filters.period === CUSTOM_PERIOD
  const parsedPeriod = isCustomPeriod ? null : parsePeriod(filters.period)
  const selectedYear = parsedPeriod?.year ?? yearOptions[0]?.value ?? ''
  const quartersForYear = quartersByYear.get(selectedYear) ?? []
  const quarterOptions: FilterOption[] = [...quartersForYear, { value: CUSTOM_PERIOD, label: 'Custom range…' }]
  const selectedQuarter = isCustomPeriod ? CUSTOM_PERIOD : (parsedPeriod?.quarter ?? quartersForYear[0]?.value ?? '')

  // Year and quarter are tied: changing the year keeps the current quarter
  // only if that year actually has it (see the "only what's there" comment
  // above), otherwise falls back to that year's first available quarter.
  function handleYearChange(year: string) {
    const quarters = quartersByYear.get(year) ?? []
    const nextQuarter = quarters.find((quarter) => quarter.value === selectedQuarter)?.value ?? quarters[0]?.value
    if (nextQuarter) setFilter('period', buildPeriod(year, nextQuarter as QuarterToken))
  }

  function handleQuarterChange(quarter: string) {
    if (quarter === CUSTOM_PERIOD) {
      setFilter('period', CUSTOM_PERIOD)
      return
    }
    setFilter('period', buildPeriod(selectedYear, quarter as QuarterToken))
  }

  return (
    <section
      id="executive-filter-panel"
      aria-label="Dashboard filters"
      className="rounded-card border border-border-default bg-surface px-3 py-3 shadow-lg sm:px-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-border-default pb-3">
        <div>
          <h2 className="text-sm font-semibold text-text-default">Dashboard filters</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Choose a reporting period, then narrow the view. Changes apply automatically across supported dashboards.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isDirty && (
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Reset filters
            </Button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filter panel"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text-muted hover:bg-surface-sunken hover:text-text-default"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-2 xl:grid-cols-4 [&_button[role=combobox]]:h-11 [&_label]:mb-1">
        <SelectField
          label="Year"
          value={selectedYear}
          options={yearOptions}
          onChange={handleYearChange}
          disabled={isCustomPeriod}
          className="w-full"
        />

        <SelectField
          label="Quarter"
          value={selectedQuarter}
          options={quarterOptions}
          onChange={handleQuarterChange}
          className="w-full"
        />

        {/* Only once "Custom range…" is chosen, so the bar stays compact by default. */}
        {filters.period === CUSTOM_PERIOD && (
          <DateRangeField
            label="Custom range"
            value={customRange}
            onChange={handleCustomRangeChange}
            className="w-full sm:w-64"
          />
        )}

        <SelectField
          label="Compact pillar"
          value={filters.pillar}
          options={options.pillars}
          onChange={(pillar) => setFilter('pillar', pillar)}
          className="w-full"
        />

        <SelectField
          label="Institution"
          value={filters.institution}
          options={options.institutions}
          onChange={(institution) => setFilter('institution', institution)}
          className="w-full"
        />

        <SelectField
          label="Technology"
          value={filters.technology}
          options={options.technologies}
          onChange={(technology) => setFilter('technology', technology)}
          className="w-full"
        />

        <SelectField
          label="Priority"
          value={filters.priority}
          options={options.priorities}
          onChange={(priority) => setFilter('priority', priority)}
          className="w-full"
        />

        <SelectField
          label="Distribution Company"
          value={filters.distributionCompany}
          options={options.distributionCompanies}
          onChange={(distributionCompany) => setFilter('distributionCompany', distributionCompany)}
          className="w-full"
        />

        {/*
          NOT YET EXPOSED: geographicScope. It's an aggregation-LEVEL toggle
          (national/state/DisCo), not a narrowing filter - every headline
          card would need reshaping into a per-state/per-DisCo breakdown to
          make it real, not just a control here.
        */}
      </div>
    </section>
  )
}
