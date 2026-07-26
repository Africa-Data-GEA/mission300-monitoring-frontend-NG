import type { EscalationRecord } from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { ESCALATION_COLUMNS } from './escalation-columns'

/** Section E — the escalation tracker. */
export function EscalationTracker({
  records,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  records: readonly EscalationRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Escalation tracker
      </h2>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Issues escalated for management or leadership action"
          columns={ESCALATION_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1100px]"
          emptyMessage="No escalations match the current filters."
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
