import { Search } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useBrandConfig } from '@/features/branding/api'

/**
 * Public gateway header — one bar, not three.
 *
 * Modelled on how GOV.UK, Eurostat and the French DSFR open a state page: a
 * single dark identity band carrying the crest and the service name, and
 * nothing else competing with it. The earlier version stacked a dark strip on
 * top of a white header on top of a nav, which is three bars of chrome before
 * a reader reaches a single word of content.
 *
 * SQUARE CORNERS, throughout this page. GOV.UK uses no border radius anywhere,
 * and that single decision does more to separate a state service from a
 * commercial template than any amount of colour — rounded cards are the
 * default output of every UI kit.
 *
 * The green rule beneath the bar is the one national note. Nigeria's flag
 * green (#008751) sits within a few degrees of GOV.UK's own #0f7a52, so the
 * page reads as an international government service that happens to be
 * Nigerian, rather than as a themed template.
 *
 * The Figma draft also showed a second nav row beneath the rule (Home / About
 * / Data Access). Cut: About and Data Access have no page to link to yet, and
 * a tab that does nothing when clicked reads as broken rather than deliberate
 * — worse than not showing it. Re-add the row once those pages exist.
 *
 * SEARCH. Modelled on the UKHSA data dashboard's header search, but scoped
 * honestly: there is no site-wide search index behind this page, so it is
 * labelled "Search this page" and jumps to the first matching heading in the
 * current document rather than pretending to search content that isn't here.
 * Overpromising a full-site search that silently does nothing off-page would
 * be worse than a small, working, page-scoped one.
 */
export function PublicHeader() {
  const { data: brand } = useBrandConfig()
  const navigate = useNavigate()
  const searchId = useId()
  const [query, setQuery] = useState('')

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const term = query.trim().toLowerCase()
    if (!term) return

    // The smallest (most specific) matching element with an id wins, so
    // searching "clean cooking" lands on that one pillar card rather than
    // the whole section it sits in.
    const candidates = Array.from(document.querySelectorAll<HTMLElement>('main [id]'))
    const matches = candidates
      .filter((el) => el.textContent?.toLowerCase().includes(term))
      .sort((a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0))
    const match = matches[0]
    if (!match) return

    match.scrollIntoView({ behavior: 'smooth', block: 'start' })
    match.setAttribute('tabindex', '-1')
    match.focus({ preventScroll: true })
    navigate({ hash: `#${match.id}` }, { replace: true })
  }

  return (
    <header>
      <div className="bg-surface-inverse text-text-inverse">
        <div className="mx-auto flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={brand?.logoUrl ?? '/Logos/geapp.png'}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
            />
            <span className="min-w-0">
              <span className="block text-[1.125rem] leading-6 font-bold tracking-tight">
                Mission 300 {brand?.countryName ?? 'Nigeria'}
              </span>
              <span className="block text-[0.8125rem] leading-4 opacity-70">
                Federal Ministry of Power
              </span>
            </span>
          </Link>

          <form
            role="search"
            onSubmit={handleSearch}
            className="order-3 w-full sm:order-2 sm:ml-auto sm:w-auto sm:min-w-[18rem]"
          >
            <label htmlFor={searchId} className="sr-only">
              Search this page
            </label>
            <div className="flex items-center gap-2 bg-surface px-3 py-2">
              <Search aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this page"
                className="w-full min-w-0 bg-transparent text-[0.9375rem] text-text-default placeholder:text-text-subtle focus:outline-none"
              />
            </div>
          </form>

          <Link
            to="/account/login"
            className="order-2 shrink-0 text-[1rem] leading-6 font-medium underline underline-offset-4 hover:no-underline sm:order-3"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div aria-hidden="true" className="h-1 bg-brand-600" />
    </header>
  )
}
