import type { MilestoneRecord } from '@/api/schemas/programs'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { MILESTONE_COLUMNS } from './milestone-columns'

/** This project's milestones. */
export function MilestoneSection({
  records,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  records: readonly MilestoneRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <h3 className="text-sm font-semibold text-text-default">Milestones</h3>

      <Card className="mt-3 min-w-0 overflow-hidden p-0 sm:p-1">
        <DataTable
          caption="Milestones for this project"
          columns={MILESTONE_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1200px]"
          emptyMessage="No milestones recorded for this project."
        />
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </section>
  )
}
