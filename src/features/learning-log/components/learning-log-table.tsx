import {
  LEARNING_LOG_AREA_LABELS,
  LEARNING_LOG_STATUS_LABELS,
  type LearningLogEntry,
} from '@/api/schemas/learning-log'
import { type Column, DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const STATUS_TONE: Record<LearningLogEntry['status'], string> = {
  proposed: 'bg-amber-50 text-amber-700',
  decided: 'bg-brand-50 text-brand-700',
  superseded: 'bg-surface-sunken text-text-muted',
}

const COLUMNS: readonly Column<LearningLogEntry>[] = [
  {
    id: 'title',
    header: 'Entry',
    sortValue: (row) => row.title,
    cell: (row) => (
      <div>
        <p className="font-medium text-text-default">{row.title}</p>
        <p className="mt-0.5 text-xs text-text-muted">{row.id}</p>
      </div>
    ),
  },
  {
    id: 'area',
    header: 'Area',
    sortValue: (row) => LEARNING_LOG_AREA_LABELS[row.area],
    cell: (row) => LEARNING_LOG_AREA_LABELS[row.area],
  },
  {
    id: 'decision',
    header: 'Decision',
    cell: (row) => <p className="max-w-md text-text-muted">{row.decision}</p>,
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => LEARNING_LOG_STATUS_LABELS[row.status],
    cell: (row) => (
      <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', STATUS_TONE[row.status])}>
        {LEARNING_LOG_STATUS_LABELS[row.status]}
      </span>
    ),
  },
  {
    id: 'reviewCycle',
    header: 'Review cycle',
    sortValue: (row) => row.reviewCycle,
    cell: (row) => row.reviewCycle,
  },
  {
    id: 'decidedAt',
    header: 'Date',
    sortValue: (row) => row.decidedAt,
    cell: (row) => new Date(row.decidedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  },
]

export function LearningLogTable({
  entries,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  entries: readonly LearningLogEntry[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        caption="Learning and decision log"
        columns={COLUMNS}
        rows={entries}
        getRowId={(row) => row.id}
        emptyMessage="No decisions logged yet."
      />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  )
}
