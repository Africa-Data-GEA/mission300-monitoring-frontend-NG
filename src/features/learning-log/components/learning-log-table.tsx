import { Pencil, Trash2 } from 'lucide-react'
import {
  LEARNING_LOG_AREA_LABELS,
  LEARNING_LOG_STATUS_LABELS,
  LEARNING_LOG_TYPE_LABELS,
  type LearningLogEntry,
} from '@/api/schemas/learning-log'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Column, DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const STATUS_TONE: Record<LearningLogEntry['status'], string> = {
  proposed: 'bg-amber-50 text-amber-700',
  decided: 'bg-brand-50 text-brand-700',
  superseded: 'bg-surface-sunken text-text-muted',
  captured: 'bg-sky-50 text-sky-700',
  applied: 'bg-emerald-50 text-emerald-700',
}

function buildColumns(
  onEdit: (entry: LearningLogEntry) => void,
  onDelete: (entry: LearningLogEntry) => void,
): readonly Column<LearningLogEntry>[] {
  return [
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
      id: 'type',
      header: 'Type',
      sortValue: (row) => row.entryType ?? 'decision',
      cell: (row) => (
        <span className="inline-flex rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-text-default">
          {LEARNING_LOG_TYPE_LABELS[row.entryType ?? 'decision']}
        </span>
      ),
    },
    {
      id: 'summary',
      header: 'Decision or lesson',
      cell: (row) =>
        row.entryType === 'learning' ? (
          <div className="max-w-md space-y-1">
            <p className="text-text-default">{row.lesson}</p>
            {row.recommendation ? <p className="text-xs text-text-muted">Next time: {row.recommendation}</p> : null}
          </div>
        ) : (
          <p className="max-w-md text-text-muted">{row.decision}</p>
        ),
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
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            aria-label={`Edit ${row.title}`}
            onClick={() => onEdit(row)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
          <Button
            aria-label={`Delete ${row.title}`}
            onClick={() => onDelete(row)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" className="size-4 text-status-at-risk" />
          </Button>
        </div>
      ),
    },
  ]
}

export function LearningLogTable({
  entries,
  page,
  pageSize,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: {
  entries: readonly LearningLogEntry[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onEdit: (entry: LearningLogEntry) => void
  onDelete: (entry: LearningLogEntry) => void
}) {
  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <DataTable
        caption="Learning and decision log"
        columns={buildColumns(onEdit, onDelete)}
        rows={entries}
        getRowId={(row) => row.id}
        emptyMessage="Nothing logged yet."
      />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
