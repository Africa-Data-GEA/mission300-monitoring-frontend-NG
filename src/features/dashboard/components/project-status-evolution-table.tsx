import { Link } from 'react-router'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import type { OngoingProject } from '../types'

/**
 * Stakeholder feedback asked for a table showing how priority project
 * status evolved over the reporting cycle, not just the current snapshot —
 * this reads each project's `statusHistory` (oldest to newest) as columns.
 */
export function ProjectStatusEvolutionTable({ projects }: { projects: readonly OngoingProject[] }) {
  const periods = projects[0]?.statusHistory.map((entry) => entry.period) ?? []

  if (projects.length === 0) {
    return <p className="mt-3 py-8 text-center text-sm text-text-muted">No ongoing projects found.</p>
  }

  /*
   * With no periods there are no columns, and the table degenerates into a
   * bare list of project names pretending to be a history. Say plainly that
   * the history was not supplied instead — the backend currently omits
   * `statusHistory` entirely (see BACKEND TOLERANCE in the schema).
   */
  if (periods.length === 0) {
    return (
      <p className="mt-3 py-8 text-center text-sm text-text-muted">
        No status history has been reported for these projects yet.
      </p>
    )
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-border-default">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead className="bg-surface-sunken text-xs font-medium text-text-muted">
          <tr>
            <th className="px-3 py-2.5">Project</th>
            {periods.map((period) => (
              <th key={period} className="px-3 py-2.5">
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default bg-surface-card">
          {projects.map((project) => (
            <tr key={project.id} className="align-top hover:bg-surface-subtle">
              <td className="px-3 py-3">
                <Link
                  to={`/programs/projects/${project.id}`}
                  className="font-semibold text-link underline decoration-chart-blue-light underline-offset-4 transition-colors hover:text-chart-blue-darkest hover:decoration-chart-blue-darkest"
                >
                  {project.name}
                </Link>
              </td>
              {project.statusHistory.map((entry) => (
                <td key={entry.period} className="px-3 py-3">
                  <ExecutionStatusBadge status={entry.status} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
