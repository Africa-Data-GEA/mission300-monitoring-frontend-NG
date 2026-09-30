import { useMemo, useState, type FormEvent } from 'react'
import { LoaderCircle, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { NAVIGATION } from '@/config/navigation'
import { useGlobalSearch } from '@/features/search/use-global-search'

const NAV_TARGETS = NAVIGATION.flatMap((group) =>
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

  const navMatches = useMemo(
    () =>
      NAV_TARGETS.filter((target) =>
        `${target.label} ${target.context}`.toLocaleLowerCase().includes(normalized),
      ).slice(0, 5),
    [normalized],
  )

  const globalSearch = useGlobalSearch(query)

  function go(to: string) {
    navigate(to)
    setQuery('')
    setOpen(false)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!query.trim()) return
    const firstResult = globalSearch.results[0]?.url ?? navMatches[0]?.to
    go(firstResult ?? `/kpis?search=${encodeURIComponent(query.trim())}`)
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
      {globalSearch.isPending ? (
        <LoaderCircle
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 animate-spin text-text-subtle"
        />
      ) : (
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-text-subtle"
        />
      )}
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
        aria-label="Search pages, KPIs, programs and projects"
        aria-expanded={isOpen}
        aria-controls="global-search-results"
        placeholder="Search pages, KPIs, programs or projects"
        className="w-full rounded-pill border border-border-default bg-surface-sunken py-2 pr-4 pl-10 text-sm text-text-default outline-none placeholder:text-text-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      {isOpen && (
        <div
          id="global-search-results"
          className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-border-default bg-surface shadow-xl"
        >
          {globalSearch.isActive ? (
            <>
              <p className="px-3 pt-3 pb-1 text-2xs font-semibold tracking-wide text-text-subtle uppercase">
                Matching records
              </p>
              <div className="p-1.5">
                {globalSearch.results.length === 0 && !globalSearch.isPending && (
                  <p className="px-2.5 py-2 text-sm text-text-muted">
                    No KPIs, programs or projects match “{query.trim()}”.
                  </p>
                )}
                {globalSearch.results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => go(result.url)}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none"
                  >
                    <span className="text-sm font-medium text-text-default">{result.title}</span>
                    <span className="text-xs text-text-muted">{result.subtitle}</span>
                  </button>
                ))}

                {navMatches.length > 0 && (
                  <div className="mt-1 border-t border-border-default pt-1">
                    {navMatches.map((target) => (
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
                  </div>
                )}

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
              </div>
            </>
          ) : (
            <>
              <p className="px-3 pt-3 pb-1 text-2xs font-semibold tracking-wide text-text-subtle uppercase">
                Quick links
              </p>
              <div className="p-1.5">
                {navMatches.map((target) => (
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
              </div>
            </>
          )}
        </div>
      )}
    </form>
  )
}
