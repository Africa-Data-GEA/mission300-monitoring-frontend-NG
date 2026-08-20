import { Search } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useBrandConfig } from '@/features/branding/api'
import { HeaderNavDropdown } from './header-nav-dropdown'

/**
 * Public gateway header — two tiers now, brainstormed off IEA's header
 * structure per direct request (not copied wholesale — no icons, no
 * rounded corners, no blue accent, none of IEA's own visual language, just
 * the *shape*: a thin utility strip, a main bar with real dropdown nav and
 * a search that actually looks like it matters).
 *
 * This reverses the earlier "one bar, not three" rule from
 * docs/public-gateway-home.md §01 — a deliberate, requested change, not an
 * oversight of that rule.
 *
 * SQUARE CORNERS still applies throughout — see the dropdown menu's own
 * comment in header-nav-dropdown.tsx.
 *
 * SEARCH is still scoped honestly: no site-wide search index exists behind
 * this page, so it's labelled "Search this page" and jumps to the first
 * matching heading in the current document, just bigger and more central
 * now rather than a quiet corner input.
 *
 * Every nav item resolves to something real on this page or a real route
 * (`/progress`) — no placeholder links.
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
      {/* Utility strip */}
      <div className="border-b border-border-default bg-surface-sunken">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-end gap-x-5 gap-y-1 px-4 py-1.5 text-[0.8125rem] sm:px-6">
          <a href="#data-confidence" className="text-text-muted hover:text-link">
            About these figures
          </a>
          <a href="#institutions" className="text-text-muted hover:text-link">
            Who reports these figures
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-border-default bg-surface text-text-default">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={brand?.logoUrl ?? '/Logos/geapp.png'}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
            />
            <span className="min-w-0">
              <span className="block text-[1.125rem] leading-6 font-bold tracking-tight text-text-default">
                Mission 300 {brand?.countryName ?? 'Nigeria'}
              </span>
              <span className="block text-[0.8125rem] leading-4 text-text-muted">
                Federal Ministry of Power
              </span>
            </span>
          </Link>

          <nav aria-label="Page sections" className="flex items-center gap-5">
            <HeaderNavDropdown
              label="Figures"
              items={[
                { label: 'Latest published figures', to: '#latest-figures' },
                { label: 'Evolution over time', to: '#performance-evolution' },
                { label: 'Access connections by channel', to: '#access-channels' },
              ]}
            />
            <HeaderNavDropdown
              label="Delivery"
              items={[
                { label: 'Delivery in motion, by state', to: '#delivery-in-motion' },
                { label: 'National progress', to: '/progress' },
              ]}
            />
          </nav>

          <form role="search" onSubmit={handleSearch} className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto sm:min-w-[22rem]">
            <label htmlFor={searchId} className="sr-only">
              Search this page
            </label>
            <div className="flex items-center gap-2.5 border border-border-strong bg-surface-sunken px-4 py-2.5">
              <Search aria-hidden="true" className="size-5 shrink-0 text-text-subtle" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this page"
                className="w-full min-w-0 bg-transparent text-[1rem] text-text-default placeholder:text-text-subtle focus:outline-none"
              />
            </div>
          </form>

          <Link
            to="/account/login"
            className="shrink-0 text-[1rem] leading-6 font-medium text-link underline underline-offset-4 hover:no-underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
