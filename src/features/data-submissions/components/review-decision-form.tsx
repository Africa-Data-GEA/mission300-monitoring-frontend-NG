import { useState } from 'react'
import type {
  SubmissionDetail,
  ValidationDecisionRequest,
} from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Decision = ValidationDecisionRequest['decision']

const labels: Record<Decision, string> = {
  approved: 'Approve',
  provisional: 'Provisionally approve',
  returned: 'Return for correction',
  rejected: 'Reject',
}

const provisionalLabels: Record<Decision, string> = {
  approved: 'Confirm as approved',
  provisional: 'Provisionally approve',
  returned: 'Withdraw and return for correction',
  rejected: 'Withdraw and reject',
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
  const isProvisional = submission.status.code === 'provisional'
  const decisionLabels = isProvisional ? provisionalLabels : labels

  return (
    <Card className="p-4">
      <h2 className="font-semibold text-text-default">{isProvisional ? 'Confirm or withdraw' : 'Record decision'}</h2>
      {isProvisional && (
        <p className="mt-2 text-sm text-text-muted">
          This value is live as provisional. Confirm it as approved, or withdraw it by returning or rejecting. Withdrawing removes the value from the KPI.
        </p>
      )}
      <label className="mt-4 block text-sm font-medium" htmlFor="review-decision">Decision</label>
      <Select value={decision} onValueChange={(value) => setDecision(value as ValidationDecisionRequest['decision'])}>
        <SelectTrigger id="review-decision" className="mt-1.5 h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {submission.permittedDecisions.map((value) => (
            <SelectItem key={value} value={value}>{decisionLabels[value]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        {pending ? 'Saving decision…' : decisionLabels[decision]}
      </Button>
    </Card>
  )
}
