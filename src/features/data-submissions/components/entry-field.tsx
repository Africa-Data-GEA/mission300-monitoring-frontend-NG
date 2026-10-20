import type { EntryField as EntryFieldDefinition } from '@/api/schemas/data-submissions'
import { FieldHint } from '@/components/ui/field-hint'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const controlClass =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default'

export function EntryField({
  field,
  value,
  onChange,
}: {
  field: EntryFieldDefinition
  value: string
  onChange: (value: string) => void
}) {
  const common = {
    id: field.id,
    name: field.id,
    required: field.required,
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(event.target.value),
  }

  return (
    <div>
      <label htmlFor={field.id} className="inline-flex items-center gap-1 text-sm font-medium text-text-default">
        {field.label}{field.required && <span aria-hidden="true"> *</span>}
        {field.helpText && <FieldHint label={field.label} text={field.helpText} />}
      </label>
      {field.type === 'select' ? (
        <Select name={field.id} required={field.required} value={value} onValueChange={onChange}>
          <SelectTrigger id={field.id} className="mt-1.5 h-10">
            <SelectValue placeholder={field.placeholder || 'Select…'} />
          </SelectTrigger>
          <SelectContent>
            {field.options.filter((option) => option.value !== '').map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'textarea' ? (
        <textarea {...common} className={`${controlClass} min-h-24 py-2`} placeholder={field.placeholder} />
      ) : (
        <div className="relative">
          <input {...common} className={controlClass} placeholder={field.placeholder} type={field.type} />
          {field.unit && <span className="absolute right-3 top-1/2 text-xs text-text-muted">{field.unit}</span>}
        </div>
      )}
    </div>
  )
}
