import { Plus } from 'lucide-react'
import type { BottleneckRecord } from '@/api/schemas/bottlenecks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { REGISTER_COLUMNS } from './register-columns'

/** Section B — the searchable bottleneck register. */
export function BottleneckRegister({
  records,
  page,
  pageSize,
  total,
  onPageChange,
  onRaiseBottleneck,
}: {
  records: readonly BottleneckRecord[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onRaiseBottleneck: () => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-default">
          Bottleneck register
        </h2>
        <Button onClick={onRaiseBottleneck} size="sm" type="button">
          <Plus aria-hidden="true" />
          Raise a bottleneck
        </Button>
      </div>

      <Card className="mt-2 min-w-0 overflow-hidden p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Structured record of delivery constraints and exceptions"
          columns={REGISTER_COLUMNS}
          rows={records}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1400px]"
          emptyMessage="No bottlenecks match the current filters."
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
