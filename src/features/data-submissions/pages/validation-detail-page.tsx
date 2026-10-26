import { useNavigate, useParams } from 'react-router'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ListState } from '../components/list-state'
import { ReviewDecisionForm } from '../components/review-decision-form'
import { WorkflowShell } from '../components/workflow-shell'
import { useSubmissionReview, useValidationDecision } from '../api'
import { ExtractedValuesCard } from './extracted-values-card'
import { ISSUE_COLUMNS } from './issue-columns'
import { SubmissionSummaryCard } from './submission-summary-card'
import { VersionHistoryCard } from './version-history-card'

export function ValidationDetailPage() {
  const id = useParams().submissionId ?? ''
  const navigate = useNavigate()
  const review = useSubmissionReview(id)
  const decision = useValidationDecision(id)

  return (
    <WorkflowShell
      title={review.data ? `Review: ${review.data.dataset}` : 'Review submission'}
      description={
        review.data
          ? `${review.data.institution} · ${review.data.reportingPeriod}. Check the values below, then record a decision.`
          : 'Check the values below, then record a decision.'
      }
    >
      <ListState
        pending={review.isPending}
        error={review.error}
        retry={() => void review.refetch()}
      >
        {review.data && (
          <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
            <div className="space-y-4">
              <SubmissionSummaryCard submission={review.data} />

              <Card className="p-4">
                <h2 className="text-lg font-semibold text-text-default">
                  Validation issues
                </h2>
                <div className="mt-3">
                  <DataTable
                    caption="Validation issues"
                    columns={ISSUE_COLUMNS}
                    rows={review.data.issues}
                    getRowId={(row) => row.id}
                    emptyMessage="No format or range problems were found in the values below. This does not confirm they are correct: that is the reviewer's decision."
                  />
                </div>
              </Card>

              <ExtractedValuesCard submission={review.data} />

              <VersionHistoryCard history={review.data.history} />
            </div>

            {review.data.permittedDecisions.length > 0 && (
              <ReviewDecisionForm
                submission={review.data}
                pending={decision.isPending}
                error={decision.error}
                onSubmit={(input) =>
                  decision.mutate(input, {
                    onSuccess: (result) =>
                      navigate(result.nextUrl, {
                        state:
                          result.published.length > 0
                            ? { publishedMessage: result.message }
                            : undefined,
                      }),
                  })
                }
              />
            )}
          </div>
        )}
      </ListState>
    </WorkflowShell>
  )
}
