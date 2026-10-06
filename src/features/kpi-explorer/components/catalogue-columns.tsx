import { type KpiCatalogueRow } from '@/api/schemas/kpi-explorer'
import { PILLAR_LABELS } from '@/types/domain'
import { type Column } from '@/components/ui/data-table'
import { formatDate } from '@/lib/format'

/**
 * Column definitions for the KPI catalogue table.
 *
 * Kept out of the table component so the presentational table stays lean and
 * the columns can be read on their own. `onOpenProfile` is threaded in because
 * the indicator-name cell is the primary way into the profile.
 */
export function buildCatalogueColumns(
  onOpenProfile: (row: KpiCatalogueRow) => void,
): readonly Column<KpiCatalogueRow>[] {
  return [
    // No identifier column. The specification put the KPI code on this
    // catalogue for traceability, but the code is not how anyone finds an
    // indicator here — the name is — and a monospace column of M300-Pn-nnn
    // dominated the first thing the eye landed on. It remains on the
    // indicator's profile, which is where a reader goes to cite it.
    {
      id: 'name',
      header: 'Indicator',
      className: 'min-w-56',
      sortValue: (row) => row.name,
      cell: (row) => (
        <button
          type="button"
          onClick={() => onOpenProfile(row)}
          className="text-left font-medium text-text-default hover:text-brand-700 hover:underline"
        >
          {row.name}
        </button>
      ),
    },
    {
      id: 'pillar',
      header: 'Pillar',
      className: 'min-w-40',
      sortValue: (row) => PILLAR_LABELS[row.pillar],
      cell: (row) => (
        <span className="whitespace-nowrap">{PILLAR_LABELS[row.pillar]}</span>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      sortValue: (row) => row.category,
      cell: (row) => <span className="whitespace-nowrap">{row.category}</span>,
    },
    {
      id: 'unit',
      header: 'Unit',
      cell: (row) => <span className="text-text-muted">{row.unit}</span>,
    },
    {
      id: 'frequency',
      header: 'Frequency',
      cell: (row) => <span className="text-text-muted">{row.frequency}</span>,
    },
    {
      id: 'updated',
      header: 'Last update',
      className: 'min-w-28',
      sortValue: (row) => row.lastUpdated,
      cell: (row) => (
        <span className="whitespace-nowrap text-text-muted">
          {formatDate(row.lastUpdated)}
        </span>
      ),
    },
  ]
}
