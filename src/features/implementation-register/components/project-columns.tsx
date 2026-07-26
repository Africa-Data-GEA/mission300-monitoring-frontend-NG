import type { ProjectRecord } from '@/api/schemas/implementation-register'
import { LIFECYCLE_STAGE_LABELS } from '@/api/schemas/bottlenecks'
import type { Column } from '@/components/ui/data-table'
import { ValidationBadge } from '@/components/ui/validation-badge'
import { formatDate } from '@/lib/format'
import { ExecutionStatusBadge } from './execution-status-badge'

/** Column definitions for the Projects table (Section C). */
export const PROJECT_COLUMNS: readonly Column<ProjectRecord>[] = [
  {
    id: 'id',
    header: 'ID',
    className: 'min-w-28',
    sortValue: (row) => row.id,
    cell: (row) => <span className="font-mono text-xs text-text-muted">{row.id}</span>,
  },
  {
    id: 'programme',
    header: 'Programme',
    className: 'min-w-52',
    sortValue: (row) => row.programmeName,
    cell: (row) => row.programmeName,
  },
  {
    id: 'owner',
    header: 'Owner',
    className: 'min-w-44',
    sortValue: (row) => row.owner,
    cell: (row) => row.owner,
  },
  {
    id: 'location',
    header: 'Location',
    className: 'min-w-36',
    sortValue: (row) => row.location,
    cell: (row) => (
      <div className="min-w-0">
        <p>{row.location}</p>
        <p className="text-xs text-text-muted">{row.coverage}</p>
      </div>
    ),
  },
  {
    id: 'lifecycleStage',
    header: 'Lifecycle stage',
    sortValue: (row) => row.lifecycleStage,
    cell: (row) => LIFECYCLE_STAGE_LABELS[row.lifecycleStage],
  },
  {
    id: 'financing',
    header: 'Financing',
    className: 'min-w-40',
    cell: (row) => row.financing ?? '—',
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    cell: (row) => <ExecutionStatusBadge status={row.status} />,
  },
  {
    id: 'dates',
    header: 'Dates',
    className: 'min-w-40',
    sortValue: (row) => row.startDate,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDate(row.startDate)} – {formatDate(row.endDate)}
      </span>
    ),
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
    id: 'bottlenecks',
    header: 'Bottlenecks',
    cell: (row) => (row.bottlenecks.length > 0 ? row.bottlenecks.join(', ') : '—'),
  },
  {
    id: 'validation',
    header: 'Validation',
    sortValue: (row) => row.validationStatus,
    cell: (row) => <ValidationBadge status={row.validationStatus} />,
  },
]
