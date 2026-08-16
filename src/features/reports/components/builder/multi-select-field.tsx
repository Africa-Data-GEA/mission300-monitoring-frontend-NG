import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * A checkbox-list multi-select, for the two Report Builder filters that
 * accept more than one value (Reporting period, Compact pillar) — every
 * other filter here stays a single SelectField.
 *
 * `allValue`, when given, behaves exclusively: picking it clears every other
 * selection, and picking any other option clears it — the pillar filter's
 * "all" option doesn't compose with a specific pillar the way "Q1" and "Q2"
 * compose with each other.
 */
export function MultiSelectField({
  label,
  values,
  options,
  onChange,
  allValue,
}: {
  label: string
  values: readonly string[]
  options: readonly { value: string; label: string }[]
  onChange: (values: string[]) => void
  allValue?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle(value: string) {
    if (allValue && value === allValue) {
      onChange([allValue])
      return
    }
    const withoutAll = allValue ? values.filter((entry) => entry !== allValue) : values
    const next = withoutAll.includes(value) ? withoutAll.filter((entry) => entry !== value) : [...withoutAll, value]
    onChange(next.length === 0 ? (allValue ? [allValue] : [value]) : next)
  }

  const summary =
    allValue && values.includes(allValue)
      ? (options.find((option) => option.value === allValue)?.label ?? 'All')
      : values.length === 0
        ? 'Select…'
        : values.length === 1
          ? (options.find((option) => option.value === values[0])?.label ?? values[0])
          : `${values.length} selected`

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-1 text-xs font-medium text-text-muted">{label}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-full items-center justify-between rounded-control border border-border-default bg-surface px-3 text-left text-sm text-text-default"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown aria-hidden="true" className={cn('size-4 shrink-0 text-text-subtle', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          id={panelId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-control border border-border-default bg-surface p-1.5 shadow-lg"
        >
          {options.map((option) => {
            const checked = values.includes(option.value)
            return (
              <label
                key={option.value}
                role="option"
                aria-selected={checked}
                className="flex items-center gap-2 rounded-control px-2 py-1.5 text-sm text-text-default hover:bg-surface-sunken"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.value)}
                  className="size-3.5 accent-brand-700"
                />
                {option.label}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
