import { Bell, Menu, Search, X } from 'lucide-react'

/**
 * Application top bar: mobile brand mark, global search and notifications.
 *
 * Account identity now lives at the bottom of the sidebar rather than here —
 * see Sidebar — so this bar only carries what the sidebar can't show when
 * collapsed below `lg`: the drawer toggle, the brand mark, search and
 * notifications.
 *
 * Search and notifications are presentational for now — they need endpoints
 * that are not yet specified. They are marked disabled rather than wired to
 * no-op handlers so nobody mistakes them for working features.
 */
export function Topbar({
  isNavOpen = false,
  onToggleNav,
}: {
  isNavOpen?: boolean
  onToggleNav?: () => void
}) {
  return (
    <header className="flex items-center gap-2 rounded-card border border-border-default bg-surface px-3 py-2.5 sm:gap-3 sm:px-4">
      {/* Drawer toggle, below the lg breakpoint only. */}
      {onToggleNav && (
        <button
          type="button"
          onClick={onToggleNav}
          aria-label={isNavOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isNavOpen}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text-muted hover:bg-border-default lg:hidden"
        >
          {isNavOpen ? (
            <X aria-hidden="true" className="size-4" />
          ) : (
            <Menu aria-hidden="true" className="size-4" />
          )}
        </button>
      )}

      <span className="shrink-0 text-lg font-semibold tracking-tight text-text-default lg:hidden">
        M300
      </span>

      {/* Search is hidden on the narrowest screens, where it would crowd out
          the notifications button; it returns from sm upward. */}
      <div className="relative mx-auto hidden w-full max-w-xl sm:block">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-subtle"
        />
        <input
          type="search"
          disabled
          aria-label="Search navigations, KPIs, programs and pillars"
          placeholder="Search for navigations, kpis, programs, pillars, etc"
          className="w-full rounded-pill border border-border-default bg-surface-sunken py-2 pr-4 pl-10 text-sm text-text-default placeholder:text-text-subtle"
        />
      </div>

      <button
        type="button"
        disabled
        aria-label="Notifications, 99 or more unread"
        className="relative ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-text-muted sm:ml-0"
      >
        <Bell aria-hidden="true" className="size-4" />
        <span className="absolute -top-0.5 -right-1 rounded-pill bg-status-at-risk px-1.5 py-0.5 text-2xs leading-none font-semibold text-white">
          99+
        </span>
      </button>
    </header>
  )
}
