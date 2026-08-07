import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GOOGLE_FONTS } from '@/features/branding/google-fonts-list'

const MAX_RESULTS = 40

/**
 * Searchable Google Fonts combobox for one heading/body role. The full
 * ~1,900-family catalogue (google-fonts-list.ts) is filtered client-side —
 * results are capped so the open popover never renders more than a
 * screenful, not because the underlying list is trimmed.
 */
export function FontPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (family: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q ? GOOGLE_FONTS.filter((f) => f.family.toLowerCase().includes(q)) : GOOGLE_FONTS
    return matches.slice(0, MAX_RESULTS)
  }, [query])

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-default">{label}</span>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery('')
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-control border border-border-strong bg-surface px-3 text-sm text-text-default"
          >
            <span style={{ fontFamily: `'${value}', var(--font-sans)` }}>{value}</span>
            <span className="text-text-subtle">▾</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="border-b border-border-default p-2">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Google Fonts…"
              className="h-9 w-full rounded-control border border-border-strong bg-surface px-2.5 text-sm text-text-default placeholder:text-text-subtle"
              aria-label={`Search fonts for ${label}`}
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1" role="listbox" aria-label={`${label} font options`}>
            {results.length === 0 && (
              <li className="px-2.5 py-2 text-sm text-text-subtle">No fonts match "{query}".</li>
            )}
            {results.map((font) => (
              <li key={font.family}>
                <button
                  type="button"
                  role="option"
                  aria-selected={font.family === value}
                  onClick={() => {
                    onChange(font.family)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`flex w-full items-center justify-between rounded-control px-2.5 py-2 text-left text-sm hover:bg-surface-sunken ${
                    font.family === value ? 'bg-surface-sunken text-brand-700' : 'text-text-default'
                  }`}
                >
                  <span>{font.family}</span>
                  <span className="text-2xs text-text-subtle">{font.category}</span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}
