import { ClipboardList, Database } from 'lucide-react'
import type {
  CustodianAssignment,
  Institution,
} from '@/api/schemas/stakeholders'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { formatDate } from '@/lib/format'

const institutionColumns: readonly Column<Institution>[] = [
  { id: 'name', header: 'Institution', sortValue: (item) => item.name, cell: (item) => <div><p className="font-medium">{item.name}</p><p className="text-xs text-text-muted">{item.shortName} � {item.id}</p></div> },
  { id: 'type', header: 'Type', sortValue: (item) => item.type, cell: (item) => <span className="capitalize">{item.type.replace('-', ' ')}</span> },
  { id: 'roles', header: 'Mission 300 role', cell: (item) => <span>{item.roles.join(', ') || 'Not assigned'}</span> },
  { id: 'coverage', header: 'Coverage', sortValue: (item) => item.coverage, cell: (item) => item.coverage },
  { id: 'status', header: 'Status', sortValue: (item) => item.status, cell: (item) => <span className={item.status === 'active' ? 'text-status-on-track' : 'text-status-lagging'}>{item.status === 'active' ? 'Active' : 'Pending onboarding'}</span> },
  { id: 'updated', header: 'Updated', sortValue: (item) => item.lastUpdated, cell: (item) => <span className="whitespace-nowrap text-text-muted">{formatDate(item.lastUpdated)}</span> },
]

const custodianColumns: readonly Column<CustodianAssignment>[] = [
  { id: 'dataset', header: 'Dataset', sortValue: (item) => item.dataset, cell: (item) => <span className="font-medium">{item.dataset}</span> },
  { id: 'custodian', header: 'Custodian', sortValue: (item) => item.custodian, cell: (item) => item.custodian },
  { id: 'focal', header: 'Focal person', cell: (item) => item.focalPerson },
  { id: 'frequency', header: 'Frequency', cell: (item) => item.frequency },
  { id: 'workflow', header: 'Review and validation', cell: (item) => <div><p>{item.reviewer}</p><p className="text-xs text-text-muted">{item.validator}</p></div> },
  { id: 'status', header: 'Status', cell: (item) => <span className={item.status === 'active' ? 'text-status-on-track' : 'text-status-lagging'}>{item.status === 'active' ? 'Active' : 'Pending'}</span> },
]

function TableShell({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return <Card variant="well" className="min-w-0 p-2 sm:p-4"><h2 className="mb-3 text-lg font-semibold">{title}</h2><Card className="p-0 sm:p-1">{children}</Card></Card>
}

export function InstitutionsTable({ items, onViewAssignments }: { readonly items: readonly Institution[]; readonly onViewAssignments: (item: Institution) => void }) {
  return <TableShell title="Institutions"><DataTable caption="Official Mission 300 institution registry" columns={institutionColumns} rows={items} getRowId={(item) => item.id} emptyMessage="No institutions match the current filters." rowActions={(item) => <RowActionMenu label={`Actions for ${item.shortName}`} actions={[{ label: 'View data assignments', icon: Database, onSelect: () => onViewAssignments(item) }, { label: 'Copy institution ID', copyText: item.id }]} />} /></TableShell>
}

export function CustodiansTable({ items }: { readonly items: readonly CustodianAssignment[] }) {
  return <TableShell title="Data custodians"><DataTable caption="Dataset and institutional reporting assignments" columns={custodianColumns} rows={items} getRowId={(item) => item.id} emptyMessage="No custodian assignments match the current filters." rowActions={(item) => <RowActionMenu label={`Actions for ${item.dataset}`} actions={[{ label: 'Copy dataset name', icon: ClipboardList, copyText: item.dataset }, { label: 'Copy template ID', copyText: item.template }]} />} /></TableShell>
}
