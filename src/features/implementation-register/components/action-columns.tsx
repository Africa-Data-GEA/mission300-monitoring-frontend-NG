import type { ActionRecord } from '@/api/schemas/implementation-register'
import type { Column } from '@/components/ui/data-table'
import { formatDate } from '@/lib/format'
import { ExecutionStatusBadge } from './execution-status-badge'
import { PriorityBadge } from './priority-badge'

/** Column definitions for the Implementation action tracker (Section D). */
export const ACTION_COLUMNS: readonly Column<ActionRecord>[] = [
  {
    id: 'id',
    header: 'ID',
    className: 'min-w-28',
    sortValue: (row) => row.id,
    cell: (row) => <span className="font-mono text-xs text-text-muted">{row.id}</span>,
  },
  {
    id: 'description',
    header: 'Action',
    className: 'min-w-56',
    sortValue: (row) => row.description,
    cell: (row) => (
      <div className="min-w-0">
        <p className="font-medium text-text-default">{row.description}</p>
        {row.linkedRecord && (
          <p className="truncate text-xs text-text-muted">{row.linkedRecord}</p>
        )}
      </div>
    ),
  },
  {
    id: 'responsibleInstitution',
    header: 'Owner',
    className: 'min-w-44',
    sortValue: (row) => row.responsibleInstitution,
    cell: (row) => row.responsibleInstitution,
  },
  {
    id: 'dueDate',
    header: 'Due date',
    className: 'min-w-28',
    sortValue: (row) => row.dueDate,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">{formatDate(row.dueDate)}</span>
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
    id: 'dependency',
    header: 'Dependency',
    className: 'min-w-48',
    cell: (row) => row.dependency || '—',
  },
  {
    id: 'nextAction',
    header: 'Next action',
    className: 'min-w-56',
    cell: (row) => <span className="line-clamp-2 text-text-muted">{row.nextAction}</span>,
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
]
