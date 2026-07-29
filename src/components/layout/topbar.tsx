import { Menu, SlidersHorizontal, X } from 'lucide-react'
import { TopbarNotifications } from './topbar-notifications'
import { TopbarSearch } from './topbar-search'

/**
 * Application top bar: mobile brand mark, global search and notifications.
 *
 * Account identity now lives at the bottom of the sidebar rather than here —
 * see Sidebar — so this bar only carries what the sidebar can't show when
 * collapsed below `lg`: the drawer toggle, the brand mark, search and
 * notifications.
 *
 * Search is left aligned with the page content; notifications stay on the
 * right so the two controls remain spatially predictable.
 */
export function Topbar({
  isNavOpen = false,
  filtersOpen = false,
  onToggleNav,
  onToggleFilters,
}: {
  isNavOpen?: boolean
  filtersOpen?: boolean
  onToggleNav?: () => void
  onToggleFilters?: () => void
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

      <TopbarSearch />
      <div className="ml-auto flex items-center gap-2">
        {onToggleFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            aria-label={filtersOpen ? 'Close filters' : 'Open filters'}
            aria-expanded={filtersOpen}
            aria-controls="executive-filter-panel"
            className="inline-flex h-9 items-center gap-2 rounded-control border border-border-default bg-surface px-3 text-sm font-medium text-text-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            <span className="hidden md:inline">Filters</span>
          </button>
        )}
        <TopbarNotifications />
      </div>
    </header>
  )
}
