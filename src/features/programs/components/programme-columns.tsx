import { Link } from 'react-router'
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
  // No identifier column — the programme name and objectives identify the row.
  // The ID is shown on the programme's own detail header.
  {
    id: 'name',
    header: 'Programme',
    className: 'min-w-56',
    sortValue: (row) => row.name,
    /*
     * The button holding the name had no width cap, so with no `truncate` to
     * bound against, the table's auto layout stretched this column to fit
     * the longest programme name on the page — e.g. "Nigeria–Niger Regional
     * Interconnection Programme" — pushing every other column off-balance.
     * `max-w-xs` gives it an actual ceiling; `title` keeps the full name
     * reachable on hover once it's cut off.
     */
    cell: (row) => (
      <div className="max-w-xs min-w-0">
        <button
          type="button"
          onClick={() => onOpenProgramme(row)}
          title={row.name}
          className="block w-full truncate text-left font-medium text-text-default hover:text-brand-700 hover:underline"
        >
          {row.name}
        </button>
        <p className="truncate text-xs text-text-muted" title={row.objectives}>
          {row.objectives}
        </p>
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
    sortValue: (row) => row.bottlenecks.length,
    /*
     * Each id links into the bottleneck register rather than sitting as flat
     * text — review's one ask for this page was that clicking a bottleneck
     * should take you to the issue register
     * (docs/M300 Monitoring Platform Feedback.pptx, slide 12). `?id=` opens
     * the register focused on that single record.
     *
     * stopPropagation because these rows are themselves clickable (they drill
     * into the programme), and a bottleneck link must win over that.
     */
    cell: (row) =>
      row.bottlenecks.length > 0 ? (
        <span className="flex flex-wrap gap-x-1.5 gap-y-1">
          {row.bottlenecks.map((id, index) => (
            <span key={id}>
              <Link
                to={`/bottlenecks?id=${encodeURIComponent(id)}`}
                onClick={(event) => event.stopPropagation()}
                className="text-link underline underline-offset-2 hover:no-underline"
                title={`Open ${id} in the bottleneck register`}
              >
                {id}
              </Link>
              {index < row.bottlenecks.length - 1 && ','}
            </span>
          ))}
        </span>
      ) : (
        '—'
      ),
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
