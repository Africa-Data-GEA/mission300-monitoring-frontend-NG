import type { ProgrammeRecord } from '@/api/schemas/implementation-register'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { PROGRAMME_COLUMNS } from './programme-columns'

/** Section B — the searchable programme table. */
export function ProgrammesTable({
  records,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  records: readonly ProgrammeRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Programmes</h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Approved programmes in the Implementation Register"
          columns={PROGRAMME_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1400px]"
          emptyMessage="No programmes match the current filters."
        />
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
