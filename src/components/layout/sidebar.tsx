import { Link } from 'react-router'
import { NAVIGATION } from '@/config/navigation'
import { readAuthSession } from '@/features/auth/auth-session'
import { canRoleReachModule } from '@/features/auth/role-access'
import { useBrandConfig } from '@/features/branding/api'
import { cn } from '@/lib/utils'
import { NavDropdownItem } from './nav-dropdown-item'
import { NavItem } from './nav-item'
import { SidebarUserMenu } from './sidebar-user-menu'

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
  const session = readAuthSession()
  const roleSlug = session?.user.role
  const { data: brand } = useBrandConfig()

  // No session (e.g. a dev workflow that never went through /account/login)
  // shows the full nav rather than nothing — restriction only applies once a
  // real signed-in role exists to restrict against.
  const visibleGroups = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !roleSlug || canRoleReachModule(roleSlug, item.moduleKey),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'flex w-64 shrink-0 flex-col overflow-hidden bg-surface',
        className,
      )}
    >
      <div className="shrink-0 px-4 pt-5 pb-4">
        <Link to="/" aria-label="Go to the public landing page" className="inline-block">
          <img
            alt={brand?.countryName ?? 'gEApp'}
            src={brand?.logoUrl ?? '/Logos/geapp.png'}
            className="h-11 w-auto max-w-full object-contain"
          />
        </Link>
      </div>

      <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4">
        <div className="space-y-4">
          {visibleGroups.map((group) => (
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
        </div>

        <p id="nav-not-available" className="sr-only">
          This section is not yet available.
        </p>
      </nav>

      <div className="shrink-0 border-t border-border-default bg-surface p-3">
        <SidebarUserMenu />
      </div>
    </aside>
  )
}
