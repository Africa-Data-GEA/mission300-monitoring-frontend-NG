import { Download, Trash2 } from 'lucide-react'
import type { SavedReport } from '@/api/schemas/reports'
import { REPORT_TYPE_LABELS } from '@/api/schemas/reports'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Column } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { formatDateTime } from '@/lib/format'

/** Section C — Saved Reports: reusable configurations and generated-report
 * history. */
export function SavedReportsTable({
  reports,
  page,
  pageSize,
  total,
  onPageChange,
  onRedownload,
  onDelete,
  redownloadingId,
  deletingId,
}: {
  reports: readonly SavedReport[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onRedownload: (report: SavedReport) => void
  onDelete: (report: SavedReport) => void
  redownloadingId: string | null
  deletingId: string | null
}) {
  const columns: Column<SavedReport>[] = [
    {
      id: 'title',
      header: 'Report',
      cell: (row) => (
        <div>
          <p className="font-medium text-text-default">{row.title}</p>
          <p className="text-xs text-text-muted">{REPORT_TYPE_LABELS[row.reportType]}</p>
        </div>
      ),
      sortValue: (row) => row.title,
    },
    { id: 'owner', header: 'Owner', cell: (row) => row.owner, sortValue: (row) => row.owner },
    {
      id: 'filters',
      header: 'Filters',
      cell: (row) => <span className="text-text-muted">{row.filtersSummary}</span>,
    },
    {
      // Its own column, not folded into `filtersSummary` — stakeholder
      // feedback said knowing whether a report includes non-validated data
      // is essential, not something worth having to parse out of a joined
      // filter string.
      id: 'validation',
      header: 'Validation status',
      cell: (row) => <span className="text-text-muted">{row.validationStatusLabel}</span>,
    },
    {
      id: 'format',
      header: 'Format',
      cell: (row) => <span className="uppercase">{row.format}</span>,
      sortValue: (row) => row.format,
    },
    {
      // Stakeholder feedback: no versioning was visible when the same report
      // is regenerated with updated data, risking confusion between copies.
      id: 'version',
      header: 'Version',
      cell: (row) => <span className="text-text-muted">v{row.version}</span>,
      sortValue: (row) => row.version,
    },
    {
      id: 'lastGeneratedAt',
      header: 'Last generated',
      cell: (row) => formatDateTime(row.lastGeneratedAt),
      sortValue: (row) => row.lastGeneratedAt,
    },
  ]

  return (
    <Card variant="well" className="p-2 sm:p-4">
      <Card className="min-w-0 overflow-hidden p-0 sm:p-1">
        <DataTable
          caption="Saved report configurations and generated-report history"
          columns={columns}
          rows={reports}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[900px]"
          emptyMessage="No saved reports yet — generate one from the catalogue above."
          rowActions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={redownloadingId === row.id}
                onClick={() => onRedownload(row)}
              >
                <Download aria-hidden="true" />
                <span className="sr-only">Re-download {row.title}</span>
                {redownloadingId === row.id ? 'Downloading…' : 'Download'}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={deletingId === row.id}
                onClick={() => onDelete(row)}
              >
                <Trash2 aria-hidden="true" />
                <span className="sr-only">Delete {row.title}</span>
              </Button>
            </div>
          )}
        />
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
