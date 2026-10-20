import { Plus, Users } from 'lucide-react'
import type { ManualEntryDefinition } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { EntryGridRow as EntryGridRowValue } from '../lib/entry-grid'
import { EntryGridRow } from './entry-grid-row'

export function EntryGrid({
  definition,
  rows,
  periods,
  onRowChange,
  onRowRemove,
  onAddRow,
  onAddAllDiscos,
}: {
  definition: ManualEntryDefinition
  rows: readonly EntryGridRowValue[]
  periods: readonly string[]
  onRowChange: (key: string, patch: Partial<EntryGridRowValue>) => void
  onRowRemove: (key: string) => void
  onAddRow: () => void
  onAddAllDiscos: () => void
}) {
  const fields = definition.sections.flatMap((section) => section.fields)
  const institutions = definition.consolidated ? (definition.institutions ?? []) : null

  return (
    <Card className="min-w-0 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-default">
            {definition.consolidated ? 'Values for each DisCo' : 'Values for each period'}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {definition.consolidated
              ? 'One row per DisCo and period. Each row becomes a separate submission for that DisCo.'
              : 'One row per reporting period. Each row becomes a separate submission.'}
          </p>
        </div>
        <div className="flex gap-2">
          {definition.consolidated && (
            <Button onClick={onAddAllDiscos} size="sm" type="button" variant="secondary">
              <Users aria-hidden="true" /> Add all DisCos
            </Button>
          )}
          <Button onClick={onAddRow} size="sm" type="button" variant="secondary">
            <Plus aria-hidden="true" /> Add row
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-text-muted">
              <th className="px-2 py-1 font-medium">#</th>
              {institutions && <th className="px-2 py-1 font-medium">DisCo</th>}
              <th className="px-2 py-1 font-medium">Period</th>
              {fields.map((field) => (
                <th className="px-2 py-1 font-medium" key={field.id}>
                  {field.label}
                  {field.unit ? <span className="font-normal"> ({field.unit})</span> : null}
                </th>
              ))}
              <th className="px-2 py-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <EntryGridRow
                key={row.key}
                row={row}
                index={index}
                fields={fields}
                institutions={institutions}
                periods={periods}
                onChange={(patch) => onRowChange(row.key, patch)}
                onRemove={() => onRowRemove(row.key)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
