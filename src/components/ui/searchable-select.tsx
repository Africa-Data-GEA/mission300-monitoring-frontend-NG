import { Check, ChevronDown, Search } from 'lucide-react'
import { useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { FilterOption } from '@/types/filters'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

/**
 * A dropdown with a search box, for lists too long to scan (projects,
 * programmes, institutions). Matches the plain Select's trigger and option
 * styling, and keeps its panel no wider than the trigger so a very long
 * option name wraps instead of stretching the panel across the screen.
 */
export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No matches',
  id,
  disabled,
  className,
  'aria-labelledby': labelledBy,
  'aria-label': label,
}: {
  value: string
  options: readonly FilterOption[]
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  id?: string
  disabled?: boolean
  className?: string
  'aria-labelledby'?: string
  'aria-label'?: string
}) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((option) => option.value === value)
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options
  }, [options, query])

  function choose(next: string) {
    onChange(next)
    setOpen(false)
    setQuery('')
    setActive(0)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => Math.min(current + 1, matches.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = matches[active]
      if (option) choose(option.value)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setActive(0)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : label}
          disabled={disabled}
          data-placeholder={selected ? undefined : ''}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-control border border-border-default bg-surface px-3 text-sm font-medium text-text-default transition-colors',
            'hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50',
            'data-[placeholder]:text-text-subtle',
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[80] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <div className="flex items-center gap-2 border-b border-border-default px-3">
          <Search aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full bg-transparent text-sm text-text-default outline-none placeholder:text-text-subtle"
          />
        </div>
        <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1">
          {matches.length === 0 && <li className="px-2 py-3 text-sm text-text-muted">{emptyMessage}</li>}
          {matches.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(option.value)}
              ref={(node) => {
                if (node && index === active) node.scrollIntoView({ block: 'nearest' })
              }}
              className={cn(
                'relative flex cursor-pointer items-start gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm leading-snug text-text-default',
                index === active && 'bg-surface-sunken',
              )}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check aria-hidden="true" className="absolute right-2 top-2 size-3.5 text-brand-600" />
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
