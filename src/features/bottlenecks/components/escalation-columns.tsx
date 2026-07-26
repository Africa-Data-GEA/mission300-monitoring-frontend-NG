import {
  ESCALATION_LEVEL_LABELS,
  type EscalationRecord,
} from '@/api/schemas/bottlenecks'
import type { Column } from '@/components/ui/data-table'
import { formatDate } from '@/lib/format'
import { EscalationStatusBadge } from './escalation-status-badge'

/** Column definitions for the escalation tracker (Section E). */
export const ESCALATION_COLUMNS: readonly Column<EscalationRecord>[] = [
  {
    id: 'decision',
    header: 'Decision required',
    className: 'min-w-56',
    sortValue: (row) => row.decisionRequired,
    cell: (row) => (
      <div className="min-w-0">
        <p className="font-medium text-text-default">{row.decisionRequired}</p>
        <p className="font-mono text-xs text-text-muted">{row.bottleneckId}</p>
      </div>
    ),
  },
  {
    id: 'level',
    header: 'Escalation level',
    className: 'min-w-44',
    sortValue: (row) => row.level,
    cell: (row) => ESCALATION_LEVEL_LABELS[row.level],
  },
  {
    id: 'owner',
    header: 'Owner',
    className: 'min-w-44',
    sortValue: (row) => row.owner,
    cell: (row) => row.owner,
  },
  {
    id: 'dueDate',
    header: 'Due date',
    className: 'min-w-28',
    sortValue: (row) => row.dueDate,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDate(row.dueDate)}
      </span>
    ),
  },
  {
    id: 'daysOverdue',
    header: 'Days overdue',
    align: 'right',
    sortValue: (row) => row.daysOverdue,
    cell: (row) =>
      row.daysOverdue > 0 ? (
        <span className="font-medium text-status-at-risk">{row.daysOverdue}</span>
      ) : (
        <span className="text-text-subtle">Not yet due</span>
      ),
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <EscalationStatusBadge status={row.status} />,
  },
  {
    id: 'resolution',
    header: 'Resolution',
    className: 'min-w-56',
    cell: (row) => (
      <span className="line-clamp-2 text-text-muted">
        {row.resolution ?? '—'}
      </span>
    ),
  },
  {
    id: 'evidence',
    header: 'Evidence',
    cell: (row) =>
      row.evidenceUrl ? (
        <a
          href={row.evidenceUrl}
          className="text-link underline underline-offset-4"
        >
          View
        </a>
      ) : (
        <span className="text-text-subtle">—</span>
      ),
  },
]
