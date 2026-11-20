import { Check, RotateCcw, X } from 'lucide-react'
import type { ValidationDecisionRequest } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'

type Decision = ValidationDecisionRequest['decision']

export function UploadDecisionButtons({
  pendingCount,
  busy,
  label,
  onDecide,
}: {
  pendingCount: number
  busy: boolean
  label: string
  onDecide: (decision: Decision) => void
}) {
  if (pendingCount === 0) return <p className="text-sm text-text-muted">Nothing waiting for a decision.</p>

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`Decide ${label}`}>
      <Button size="sm" disabled={busy} onClick={() => onDecide('approved')} type="button">
        <Check />
        Approve {label} ({pendingCount})
      </Button>
      <Button size="sm" variant="secondary" disabled={busy} onClick={() => onDecide('returned')} type="button">
        <RotateCcw />
        Return
      </Button>
      <Button size="sm" variant="secondary" disabled={busy} onClick={() => onDecide('rejected')} type="button">
        <X />
        Reject
      </Button>
    </div>
  )
}
