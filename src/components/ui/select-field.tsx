import { useId } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { SearchableSelect } from './searchable-select'
import type { FilterOption } from '@/types/filters'

/**
 * Labelled select used across filter bars.
 *
 * Wraps the Radix-based Select so callers pass a plain options array rather
 * than composing primitives at every call site.
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  className,
  labelClassName,
  triggerClassName,
  searchable,
  disabled,
}: {
  label: string
  value: string
  options: readonly FilterOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  labelClassName?: string
  triggerClassName?: string
  searchable?: boolean
  disabled?: boolean
}) {
  const labelId = useId()
  const triggerId = useId()

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label
        id={labelId}
        htmlFor={triggerId}
        className={cn('text-xs font-medium text-text-muted', labelClassName)}
      >
        {label}
      </label>
      {searchable ? (
        <SearchableSelect
          id={triggerId}
          aria-labelledby={`${labelId} ${triggerId}`}
          value={value}
          options={options}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={triggerClassName}
        />
      ) : (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          {/*
            Radix renders a button, not a native <select>, so the visible label is
            associated explicitly via aria-labelledby rather than htmlFor alone.
          */}
          <SelectTrigger id={triggerId} aria-labelledby={`${labelId} ${triggerId}`} className={triggerClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
