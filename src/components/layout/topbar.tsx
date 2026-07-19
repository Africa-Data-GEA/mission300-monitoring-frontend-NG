import { Bell, Search } from 'lucide-react'

/**
 * Application top bar: brand, global search and account controls.
 *
 * Search and notifications are presentational for now — they need endpoints
 * that are not yet specified. They are marked disabled rather than wired to
 * no-op handlers so nobody mistakes them for working features.
 */
export function Topbar() {
  return (
    <header className="flex items-center gap-3 rounded-card bg-surface-inverse px-4 py-2.5">
      <span className="text-lg font-semibold tracking-tight text-text-inverse">
        M300
      </span>

      <div className="relative mx-auto w-full max-w-xl">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-subtle"
        />
        <input
          type="search"
          disabled
          aria-label="Search navigations, KPIs, programs and pillars"
          placeholder="Search for navigations, kpis, programs, pillars, etc"
          className="w-full rounded-pill border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-text-inverse placeholder:text-text-subtle"
        />
      </div>

      <button
        type="button"
        disabled
        aria-label="Notifications, 99 or more unread"
        className="relative inline-flex size-9 items-center justify-center rounded-full bg-white/5 text-text-inverse"
      >
        <Bell aria-hidden="true" className="size-4" />
        <span className="absolute -top-0.5 -right-1 rounded-pill bg-status-at-risk px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">
          99+
        </span>
      </button>

      <div className="flex items-center gap-2.5 rounded-pill bg-surface py-1.5 pr-4 pl-1.5">
        <span
          aria-hidden="true"
          className="inline-flex size-7 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white"
        >
          JO
        </span>
        <span className="text-sm font-medium text-text-default">John Doe</span>
      </div>
    </header>
  )
}
