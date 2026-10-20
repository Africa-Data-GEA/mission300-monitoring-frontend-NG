import { Pencil, Trash2 } from 'lucide-react'
import type { Institution } from '@/api/schemas/stakeholders'
import { DataTable, type Column } from '@/components/ui/data-table'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { formatDate } from '@/lib/format'
import { TableShell } from './table-shell'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  'onboarding-in-progress': 'Onboarding in progress',
  'pending-onboarding': 'Pending onboarding',
  inactive: 'Inactive',
}

const COLUMNS: readonly Column<Institution>[] = [
  {
    id: 'name',
    header: 'Institution',
    sortValue: (item) => item.name,
    cell: (item) => (
      <div>
        <p className="font-medium text-text-default">{item.name}</p>
        <p className="text-xs text-text-muted">{item.shortName}</p>
      </div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    sortValue: (item) => item.type,
    cell: (item) => <span className="capitalize">{item.type.replace('-', ' ')}</span>,
  },
  {
    id: 'roles',
    header: 'Mission 300 role',
    cell: (item) => <span>{item.roles.join(', ') || 'Not assigned'}</span>,
  },
  {
    id: 'coverage',
    header: 'Coverage',
    sortValue: (item) => item.coverage,
    cell: (item) => item.coverage,
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (item) => item.status,
    cell: (item) => (
      <span
        className={
          item.status === 'active' ? 'text-status-on-track' : 'text-status-lagging'
        }
      >
        {STATUS_LABELS[item.status] ?? item.status}
      </span>
    ),
  },
  {
    id: 'updated',
    header: 'Updated',
    sortValue: (item) => item.lastUpdated,
    cell: (item) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDate(item.lastUpdated)}
      </span>
    ),
  },
]

/** Section B — the institution registry table. */
export function InstitutionsTable({
  items,
  onEdit,
  onDelete,
}: {
  items: readonly Institution[]
  onEdit?: (item: Institution) => void
  onDelete?: (item: Institution) => void
}) {
  return (
    <TableShell title="Institutions">
      <DataTable
        caption="Official Mission 300 institution registry"
        columns={COLUMNS}
        rows={items}
        getRowId={(item) => item.id}
        emptyMessage="No institutions match the current filters."
        rowActions={(item) => (
          <RowActionMenu
            label={`Actions for ${item.shortName}`}
            actions={[
              ...(onEdit ? [{ label: 'Edit institution', icon: Pencil, onSelect: () => onEdit(item) }] : []),
              ...(onDelete ? [{ label: 'Remove institution', icon: Trash2, onSelect: () => onDelete(item), tone: 'danger' as const }] : []),
              { label: 'Copy institution ID', copyText: item.id },
            ]}
          />
        )}
      />
    </TableShell>
  )
}
