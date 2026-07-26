import { ExternalLink } from 'lucide-react'
import { type KpiCatalogueRow } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { buildCatalogueColumns } from './catalogue-columns'

/** Section B — the searchable KPI catalogue. */
export function CatalogueTable({
  rows,
  page,
  pageSize,
  total,
  onPageChange,
  onOpenProfile,
}: {
  rows: readonly KpiCatalogueRow[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onOpenProfile: (row: KpiCatalogueRow) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">KPI catalogue</h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Authoritative catalogue of dashboard indicators"
          columns={buildCatalogueColumns(onOpenProfile)}
          rows={rows}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1100px]"
          rowActions={(row) => (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onOpenProfile(row)}
            >
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">Open profile for {row.name}</span>
              Profile
            </Button>
          )}
          emptyMessage="No indicators match the current filters."
        />
      </Card>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </Card>
  )
}
