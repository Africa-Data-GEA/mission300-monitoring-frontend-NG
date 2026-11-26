import { Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import { PipelineReadinessBadge } from '@/features/programs/components/pipeline-readiness-badge'
import { formatDeadline } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OngoingProject } from '../types'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function OngoingProjectRow({
  project,
  now,
  canManage,
  deleting,
  onDelete,
}: {
  project: OngoingProject
  now: Date
  canManage: boolean
  deleting: boolean
  onDelete: () => void
}) {
  const navigate = useNavigate()

  return (
    <tr className="align-top hover:bg-surface-subtle">
      <td className="py-3 pr-3 pl-9">
        <Link
          to={`/programs/projects/${project.id}`}
          className="font-medium text-link underline decoration-chart-blue-light underline-offset-4 transition-colors hover:text-chart-blue-darkest hover:decoration-chart-blue-darkest"
        >
          {project.name}
        </Link>
      </td>
      <td className="px-3 py-3 text-sm text-text-muted">{project.pillarLabel}</td>
      <td className="px-3 py-3 text-sm text-text-muted">{project.owner}</td>
      <td className="px-3 py-3 text-sm text-text-muted">{project.leadName || '—'}</td>
      <td className="px-3 py-3 text-sm text-text-muted">{project.location}</td>
      <td className="px-3 py-3 text-sm whitespace-nowrap text-text-muted">
        {project.endDate ? (
          <>
            {dateFormatter.format(new Date(project.endDate))}
            {/*
              An absolute date alone makes the reader do the arithmetic.
              For a row already flagged delayed, the overdue span is the
              number that matters, so it is tinted to match the badge.
            */}
            <span
              className={cn(
                'mt-0.5 block text-xs',
                new Date(project.endDate).getTime() < now.getTime()
                  ? 'font-medium text-status-at-risk'
                  : 'text-text-subtle',
              )}
            >
              {formatDeadline(project.endDate, now)}
            </span>
          </>
        ) : (
          <span className="text-text-subtle">Not set</span>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col items-start gap-1">
          <ExecutionStatusBadge status={project.currentStatus} />
          {project.pipelineReadiness && (
            <PipelineReadinessBadge readiness={project.pipelineReadiness} />
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-text-muted">
        <span className="line-clamp-2 max-w-[220px]" title={project.comment || undefined}>
          {project.comment || '—'}
        </span>
      </td>
      <td className="px-3 py-3">
        {canManage && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/programs/projects/${project.id}/edit`)}
              aria-label={`Edit ${project.name}`}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={deleting}
              onClick={onDelete}
              aria-label={`Remove ${project.name}`}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  )
}
