import type { ManualEntryDefinition } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'
import { EntryField } from '../components/entry-field'

const TEXTAREA_CLASS =
  'mt-1.5 w-full rounded-control border border-border-default bg-surface px-3 py-2 text-sm'

/** The obligation's configured field sections, plus the source-reference and
 * notes fields every manual submission requires. */
export function EntrySections({
  sections,
  values,
  onFieldChange,
  sourceReference,
  onSourceReferenceChange,
  notes,
  onNotesChange,
}: {
  sections: ManualEntryDefinition['sections']
  values: Record<string, string>
  onFieldChange: (fieldId: string, value: string) => void
  sourceReference: string
  onSourceReferenceChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card className="p-4" key={section.id}>
          <h2 className="text-lg font-semibold text-text-default">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-text-muted">{section.description}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {section.fields.map((field) => (
              <EntryField
                key={field.id}
                field={field}
                value={values[field.id] ?? ''}
                onChange={(value) => onFieldChange(field.id, value)}
              />
            ))}
          </div>
        </Card>
      ))}

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

        <label
          htmlFor="submission-notes"
          className="mt-4 block text-sm font-medium"
        >
          Submission notes
        </label>
        <textarea
          id="submission-notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          className={TEXTAREA_CLASS}
        />
      </Card>
    </div>
  )
}
