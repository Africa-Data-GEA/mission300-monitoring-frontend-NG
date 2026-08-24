import { Search } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useBrandConfig } from '@/features/branding/api'
import { HeaderNavDropdown } from './header-nav-dropdown'

/**
 * Public gateway header — two tiers: a dark utility strip that names the
 * publisher, and a sticky white bar carrying navigation, search and the one
 * action an unauthenticated visitor might need.
 *
 * WHY THE PUBLISHER GOES IN THE STRIP. On a statistical publication the
 * accountable body is not a footer credit, it is part of the masthead. Putting
 * "Federal Republic of Nigeria · Federal Ministry of Power" in a dark band above
 * the logo does in one line what a row of partner logos fails to do in six.
 *
 * WHY THE MAIN BAR IS STICKY AND THE STRIP IS NOT. The strip is read once; the
 * navigation is used repeatedly, on a page that is now long enough that
 * scrolling back to the top to reach a section is a real cost. Only the bar
 * follows, and it condenses on scroll so it takes less of a phone screen once
 * the reader is inside the content.
 *
 * SQUARE CORNERS throughout — see the dropdown menu's own note in
 * header-nav-dropdown.tsx.
 *
 * SEARCH is scoped honestly: no site-wide search index exists behind this page,
 * so it is labelled "Search this page" and jumps to the first matching heading
 * in the current document. Every nav item resolves to a section that exists on
 * this page or a real route — no placeholder links.
 */
export function PublicHeader() {
  const { data: brand } = useBrandConfig()
  const navigate = useNavigate()
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [condensed, setCondensed] = useState(false)

  useEffect(() => {
    // 48px, not 0: a bar that condenses the instant the page moves flickers
    // under a trackpad's inertia. This waits until the strip above is gone.
    function onScroll() {
      setCondensed(window.scrollY > 48)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const term = query.trim().toLowerCase()
    if (!term) return

    // The smallest (most specific) matching element with an id wins, so
    // searching "mini-grid" lands on that one chart rather than the whole
    // section it sits in.
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
      {/* Utility strip — the publisher, and the two links that qualify every
          figure on the page. */}
      <div className="bg-brand-800 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <p className="text-[0.6875rem] leading-4 font-semibold tracking-[0.12em] text-white/70 uppercase">
            Federal Republic of Nigeria · Federal Ministry of Power
          </p>
          <nav aria-label="About this record" className="flex flex-wrap gap-x-5 gap-y-1">
            <a
              href="#data-confidence"
              className="text-[0.75rem] leading-4 font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              About these figures
            </a>
            <a
              href="#institutions"
              className="text-[0.75rem] leading-4 font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
            >
              Who reports these figures
            </a>
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={`sticky top-0 z-40 border-b bg-surface text-text-default transition-shadow ${
          condensed ? 'border-border-strong shadow-sm' : 'border-border-default'
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 transition-[padding] sm:px-6 ${
            condensed ? 'py-2' : 'py-3.5'
          }`}
        >
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={brand?.logoUrl ?? '/Logos/geapp.png'}
              alt=""
              width={36}
              height={36}
              className={`shrink-0 object-contain transition-all ${condensed ? 'size-7' : 'size-9'}`}
            />
            <span className="min-w-0">
              <span className="block text-[1.0625rem] leading-6 font-bold tracking-tight text-text-default">
                Mission 300 {brand?.countryName ?? 'Nigeria'}
              </span>
              <span
                className={`block overflow-hidden text-[0.75rem] leading-4 text-text-muted transition-all ${
                  condensed ? 'h-0 opacity-0' : 'h-4 opacity-100'
                }`}
              >
                National Energy Compact · public record
              </span>
            </span>
          </Link>

          <nav aria-label="Page sections" className="flex items-center gap-5">
            <HeaderNavDropdown
              label="Figures"
              items={[
                { label: 'Latest published figures', to: '#latest-figures' },
                { label: 'How the indicators have moved', to: '#performance-evolution' },
                { label: 'What the statuses mean', to: '#data-confidence' },
              ]}
            />
            <HeaderNavDropdown
              label="Delivery"
              items={[
                { label: 'How access is being delivered', to: '#access-delivery' },
                { label: 'Connections by channel', to: '#access-channels' },
                { label: 'Delivery by state', to: '#delivery-in-motion' },
              ]}
            />
            <HeaderNavDropdown
              label="About"
              items={[
                { label: 'Who reports these figures', to: '#institutions' },
                { label: 'National progress', to: '/progress' },
              ]}
            />
          </nav>

          <form
            role="search"
            onSubmit={handleSearch}
            className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto sm:min-w-[16rem]"
          >
            <label htmlFor={searchId} className="sr-only">
              Search this page
            </label>
            <div className="flex items-center gap-2 border border-border-strong bg-surface-sunken px-3 py-2 focus-within:border-brand-600">
              <Search aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this page"
                className="w-full min-w-0 bg-transparent text-[0.875rem] leading-5 text-text-default placeholder:text-text-subtle focus:outline-none"
              />
            </div>
          </form>

          <Link
            to="/account/login"
            className="shrink-0 border-2 border-brand-600 bg-brand-600 px-4 py-2 text-[0.875rem] leading-5 font-bold text-white transition-colors hover:bg-transparent hover:text-brand-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
