import { useState } from 'react'
import type {
  SubmissionDetail,
  ValidationDecisionRequest,
} from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const labels: Record<ValidationDecisionRequest['decision'], string> = {
  approved: 'Approve',
  provisional: 'Provisionally approve',
  returned: 'Return for correction',
  rejected: 'Reject',
}

export function ReviewDecisionForm({
  submission,
  pending,
  error,
  onSubmit,
}: {
  submission: SubmissionDetail
  pending: boolean
  error: Error | null
  onSubmit: (input: ValidationDecisionRequest) => void
}) {
  const [decision, setDecision] =
    useState<ValidationDecisionRequest['decision']>(submission.permittedDecisions[0] ?? 'approved')
  const [comments, setComments] = useState('')

  return (
    <Card className="p-4">
      <h2 className="font-semibold text-text-default">Record decision</h2>
      <label className="mt-4 block text-sm font-medium" htmlFor="review-decision">Decision</label>
      <select
        id="review-decision"
        value={decision}
        onChange={(event) => setDecision(event.target.value as ValidationDecisionRequest['decision'])}
        className="mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm"
      >
        {submission.permittedDecisions.map((value) => (
          <option key={value} value={value}>{labels[value]}</option>
        ))}
      </select>
      <label className="mt-4 block text-sm font-medium" htmlFor="review-comments">Comments *</label>
      <textarea
        id="review-comments"
        required
        minLength={3}
        value={comments}
        onChange={(event) => setComments(event.target.value)}
        className="mt-1.5 min-h-28 w-full rounded-control border border-border-default px-3 py-2 text-sm"
      />
      {error && <p className="mt-3 text-sm text-status-at-risk" role="alert">{error.message}</p>}
      <Button
        className="mt-4 w-full"
        disabled={pending || comments.trim().length < 3}
        onClick={() => onSubmit({ decision, comments })}
      >
        {pending ? 'Saving decision…' : labels[decision]}
      </Button>
    </Card>
  )
}
