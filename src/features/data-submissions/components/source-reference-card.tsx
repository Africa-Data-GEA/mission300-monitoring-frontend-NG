import { Card } from '@/components/ui/card'

const TEXTAREA_CLASS =
  'mt-1.5 w-full rounded-control border border-border-default bg-surface px-3 py-2 text-sm'

export function SourceReferenceCard({
  sourceReference,
  onSourceReferenceChange,
  notes,
  onNotesChange,
}: {
  sourceReference: string
  onSourceReferenceChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}) {
  return (
    <Card className="p-4">
      <label htmlFor="source-reference" className="text-sm font-medium">
        Source reference *
      </label>
      <textarea
        id="source-reference"
        required
        value={sourceReference}
        onChange={(event) => onSourceReferenceChange(event.target.value)}
        className={TEXTAREA_CLASS}
      />

      <label htmlFor="submission-notes" className="mt-4 block text-sm font-medium">
        Submission notes
      </label>
      <textarea
        id="submission-notes"
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        className={TEXTAREA_CLASS}
      />
    </Card>
  )
}
