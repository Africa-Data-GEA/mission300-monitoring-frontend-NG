import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { KpiCatalogueRow } from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { InfoPopover } from '@/components/ui/info-popover'
import { buildCatalogueColumns } from '@/features/kpi-explorer/components/catalogue-columns'
import { IndicatorCategoryChart } from './indicator-category-chart'

/** "2025-10-01T00:00:00Z" → "Q4 2025" — the reporting cycle stakeholder
 * feedback asked to sort/filter by, derived from the same `lastUpdated`
 * date already on every catalogue row rather than a new tracked field. */
function toReportingCycle(iso: string): string {
  const date = new Date(iso)
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1
  return `Q${quarter} ${date.getUTCFullYear()}`
}

const RESULTS_FRAMEWORK_NOTE =
  'Categories (Output, Outcome, System Performance, Financial and similar) follow the Master KPI Registry’s own ' +
  'classification for each indicator. Mission 300 does publish a national-level results framework — its Theory of ' +
  'Change (see the panel above) — and this taxonomy broadly follows that same Activities/Outputs → Outcomes → ' +
  'Impact staging. No indicator-by-indicator crosswalk to a specific ToC stage exists yet; the two are aligned in ' +
  'spirit, not published as a one-to-one mapping.'

/**
 * Every KPI Matrix indicator tagged to this pillar — the same catalogue rows
 * KPI Explorer reads, not a separate list. Opening one navigates to its
 * profile in KPI Explorer via the same `?kpi=` deep link the catalogue table
 * uses.
 */
export function PillarKpiList({ rows }: { rows: readonly KpiCatalogueRow[] }) {
  const navigate = useNavigate()
  const [cycle, setCycle] = useState('all')

  const cycles = useMemo(() => {
    const unique = new Set(rows.map((row) => toReportingCycle(row.lastUpdated)))
    // Newest first — matches how the "Last update" column sorts by default.
    return [...unique].sort((a, b) => b.localeCompare(a))
  }, [rows])

  const filteredRows = useMemo(
    () => (cycle === 'all' ? rows : rows.filter((row) => toReportingCycle(row.lastUpdated) === cycle)),
    [rows, cycle],
  )

  const needsValidation = rows.some(
    (row) => row.validationStatus === 'requires-validation' || row.validationStatus === 'provisional',
  )

  // The identifier column no longer exists on these columns at all — see
  // buildCatalogueColumns. Opening a row deep-links to the profile, which is
  // where the code is shown. A "Reporting cycle" column is appended here
  // (pillar-specific, not added to the shared KPI Explorer columns) so the
  // sortable/filterable cycle stakeholder feedback asked for is visible
  // without leaving this page.
  const columns: readonly Column<KpiCatalogueRow>[] = [
    ...buildCatalogueColumns((row) => navigate(`/kpis?kpi=${row.id}`)),
    {
      id: 'cycle',
      header: 'Reporting cycle',
      className: 'min-w-28',
      sortValue: (row) => toReportingCycle(row.lastUpdated),
      cell: (row) => <span className="whitespace-nowrap text-text-muted">{toReportingCycle(row.lastUpdated)}</span>,
    },
  ]

  return (
    <Card variant="well" className="p-2 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-4 px-2 sm:px-0">
        <div className="flex flex-wrap items-center gap-4">
          <IndicatorCategoryChart rows={rows} />

          <div>
            <h2 className="text-lg font-semibold text-text-default">Indicators</h2>
            <p className="mt-1 flex items-start gap-1 text-xs text-text-muted">
              Categories follow the KPI Matrix&apos;s own classification, aligned with Mission 300&apos;s Theory of Change.
              <InfoPopover
                label="How indicator categories relate to a results framework"
                provenance={{
                  definition: RESULTS_FRAMEWORK_NOTE,
                  methodology: 'Category values are the Master KPI Registry’s "KPI Category" column, transcribed as-is.',
                  source: 'EMRC - M300 KPI Matrix v2-0 2026-06-29.xlsx, Master KPI Registry sheet.',
                  lastUpdated: '2025-10-01T00:00:00Z',
                }}
              />
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {needsValidation && (
            <Link
              to="/data-submissions/validation"
              className="text-xs font-medium text-link underline underline-offset-4"
              title="Jump to the validation queue. Validation is carried out by users with the Validator or Data Reviewer role — see Administration for current assignments."
            >
              Jump to validation queue →
            </Link>
          )}

          {cycles.length > 1 && (
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              Reporting cycle
              <select
                value={cycle}
                onChange={(event) => setCycle(event.target.value)}
                className="h-8 rounded-control border border-border-default bg-surface px-2 text-xs text-text-default"
              >
                <option value="all">All cycles</option>
                {cycles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Indicators tracked for this pillar"
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1200px]"
          emptyMessage={
            cycle === 'all'
              ? 'No indicators are currently tracked for this pillar.'
              : `No indicators were last updated in ${cycle}.`
          }
        />
      </Card>
    </Card>
  )
}
