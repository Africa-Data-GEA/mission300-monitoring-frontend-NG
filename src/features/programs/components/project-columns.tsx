import { PROGRAM_TYPE_LABELS, type ProjectRecord } from '@/api/schemas/programs'
import type { Column } from '@/components/ui/data-table'
import { ValidationBadge } from '@/components/ui/validation-badge'
import { formatDate } from '@/lib/format'
import { PILLAR_LABELS } from '@/types/domain'
import { ExecutionStatusBadge } from './execution-status-badge'
import { FundingStatusBadge } from './funding-status-badge'

/**
 * Column definitions for the Projects table, aligned to the Programme &
 * Project tracking workbook. Scoped to one programme, so the "Program"
 * column is dropped. `onOpenProject` is threaded in because the project-name
 * cell is the way into that project's bottlenecks and milestones.
 */
export function buildProjectColumns(
  onOpenProject: (row: ProjectRecord) => void,
): readonly Column<ProjectRecord>[] {
  return [
    {
      id: 'name',
      header: 'Project',
      className: 'min-w-56',
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenProject(row)}
            className="text-left font-medium text-text-default hover:text-brand-700 hover:underline"
          >
            {row.name}
          </button>
        </div>
      ),
    },
    {
      id: 'pillar',
      header: 'M300 pillar alignment',
      className: 'min-w-40',
      sortValue: (row) => PILLAR_LABELS[row.pillar],
      cell: (row) => <span className="whitespace-nowrap">{PILLAR_LABELS[row.pillar]}</span>,
    },
    {
      id: 'owner',
      header: 'Owner',
      className: 'min-w-44',
      sortValue: (row) => row.owner,
      cell: (row) => (
        <div className="min-w-0">
          <p>{row.owner}</p>
          <p className="text-xs text-text-muted">
            {row.location} · {row.coverage}
          </p>
        </div>
      ),
    },
    {
      id: 'completion',
      header: 'Projected completion date',
      className: 'min-w-32',
      sortValue: (row) => row.endDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-text-muted">{formatDate(row.endDate)}</span>
      ),
    },
    {
      id: 'projectedStatus',
      header: 'Projected status',
      sortValue: (row) => row.projectedStatus,
      cell: (row) => <ExecutionStatusBadge status={row.projectedStatus} />,
    },
    {
      id: 'currentStatus',
      header: 'Current project status',
      sortValue: (row) => row.currentStatus,
      cell: (row) => <ExecutionStatusBadge status={row.currentStatus} />,
    },
    {
      id: 'comment',
      header: 'Comment – issues/main risk/bottlenecks',
      className: 'min-w-64',
      cell: (row) => <span className="line-clamp-2 text-text-muted">{row.comment || '—'}</span>,
    },
    {
      id: 'suggestion',
      header: 'Suggestion',
      className: 'min-w-56',
      cell: (row) => <span className="line-clamp-2 text-text-muted">{row.suggestion || '—'}</span>,
    },
    {
      id: 'programType',
      header: 'Program type',
      className: 'min-w-40',
      sortValue: (row) => row.programType,
      cell: (row) => PROGRAM_TYPE_LABELS[row.programType],
    },
    {
      id: 'funding',
      header: 'Funding sources / structure',
      className: 'min-w-56',
      cell: (row) => (
        <div className="min-w-0">
          <p>{row.fundingSource ?? 'Not yet secured'}</p>
          <p className="text-xs text-text-muted">{row.fundingStructure}</p>
        </div>
      ),
    },
    {
      id: 'fundingStatus',
      header: 'Funding status',
      sortValue: (row) => row.fundingStatus,
      cell: (row) => <FundingStatusBadge status={row.fundingStatus} />,
    },
    {
      id: 'validation',
      header: 'Validation',
      sortValue: (row) => row.validationStatus,
      cell: (row) => <ValidationBadge status={row.validationStatus} />,
    },
  ]
}
