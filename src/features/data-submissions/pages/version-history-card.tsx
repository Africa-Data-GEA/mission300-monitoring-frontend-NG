import type { SubmissionDetail } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'
import { WorkflowStatusBadge } from '../components/workflow-status'

/** Chronological list of status changes for this submission. */
export function VersionHistoryCard({
  history,
}: {
  history: SubmissionDetail['history']
}) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Version history
      </h2>
      <ol className="mt-3 space-y-3">
        {history.map((item) => (
          <li key={item.id} className="border-l-2 border-border-default pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <WorkflowStatusBadge status={item.status} />
              <span className="text-xs text-text-muted">
                {item.occurredAtLabel}
              </span>
            </div>
            <p className="mt-1 text-sm">
              {item.actor} — {item.comment}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
