import { NAVIGATION } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { NavDropdownItem } from './nav-dropdown-item'
import { NavItem } from './nav-item'

/**
 * Primary navigation.
 *
 * Active items are filled with the deep brand green and reversed to white.
 * Inactive items sit on a very light tint rather than carrying a border — at
 * this density a border per row draws more attention to the chrome than to the
 * content. Items whose pages are not yet built render as disabled buttons
 * rather than links, so the full information architecture is reviewable
 * without producing dead routes. Items with children (e.g. Compact pillar
 * dashboards) expand in place as a dropdown rather than linking anywhere
 * themselves — see NavDropdownItem.
 */
export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string
  /** Called when a link is followed — used to dismiss the mobile drawer. */
  onNavigate?: () => void
}) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex w-56 shrink-0 flex-col gap-4 bg-surface px-2.5 py-4',
        className,
      )}
    >
      <div className="px-1.5">
        <img alt="gEApp" src="/Logos/geapp.png" className="h-7 w-auto object-contain" />
      </div>

      {NAVIGATION.map((group) => (
        <div key={group.label}>
          <p className="px-1.5 pb-1.5 text-2xs font-medium tracking-wide text-text-subtle uppercase">
            {group.label}
          </p>

          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                {item.ready && item.children ? (
                  <NavDropdownItem item={item} />
                ) : (
                  <NavItem item={item} onNavigate={onNavigate} />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p id="nav-not-available" className="sr-only">
        This section is not yet available.
      </p>

      {/*
        Placeholder session details — there is no auth context wiring the
        logged-in user through yet, so this mirrors the same static values
        the top bar used before, moved here per the current design direction.
      */}
      <div className="mt-auto flex items-center gap-2 rounded-control bg-surface-sunken px-2 py-2">
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white"
        >
          JO
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-default">John Doe</p>
          <p className="truncate text-xs text-text-muted">Administrator</p>
        </div>
      </div>
    </nav>
  )
}
