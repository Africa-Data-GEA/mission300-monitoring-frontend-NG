import { UserRoundSearch } from 'lucide-react'
import {
  SCOPE_LEVEL_LABELS,
  type ScopeAssignment,
} from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const COLUMNS: readonly Column<ScopeAssignment>[] = [
  {
    id: 'user',
    header: 'User',
    sortValue: (row) => row.userName,
    cell: (row) => (
      <span className="font-medium text-text-default">{row.userName}</span>
    ),
  },
  {
    id: 'level',
    header: 'Scope level',
    sortValue: (row) => SCOPE_LEVEL_LABELS[row.level],
    cell: (row) => (
      <span className="inline-flex rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium whitespace-nowrap text-text-muted">
        {SCOPE_LEVEL_LABELS[row.level]}
      </span>
    ),
  },
  {
    id: 'scope',
    header: 'Assigned scope',
    sortValue: (row) => row.scope,
    cell: (row) => row.scope,
  },
  {
    id: 'responsibility',
    header: 'Responsibility',
    cell: (row) => (
      <span className="text-text-muted">{row.responsibility}</span>
    ),
  },
  {
    id: 'effective',
    header: 'Effective',
    sortValue: (row) => row.effectiveFrom,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDate(row.effectiveFrom)}
        {/* An open-ended assignment is the norm; say so rather than leaving
            the column half-empty. */}
        {row.effectiveTo ? ` – ${formatDate(row.effectiveTo)}` : ' – ongoing'}
      </span>
    ),
  },
  {
    id: 'active',
    header: 'Status',
    sortValue: (row) => (row.active ? 1 : 0),
    cell: (row) => (
      <span
        className={cn(
          'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium',
          row.active
            ? 'bg-status-on-track-bg text-status-on-track'
            : 'bg-status-no-data-bg text-status-no-data',
        )}
      >
        {row.active ? 'Active' : 'Ended'}
      </span>
    ),
  },
]

/** Section D — user access scope and responsibilities. */
export function ScopeTable({
  assignments,
  page,
  pageSize,
  total,
  onPageChange,
  onViewUser,
}: {
  assignments: readonly ScopeAssignment[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onViewUser: (assignment: ScopeAssignment) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">Access scope</h2>

      <Card className="mt-2 p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="User access scope and responsibilities"
          columns={COLUMNS}
          rows={assignments}
          getRowId={(row) => row.id}
          rowActions={(row) => (
            <RowActionMenu
              label={`Actions for ${row.userName}'s assignment`}
              actions={[
                {
                  label: 'View user',
                  icon: UserRoundSearch,
                  onSelect: () => onViewUser(row),
                },
                { label: 'Copy assigned scope', copyText: row.scope },
                { label: 'Copy assignment ID', copyText: row.id },
              ]}
            />
          )}
          emptyMessage="No scope assignments match the current filters."
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
