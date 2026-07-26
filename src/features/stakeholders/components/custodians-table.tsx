import { ClipboardList } from 'lucide-react'
import type { CustodianAssignment } from '@/api/schemas/stakeholders'
import { DataTable, type Column } from '@/components/ui/data-table'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { TableShell } from './table-shell'

const COLUMNS: readonly Column<CustodianAssignment>[] = [
  {
    id: 'dataset',
    header: 'Dataset',
    sortValue: (item) => item.dataset,
    cell: (item) => <span className="font-medium">{item.dataset}</span>,
  },
  {
    id: 'custodian',
    header: 'Custodian',
    sortValue: (item) => item.custodian,
    cell: (item) => item.custodian,
  },
  {
    id: 'focal',
    header: 'Focal person',
    cell: (item) => item.focalPerson,
  },
  {
    id: 'frequency',
    header: 'Frequency',
    cell: (item) => item.frequency,
  },
  {
    id: 'workflow',
    header: 'Review and validation',
    cell: (item) => (
      <div>
        <p>{item.reviewer}</p>
        <p className="text-xs text-text-muted">{item.validator}</p>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (item) => (
      <span
        className={
          item.status === 'active' ? 'text-status-on-track' : 'text-status-lagging'
        }
      >
        {item.status === 'active' ? 'Active' : 'Pending'}
      </span>
    ),
  },
]

/** Data custodians tab — dataset ownership and review assignments. */
export function CustodiansTable({
  items,
}: {
  items: readonly CustodianAssignment[]
}) {
  return (
    <TableShell title="Data custodians">
      <DataTable
        caption="Dataset and institutional reporting assignments"
        columns={COLUMNS}
        rows={items}
        getRowId={(item) => item.id}
        emptyMessage="No custodian assignments match the current filters."
        rowActions={(item) => (
          <RowActionMenu
            label={`Actions for ${item.dataset}`}
            actions={[
              {
                label: 'Copy dataset name',
                icon: ClipboardList,
                copyText: item.dataset,
              },
              { label: 'Copy template ID', copyText: item.template },
            ]}
          />
        )}
      />
    </TableShell>
  )
}
