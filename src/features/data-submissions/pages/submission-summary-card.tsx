import type { SubmissionDetail } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'
import { WorkflowStatusBadge } from '../components/workflow-status'

/** Header card: dataset, institution, method, version and source reference. */
export function SubmissionSummaryCard({
  submission,
}: {
  submission: SubmissionDetail
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-default">
            {submission.dataset}
          </h2>
          <p className="text-sm text-text-muted">
            {submission.institution} · {submission.reportingPeriod}
          </p>
        </div>
        <WorkflowStatusBadge status={submission.status} />
      </div>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-text-muted">Method</dt>
          <dd>{submission.methodLabel}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Version</dt>
          <dd>v{submission.version}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Submitted by</dt>
          <dd>{submission.submittedBy}</dd>
        </div>
        <div>
          <dt className="text-text-muted">File</dt>
          <dd>{submission.fileName ?? 'Manual entry'}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm">
        <span className="text-text-muted">Source:</span>{' '}
        {submission.sourceReference}
      </p>
    </Card>
  )
}
