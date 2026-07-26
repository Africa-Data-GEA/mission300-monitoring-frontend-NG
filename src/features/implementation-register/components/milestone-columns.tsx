import type { MilestoneRecord } from '@/api/schemas/implementation-register'
import type { Column } from '@/components/ui/data-table'
import { formatDate } from '@/lib/format'
import { ExecutionStatusBadge } from './execution-status-badge'
import { PriorityBadge } from './priority-badge'

/** Column definitions for the Milestone tracker (Section D). */
export const MILESTONE_COLUMNS: readonly Column<MilestoneRecord>[] = [
  {
    id: 'id',
    header: 'ID',
    className: 'min-w-28',
    sortValue: (row) => row.id,
    cell: (row) => <span className="font-mono text-xs text-text-muted">{row.id}</span>,
  },
  {
    id: 'name',
    header: 'Milestone',
    className: 'min-w-56',
    sortValue: (row) => row.name,
    cell: (row) => (
      <div className="min-w-0">
        <p className="font-medium text-text-default">{row.name}</p>
        <p className="truncate text-xs text-text-muted">{row.projectName}</p>
      </div>
    ),
  },
  {
    id: 'priority',
    header: 'Priority',
    sortValue: (row) => row.priority,
    cell: (row) => <PriorityBadge priority={row.priority} />,
  },
  {
    id: 'expected',
    header: 'Expected',
    className: 'min-w-28',
    sortValue: (row) => row.expectedDate,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">{formatDate(row.expectedDate)}</span>
    ),
  },
  {
    id: 'actual',
    header: 'Actual',
    className: 'min-w-28',
    sortValue: (row) => row.actualDate,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">
        {row.actualDate ? formatDate(row.actualDate) : '—'}
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
    id: 'leadInstitution',
    header: 'Lead institution',
    className: 'min-w-44',
    sortValue: (row) => row.leadInstitution,
    cell: (row) => row.leadInstitution,
  },
  {
    id: 'evidence',
    header: 'Evidence',
    cell: (row) =>
      row.evidenceUrl ? (
        <a
          className="text-brand-700 underline underline-offset-2"
          href={row.evidenceUrl}
          rel="noreferrer"
          target="_blank"
        >
          View
        </a>
      ) : (
        '—'
      ),
  },
  {
    id: 'risk',
    header: 'Risk',
    className: 'min-w-56',
    cell: (row) => <span className="line-clamp-2 text-text-muted">{row.risk}</span>,
  },
  {
    id: 'nextAction',
    header: 'Next action',
    className: 'min-w-56',
    cell: (row) => <span className="line-clamp-2 text-text-muted">{row.nextAction}</span>,
  },
]
