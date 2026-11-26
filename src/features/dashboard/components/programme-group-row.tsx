import { ChevronDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { EXECUTION_STATUS_LABELS } from '@/api/schemas/programs'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import type { ProgrammeGroup } from '../lib/group-projects-by-programme'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** The summary row for one programme; opening it reveals its projects. */
export function ProgrammeGroupRow({
  group,
  expanded,
  onToggle,
}: {
  group: ProgrammeGroup
  expanded: boolean
  onToggle: () => void
}) {
  const count = group.projects.length
  const Chevron = expanded ? ChevronDown : ChevronRight

  return (
    <tr className="bg-surface-subtle align-top">
      <td className="px-3 py-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} projects in ${group.programmeName}`}
            className="mt-0.5 rounded text-text-muted hover:text-text-default"
          >
            <Chevron aria-hidden="true" className="size-4" />
          </button>
          <div>
            <Link
              to={`/programs/${group.programmeId}`}
              className="font-semibold text-link underline decoration-chart-blue-light underline-offset-4 transition-colors hover:text-chart-blue-darkest hover:decoration-chart-blue-darkest"
            >
              {group.programmeName}
            </Link>
            <span className="mt-0.5 block text-xs text-text-muted">
              {count} project{count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-text-muted">{group.pillarLabels.join(', ')}</td>
      <td className="px-3 py-3 text-sm text-text-muted">{group.owners.join(', ')}</td>
      <td className="px-3 py-3" />
      <td className="px-3 py-3" />
      <td className="px-3 py-3 text-sm whitespace-nowrap text-text-muted">
        {group.endDate ? (
          dateFormatter.format(new Date(group.endDate))
        ) : (
          <span className="text-text-subtle">Not set</span>
        )}
      </td>
      <td className="px-3 py-3">
        <ul className="flex flex-col items-start gap-1">
          {group.statusCounts.map(({ status, count: statusCount }) => (
            <li
              key={status}
              className="flex items-center gap-1.5"
              aria-label={`${statusCount} ${EXECUTION_STATUS_LABELS[status]}`}
            >
              <span className="text-xs font-semibold text-text-default">{statusCount}</span>
              <ExecutionStatusBadge status={status} />
            </li>
          ))}
        </ul>
      </td>
      <td className="px-3 py-3" />
      <td className="px-3 py-3" />
    </tr>
  )
}
