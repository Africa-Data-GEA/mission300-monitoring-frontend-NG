import type { ManualEntryDefinition } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'
import { EntryField } from '../components/entry-field'
import { SourceReferenceCard } from '../components/source-reference-card'

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

      <SourceReferenceCard
        sourceReference={sourceReference}
        onSourceReferenceChange={onSourceReferenceChange}
        notes={notes}
        onNotesChange={onNotesChange}
      />
    </div>
  )
}
