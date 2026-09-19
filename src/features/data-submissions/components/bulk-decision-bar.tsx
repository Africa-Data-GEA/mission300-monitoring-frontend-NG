import { useState } from 'react'
import type { ValidationDecisionRequest } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const labels: Record<ValidationDecisionRequest['decision'], string> = {
  approved: 'Approve',
  provisional: 'Provisionally approve',
  returned: 'Return for correction',
  rejected: 'Reject',
}

export function BulkDecisionBar({
  selectedCount,
  pending,
  error,
  onSubmit,
  onClear,
}: {
  selectedCount: number
  pending: boolean
  error: Error | null
  onSubmit: (input: Pick<ValidationDecisionRequest, 'decision' | 'comments'>) => void
  onClear: () => void
}) {
  const [decision, setDecision] = useState<ValidationDecisionRequest['decision']>('approved')
  const [comments, setComments] = useState('')

  return (
    <Card className="sticky top-2 z-10 flex flex-wrap items-center gap-3 p-3">
      <p className="text-sm font-medium text-text-default">
        {selectedCount} submission{selectedCount === 1 ? '' : 's'} selected
      </p>
      <select
        aria-label="Bulk decision"
        value={decision}
        onChange={(event) => setDecision(event.target.value as ValidationDecisionRequest['decision'])}
        className="h-9 rounded-control border border-border-default bg-surface px-2 text-sm"
      >
        {Object.entries(labels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <input
        aria-label="Bulk decision comments"
        placeholder="Comments (required)"
        value={comments}
        onChange={(event) => setComments(event.target.value)}
        className="h-9 min-w-56 flex-1 rounded-control border border-border-default px-3 text-sm"
      />
      <Button
        size="sm"
        disabled={pending || comments.trim().length < 3}
        onClick={() => onSubmit({ decision, comments })}
      >
        {pending ? 'Applying…' : `${labels[decision]} ${selectedCount}`}
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={onClear}>Clear selection</Button>
      {error && <p className="w-full text-sm text-status-at-risk" role="alert">{error.message}</p>}
    </Card>
  )
}
