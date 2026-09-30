import { Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { PillarId } from '@/api/schemas/common'
import type { DiscoComparisonRow } from '@/api/schemas/state-disco'
import type { ExecutionStatus, ProgrammeRecord, ProjectRecord } from '@/api/schemas/programs'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SelectField } from '@/components/ui/select-field'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import { PriorityBadge } from '@/features/programs/components/priority-badge'
import { formatDate } from '@/lib/format'

type DeliveryRecord = {
  id: string
  type: 'programme' | 'project'
  name: string
  supportingText: string
  institution: string
  location: string
  endDate: string | null
  status: ExecutionStatus
  priority: ProgrammeRecord['priority']
  bottlenecks: readonly string[]
  href: string
}

const DELIVERY_COLUMNS: readonly Column<DeliveryRecord>[] = [
  {
    id: 'name',
    header: 'Programme / project',
    className: 'min-w-64',
    sortValue: (row) => row.name,
    cell: (row) => (
      <div className="min-w-0">
        <Link className="font-medium text-link hover:underline" to={row.href}>
          {row.name}
        </Link>
        <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{row.supportingText}</p>
      </div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    sortValue: (row) => row.type,
    cell: (row) => <span className="capitalize text-text-muted">{row.type}</span>,
  },
  {
    id: 'institution',
    header: 'Responsible institution',
    className: 'min-w-48',
    sortValue: (row) => row.institution,
    cell: (row) => row.institution,
  },
  {
    id: 'location',
    header: 'Location',
    className: 'min-w-36',
    sortValue: (row) => row.location,
    cell: (row) => <span className="text-text-muted">{row.location}</span>,
  },
  {
    id: 'endDate',
    header: 'End date',
    className: 'min-w-28',
    sortValue: (row) => row.endDate ?? '',
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">
        {row.endDate ? formatDate(row.endDate) : 'Not set'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <ExecutionStatusBadge status={row.status} />,
  },
  {
    id: 'priority',
    header: 'Priority',
    sortValue: (row) => row.priority,
    cell: (row) => <PriorityBadge priority={row.priority} />,
  },
  {
    id: 'bottlenecks',
    header: 'Bottlenecks',
    sortValue: (row) => row.bottlenecks.length,
    cell: (row) =>
      row.bottlenecks.length > 0 ? (
        <span className="text-status-at-risk">{row.bottlenecks.length} linked</span>
      ) : (
        <span className="text-text-muted">None</span>
      ),
  },
]

const DISCO_COLUMNS: readonly Column<DiscoComparisonRow>[] = [
  {
    id: 'name',
    header: 'Distribution company',
    sortValue: (row) => row.name,
    cell: (row) => (
      <Link className="font-medium text-link hover:underline" to={`/state-disco?distributionCompany=${row.id}`}>
        {row.name}
      </Link>
    ),
  },
  { id: 'rank', header: 'Rank', sortValue: (row) => Number(row.rankLabel.split(' ')[0]), cell: (row) => row.rankLabel },
  { id: 'customers', header: 'Active customers', sortValue: (row) => row.activeCustomers, cell: (row) => row.activeCustomers },
  { id: 'metering', header: 'Metering rate', sortValue: (row) => Number.parseFloat(row.meteringRate), cell: (row) => row.meteringRate },
  { id: 'billing', header: 'Billing efficiency', sortValue: (row) => Number.parseFloat(row.billingEfficiency), cell: (row) => row.billingEfficiency },
  { id: 'collection', header: 'Collection efficiency', sortValue: (row) => Number.parseFloat(row.collectionEfficiency), cell: (row) => row.collectionEfficiency },
  { id: 'remittance', header: 'Remittance performance', sortValue: (row) => Number.parseFloat(row.remittancePerformance), cell: (row) => row.remittancePerformance },
  { id: 'validation', header: 'Validation', sortValue: (row) => row.validationLabel, cell: (row) => row.validationLabel },
]

function toDeliveryRecords(
  programmes: readonly ProgrammeRecord[],
  projects: readonly ProjectRecord[],
): DeliveryRecord[] {
  return [
    ...programmes.map((row): DeliveryRecord => ({
      id: row.id,
      type: 'programme',
      name: row.name,
      supportingText: row.objectives,
      institution: row.leadInstitution,
      location: 'National / programme scope',
      endDate: row.endDate,
      status: row.status,
      priority: row.priority,
      bottlenecks: row.bottlenecks,
      href: `/programs/${row.id}`,
    })),
    ...projects.map((row): DeliveryRecord => ({
      id: row.id,
      type: 'project',
      name: row.name,
      supportingText: row.programmeName,
      institution: row.owner,
      location: row.location,
      endDate: row.endDate,
      status: row.currentStatus,
      priority: 'priority',
      bottlenecks: row.bottlenecks,
      href: `/programs/projects/${row.id}`,
    })),
  ]
}

function DiscoPerformanceSection({ rows }: { rows: readonly DiscoComparisonRow[] }) {
  const [search, setSearch] = useState('')
  const searchId = useId()
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return query ? rows.filter((row) => row.name.toLocaleLowerCase().includes(query)) : rows
  }, [rows, search])

  return (
    <Card variant="well" className="p-2 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-2 sm:px-0">
        <div>
          <h2 className="text-lg font-semibold text-text-default">DisCo performance breakdown</h2>
          <p className="mt-1 text-xs text-text-muted">
            Utility-level results behind the national Financially Viable Utilities headline figures.
          </p>
        </div>
        <label htmlFor={searchId} className="w-full sm:w-64">
          <span className="mb-1 block text-xs font-medium text-text-muted">Search DisCos</span>
          <span className="relative block">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle" />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Distribution company"
              className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm"
            />
          </span>
        </label>
      </div>
      <Card className="mt-3 min-w-0 overflow-hidden p-0 sm:p-1">
        <DataTable
          caption="Distribution company performance by utility"
          columns={DISCO_COLUMNS}
          rows={filtered}
          getRowId={(row) => row.id}
          className="[&_table]:min-w-[1050px]"
          emptyMessage="No distribution companies match the search."
        />
      </Card>
    </Card>
  )
}

export function PillarDeliverySection({
  pillar,
  programmes,
  projects,
  discoPerformance,
}: {
  pillar: PillarId
  programmes: readonly ProgrammeRecord[]
  projects: readonly ProjectRecord[]
  discoPerformance: readonly DiscoComparisonRow[]
}) {
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const records = useMemo(() => toDeliveryRecords(programmes, projects), [programmes, projects])
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return records.filter((row) => {
      if (type !== 'all' && row.type !== type) return false
      if (status !== 'all' && row.status !== status) return false
      return !query || [row.name, row.supportingText, row.institution, row.location].some((value) => value.toLocaleLowerCase().includes(query))
    })
  }, [records, search, type, status])

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All statuses' },
    ...[...new Set(records.map((row) => row.status))].sort().map((value) => ({
      value,
      label: value.replace('-', ' ').replace(/^./, (character) => character.toUpperCase()),
    })),
  ], [records])

  return (
    <div className="flex flex-col gap-4">
      {pillar === 'financially-viable-utilities' && discoPerformance.length > 0 && (
        <DiscoPerformanceSection rows={discoPerformance} />
      )}

      <Card variant="well" className="p-2 sm:p-4">
        <div className="px-2 sm:px-0">
          <h2 className="text-lg font-semibold text-text-default">Programmes and projects</h2>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2.5 rounded-lg bg-surface-sunken p-3">
          <label htmlFor={searchId} className="min-w-0 flex-1 sm:max-w-sm">
            <span className="mb-1.5 block text-xs font-medium text-text-muted">Search delivery records</span>
            <span className="relative block">
              <Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle" />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, institution or location"
                className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm"
              />
            </span>
          </label>
          <SelectField
            label="Record type"
            value={type}
            options={[
              { value: 'all', label: 'All record types' },
              { value: 'programme', label: 'Programmes' },
              { value: 'project', label: 'Projects' },
            ]}
            onChange={setType}
            className="w-full sm:w-44"
          />
          <SelectField label="Status" value={status} options={statusOptions} onChange={setStatus} className="w-full sm:w-40" />
          <p aria-live="polite" className="pb-2 text-xs text-text-muted">{filtered.length} of {records.length} shown</p>
        </div>

        <Card className="mt-3 min-w-0 overflow-hidden p-0 sm:p-1">
          <DataTable
            caption="Programmes and projects contributing to this pillar"
            columns={DELIVERY_COLUMNS}
            rows={filtered}
            getRowId={(row) => `${row.type}-${row.id}`}
            className="[&_table]:min-w-[1200px]"
            emptyMessage={
              records.length === 0
                ? 'No programmes or projects are linked to this pillar yet.'
                : 'No delivery records match the current filters.'
            }
          />
        </Card>
      </Card>
    </div>
  )
}
