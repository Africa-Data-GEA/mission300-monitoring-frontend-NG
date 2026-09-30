import { Link } from 'react-router'
import type { MilestoneRecord } from '@/api/schemas/programs'
import { Card } from '@/components/ui/card'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Real Milestone records (the same `milestones` table a project's own
 * profile page reads) for projects in this pillar — not a KPI standing in
 * for one. Renders nothing until someone actually creates a milestone
 * against a project here, rather than always showing a card.
 */
export function MilestonesSection({ milestones }: { milestones: readonly MilestoneRecord[] }) {
  if (milestones.length === 0) return null

  return (
    <Card variant="well" className="p-4">
      <h2 className="text-lg font-semibold text-text-default">Milestones</h2>
      <ul className="mt-3 flex flex-col divide-y divide-border-default">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-default">{milestone.name}</p>
              <Link
                to={`/programs/projects/${milestone.projectId}`}
                className="text-2xs text-text-muted underline-offset-2 hover:text-brand-700 hover:underline"
              >
                {milestone.projectName}
              </Link>
              <p className="mt-0.5 text-2xs text-text-subtle">
                Expected {formatDate(milestone.expectedDate)}
                {milestone.actualDate && ` · Actual ${formatDate(milestone.actualDate)}`}
              </p>
            </div>
            <ExecutionStatusBadge status={milestone.status} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
