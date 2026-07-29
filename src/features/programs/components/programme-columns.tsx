import type { ProgrammeRecord } from '@/api/schemas/programs'
import type { Column } from '@/components/ui/data-table'
import { ValidationBadge } from '@/components/ui/validation-badge'
import { formatDate } from '@/lib/format'
import { PILLAR_LABELS } from '@/types/domain'
import { ExecutionStatusBadge } from './execution-status-badge'
import { PriorityBadge } from './priority-badge'

/**
 * Column definitions for the Programmes table. `onOpenProgramme` is threaded
 * in because the programme-name cell is the way into that programme's
 * projects.
 */
export function buildProgrammeColumns(
  onOpenProgramme: (row: ProgrammeRecord) => void,
): readonly Column<ProgrammeRecord>[] {
  return [
  {
    id: 'id',
    header: 'ID',
    className: 'min-w-28',
    sortValue: (row) => row.id,
    cell: (row) => <span className="font-mono text-xs text-text-muted">{row.id}</span>,
  },
  {
    id: 'name',
    header: 'Programme',
    className: 'min-w-56',
    sortValue: (row) => row.name,
    cell: (row) => (
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => onOpenProgramme(row)}
          className="text-left font-medium text-text-default hover:text-brand-700 hover:underline"
        >
          {row.name}
        </button>
        <p className="truncate text-xs text-text-muted">{row.objectives}</p>
      </div>
    ),
  },
  {
    id: 'institutions',
    header: 'Lead / supporting',
    className: 'min-w-48',
    sortValue: (row) => row.leadInstitution,
    cell: (row) => (
      <div className="min-w-0">
        <p>{row.leadInstitution}</p>
        {row.supportingInstitutions.length > 0 && (
          <p className="truncate text-xs text-text-muted">
            {row.supportingInstitutions.join(', ')}
          </p>
        )}
      </div>
    ),
  },
  {
    id: 'pillar',
    header: 'Pillar',
    className: 'min-w-40',
    sortValue: (row) => PILLAR_LABELS[row.pillar],
    cell: (row) => <span className="whitespace-nowrap">{PILLAR_LABELS[row.pillar]}</span>,
  },
  {
    id: 'financing',
    header: 'Financing',
    className: 'min-w-44',
    cell: (row) => row.financing ?? '—',
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
  {
    id: 'lastUpdate',
    header: 'Last update',
    className: 'min-w-28',
    sortValue: (row) => row.lastUpdate,
    cell: (row) => (
      <span className="whitespace-nowrap text-text-muted">{formatDate(row.lastUpdate)}</span>
    ),
  },
  ]
}
