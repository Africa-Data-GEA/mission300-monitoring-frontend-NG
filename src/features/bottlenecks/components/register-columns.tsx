import { PILLAR_LABELS } from '@/types/domain'
import type { BottleneckRecord } from '@/api/schemas/bottlenecks'
import type { Column } from '@/components/ui/data-table'
import { formatDate } from '@/lib/format'
import { BottleneckStatusBadge } from './bottleneck-status-badge'
import { EscalationStatusBadge } from './escalation-status-badge'
import { SeverityBadge } from './severity-badge'

/** Column definitions for the bottleneck register (Section B). */
export const REGISTER_COLUMNS: readonly Column<BottleneckRecord>[] = [
  {
    id: 'id',
    header: 'ID',
    className: 'min-w-28',
    sortValue: (row) => row.id,
    cell: (row) => <span className="font-mono text-xs text-text-muted">{row.id}</span>,
  },
  {
    id: 'issue',
    header: 'Issue',
    className: 'min-w-56',
    sortValue: (row) => row.issue,
    cell: (row) => (
      <div className="min-w-0">
        <p className="font-medium text-text-default">{row.issue}</p>
        {row.linkedRecord && (
          <p className="truncate text-xs text-text-muted">{row.linkedRecord}</p>
        )}
      </div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    sortValue: (row) => row.category,
    cell: (row) => row.category.replace(/-/g, ' '),
  },
  {
    id: 'severity',
    header: 'Severity',
    sortValue: (row) => row.severity,
    cell: (row) => <SeverityBadge severity={row.severity} />,
  },
  {
    id: 'pillar',
    header: 'Pillar',
    className: 'min-w-40',
    sortValue: (row) => PILLAR_LABELS[row.pillar],
    cell: (row) => (
      <span className="whitespace-nowrap">{PILLAR_LABELS[row.pillar]}</span>
    ),
  },
  {
    id: 'institution',
    header: 'Institution',
    className: 'min-w-44',
    sortValue: (row) => row.institution,
    cell: (row) => row.institution,
  },
  {
    id: 'dateRaised',
    header: 'Raised',
    className: 'min-w-28',
    sortValue: (row) => row.dateRaised,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDate(row.dateRaised)}
      </span>
    ),
  },
  {
    id: 'age',
    header: 'Age',
    align: 'right',
    sortValue: (row) => row.ageDays,
    cell: (row) => (
      <span className="whitespace-nowrap">{row.ageDays}d</span>
    ),
  },
  {
    id: 'followUp',
    header: 'Follow-up',
    className: 'min-w-56',
    cell: (row) => (
      <span className="line-clamp-2 text-text-muted">
        {row.followUp || '—'}
      </span>
    ),
  },
  {
    id: 'escalation',
    header: 'Escalation',
    sortValue: (row) => row.escalationStatus,
    cell: (row) => <EscalationStatusBadge status={row.escalationStatus} />,
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <BottleneckStatusBadge status={row.status} />,
  },
]
