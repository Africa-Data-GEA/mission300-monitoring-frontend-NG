import { Pencil, Trash2 } from 'lucide-react'
import { PILLAR_LABELS } from '@/api/schemas/common'
import { REFORM_STATUS_LABELS, type ReformAction } from '@/api/schemas/reform-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Column, DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { ReformStatusBadge } from './reform-status-badge'

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

function buildColumns(
  canEdit: boolean,
  onEdit: (action: ReformAction) => void,
  onDelete: (action: ReformAction) => void,
): readonly Column<ReformAction>[] {
  const columns: Column<ReformAction>[] = [
    {
      id: 'action',
      header: 'Reform action',
      sortValue: (row) => row.action,
      cell: (row) => (
        <div className="max-w-lg">
          <p className="font-medium text-text-default">{row.action}</p>
          <p className="mt-0.5 text-xs text-text-muted">{row.commitment}</p>
          {row.programme ? <p className="mt-0.5 text-xs text-text-muted">Programme: {row.programme.name}</p> : null}
        </div>
      ),
    },
    {
      id: 'pillar',
      header: 'Pillar',
      sortValue: (row) => PILLAR_LABELS[row.pillar],
      cell: (row) => PILLAR_LABELS[row.pillar],
    },
    {
      id: 'priority',
      header: 'Priority',
      sortValue: (row) => (row.isPriority ? 0 : 1),
      cell: (row) =>
        row.isPriority ? (
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            Priority
          </span>
        ) : (
          <span className="text-text-muted">Other</span>
        ),
    },
    {
      id: 'deadline',
      header: 'Deadline',
      sortValue: (row) => row.dueDate ?? row.referenceDueDate ?? '',
      cell: (row) => formatDate(row.dueDate ?? row.referenceDueDate),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => REFORM_STATUS_LABELS[row.status],
      cell: (row) => <ReformStatusBadge status={row.status} />,
    },
    {
      id: 'previous',
      header: 'Previous',
      sortValue: (row) => (row.previousStatus ? REFORM_STATUS_LABELS[row.previousStatus] : ''),
      cell: (row) => (row.previousStatus ? REFORM_STATUS_LABELS[row.previousStatus] : '—'),
    },
  ]

  if (canEdit) {
    columns.push({
      id: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button aria-label={`Edit ${row.action}`} onClick={() => onEdit(row)} size="icon" type="button" variant="ghost">
            <Pencil aria-hidden="true" className="size-4" />
          </Button>
          <Button aria-label={`Delete ${row.action}`} onClick={() => onDelete(row)} size="icon" type="button" variant="ghost">
            <Trash2 aria-hidden="true" className="size-4 text-status-at-risk" />
          </Button>
        </div>
      ),
    })
  }
  return columns
}

export function ReformActionsTable({
  actions,
  page,
  pageSize,
  total,
  canEdit,
  onPageChange,
  onEdit,
  onDelete,
}: {
  actions: readonly ReformAction[]
  page: number
  pageSize: number
  total: number
  canEdit: boolean
  onPageChange: (page: number) => void
  onEdit: (action: ReformAction) => void
  onDelete: (action: ReformAction) => void
}) {
  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <DataTable
        caption="Reform actions"
        columns={buildColumns(canEdit, onEdit, onDelete)}
        rows={actions}
        getRowId={(row) => row.id}
        emptyMessage="No reform actions match the current filters."
      />
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
