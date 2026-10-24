import type { EntryDraft } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'

function savedTime(savedAt: string) {
  return new Date(savedAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Tells the provider a draft exists, that it has not been sent for review,
 * and lets them throw it away. */
export function DraftStatus({
  draft,
  onDiscard,
  isDiscarding,
}: {
  draft: EntryDraft
  onDiscard: () => void
  isDiscarding: boolean
}) {
  return (
    <div className="mt-4 rounded-control border border-border-default bg-surface-sunken p-3 text-xs">
      <p className="font-medium text-text-default">Draft saved, not submitted</p>
      <p className="mt-0.5 text-text-muted">
        {savedTime(draft.savedAt)} by {draft.savedBy}
      </p>
      <Button
        className="mt-2"
        disabled={isDiscarding}
        onClick={onDiscard}
        size="sm"
        type="button"
        variant="ghost"
      >
        {isDiscarding ? 'Discarding…' : 'Discard draft'}
      </Button>
    </div>
  )
}
