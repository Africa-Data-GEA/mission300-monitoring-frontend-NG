import { useEffect, useState } from 'react'
import { Outlet, useMatches } from 'react-router'
import { GlobalFiltersProvider } from '@/app/global-filters'
import { GlobalFilterBar } from './global-filter-bar'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { TopNav } from './top-nav'

/**
 * Application chrome: top navigation and routed content.
 *
 * TopNav is the persistent horizontal nav from `lg` upward. Below `lg`,
 * Topbar takes over as the top bar and primary navigation becomes a
 * slide-over drawer (Sidebar) opened from its hamburger, so the full
 * navigation stays reachable on a tablet or phone rather than being hidden
 * with no alternative.
 */
export function AppShell() {
  const [isNavOpen, setNavOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  /*
   * A route opts out of the application-wide filter bar via
   * `handle.globalFilters: false` — see src/app/router.tsx. Administration
   * does, because its specification gives it its own filter set.
   */
  const matches = useMatches()
  const showGlobalFilters = matches.some(
    (match) => (match.handle as { globalFilters?: boolean } | undefined)
      ?.globalFilters,
  )

  // Escape is the expected way out of an overlay.
  useEffect(() => {
    if (!isNavOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setNavOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isNavOpen])

  return (
    <GlobalFiltersProvider>
    <div className="flex min-h-svh flex-col bg-surface-page">
      {/* Desktop primary nav, lg upward. */}
      <TopNav
        className="sticky top-0 z-40 hidden lg:flex"
        filtersOpen={filtersOpen}
        onToggleFilters={showGlobalFilters ? () => setFiltersOpen((open) => !open) : undefined}
      />

      {/* Mobile/tablet top bar, below lg. */}
      <div className="sticky top-0 z-40 lg:hidden">
        <Topbar
          isNavOpen={isNavOpen}
          filtersOpen={filtersOpen}
          onToggleNav={() => setNavOpen((previous) => !previous)}
          onToggleFilters={showGlobalFilters ? () => setFiltersOpen((open) => !open) : undefined}
        />
      </div>

      {/* Slide-over drawer below lg. */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/*
            Click-outside-to-dismiss backdrop. Hidden from the accessibility
            tree and out of tab order: keyboard and screen-reader users
            already have two ways to close the drawer (Escape, and the topbar
            toggle button), so this must not appear as a second, identically
            labelled "Close navigation" control.
          */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <Sidebar
            className="relative h-full w-72 shadow-xl"
            // Following a link should dismiss the drawer, or the new page
            // opens behind it.
            onNavigate={() => setNavOpen(false)}
          />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">
        {showGlobalFilters && filtersOpen && (
          <GlobalFilterBar onClose={() => setFiltersOpen(false)} />
        )}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
    </GlobalFiltersProvider>
  )
}
