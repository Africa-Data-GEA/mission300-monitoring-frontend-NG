import { Trash2 } from 'lucide-react'
import type { EntryField } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { EntryGridRow as EntryGridRowValue } from '../lib/entry-grid'

const CELL_CLASS =
  'h-9 w-full min-w-28 rounded-control border border-border-default bg-surface px-2 text-sm text-text-default'

export function EntryGridRow({
  row,
  index,
  fields,
  institutions,
  periods,
  onChange,
  onRemove,
}: {
  row: EntryGridRowValue
  index: number
  fields: readonly EntryField[]
  institutions: readonly string[] | null
  periods: readonly string[]
  onChange: (patch: Partial<EntryGridRowValue>) => void
  onRemove: () => void
}) {
  return (
    <tr className="border-t border-border-default align-top">
      <td className="px-2 py-2 text-xs text-text-muted">{index + 1}</td>
      {institutions && (
        <td className="px-2 py-2">
          <Select value={row.institution} onValueChange={(institution) => onChange({ institution })}>
            <SelectTrigger aria-label={`Row ${index + 1} DisCo`} className="h-9 min-w-56">
              <SelectValue placeholder="Select DisCo" />
            </SelectTrigger>
            <SelectContent>
              {institutions.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
      )}
      <td className="px-2 py-2">
        <Select value={row.period} onValueChange={(period) => onChange({ period })}>
          <SelectTrigger aria-label={`Row ${index + 1} period`} className="h-9 min-w-32">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period} value={period}>{period}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      {fields.map((field) => (
        <td className="px-2 py-2" key={field.id}>
          {field.type === 'select' ? (
            <Select
              value={row.values[field.id] ?? ''}
              onValueChange={(value) => onChange({ values: { ...row.values, [field.id]: value } })}
            >
              <SelectTrigger aria-label={`Row ${index + 1} ${field.label}`} className="h-9 min-w-32">
                <SelectValue placeholder={field.placeholder || 'Select…'} />
              </SelectTrigger>
              <SelectContent>
                {field.options.filter((option) => option.value !== '').map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <input
              aria-label={`Row ${index + 1} ${field.label}`}
              className={CELL_CLASS}
              inputMode={field.type === 'number' ? 'decimal' : undefined}
              type={field.type === 'number' ? 'number' : 'text'}
              step={field.type === 'number' ? 'any' : undefined}
              value={row.values[field.id] ?? ''}
              onChange={(event) => onChange({ values: { ...row.values, [field.id]: event.target.value } })}
            />
          )}
        </td>
      ))}
      <td className="px-2 py-2">
        <Button aria-label={`Remove row ${index + 1}`} onClick={onRemove} size="icon" type="button" variant="ghost">
          <Trash2 />
        </Button>
      </td>
    </tr>
  )
}
