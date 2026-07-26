import type { ActionRecord } from '@/api/schemas/implementation-register'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { ACTION_COLUMNS } from './action-columns'

/** Section D — the implementation action tracker, with owner and due date. */
export function ActionTracker({
  records,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  records: readonly ActionRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Implementation action tracker</h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Responsible institution, due date, priority, dependency and evidence for each action"
          columns={ACTION_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1300px]"
          emptyMessage="No actions match the current filters."
        />
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
