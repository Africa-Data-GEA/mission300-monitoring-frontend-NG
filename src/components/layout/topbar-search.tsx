import { useMemo, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { NAVIGATION } from '@/config/navigation'

const SEARCH_TARGETS = NAVIGATION.flatMap((group) =>
  group.items.flatMap((item) => [
    { label: item.label, context: group.label, to: item.to },
    ...(item.children ?? []).map((child) => ({
      label: child.label,
      context: item.label,
      to: child.to,
    })),
  ]),
)

export function TopbarSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setOpen] = useState(false)
  const normalized = query.trim().toLocaleLowerCase()
  const matches = useMemo(
    () =>
      SEARCH_TARGETS.filter((target) =>
        `${target.label} ${target.context}`.toLocaleLowerCase().includes(normalized),
      ).slice(0, 5),
    [normalized],
  )

  function go(to: string) {
    navigate(to)
    setQuery('')
    setOpen(false)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim()) return
    go(matches[0]?.to ?? `/kpis?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      className="relative hidden w-full max-w-md sm:block"
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-text-subtle"
      />
      <input
        type="search"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        aria-label="Search navigation, KPIs, programs and pillars"
        aria-expanded={isOpen}
        aria-controls="global-search-results"
        placeholder="Search pages, KPIs, programs or pillars"
        className="w-full rounded-pill border border-border-default bg-surface-sunken py-2 pr-4 pl-10 text-sm text-text-default outline-none placeholder:text-text-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      {isOpen && (
        <div
          id="global-search-results"
          className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-border-default bg-surface shadow-xl"
        >
          <p className="px-3 pt-3 pb-1 text-2xs font-semibold tracking-wide text-text-subtle uppercase">
            {normalized ? 'Matching pages' : 'Quick links'}
          </p>
          <div className="p-1.5">
            {matches.map((target) => (
              <button
                key={`${target.to}-${target.label}`}
                type="button"
                onClick={() => go(target.to)}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none"
              >
                <span className="text-sm font-medium text-text-default">{target.label}</span>
                <span className="text-xs text-text-muted">{target.context}</span>
              </button>
            ))}

            {normalized && (
              <div className="mt-1 border-t border-border-default pt-1">
                <button
                  type="button"
                  onClick={() => go(`/kpis?search=${encodeURIComponent(query.trim())}`)}
                  className="w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-link hover:bg-surface-sunken"
                >
                  Search KPI Directory for “{query.trim()}”
                </button>
                <button
                  type="button"
                  onClick={() => go(`/programs?search=${encodeURIComponent(query.trim())}`)}
                  className="w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-link hover:bg-surface-sunken"
                >
                  Search Programs for “{query.trim()}”
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
