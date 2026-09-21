import { Link } from 'react-router'
import { NAVIGATION } from '@/config/navigation'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
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
  const { data: brand } = useBrandConfig()

  // No session (e.g. a dev workflow that never went through /account/login)
  // shows the full nav rather than nothing — restriction only applies once a
  // real signed-in role exists to restrict against.
  const visibleGroups = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !!session && canUserReachModule(session.user, item.moduleKey),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'dark flex w-64 shrink-0 flex-col overflow-hidden bg-surface',
        className,
      )}
    >
      {/*
        The platform name sits beside the mark rather than leaving the header
        as logo-plus-empty-space — review feedback was that the gap under the
        logo read as dead real estate, and that the full platform name should
        be stated rather than implied (see docs/M300 Monitoring Platform
        Feedback.pptx, slides 1-2).
      */}
      <div className="shrink-0 px-4 pt-5 pb-4">
        <Link
          to="/"
          aria-label="Go to the public landing page"
          className="flex items-center gap-2.5"
        >
          <img
            alt={`${brand?.countryName ?? 'Nigeria'} — Mission 300, Compact Progress Monitoring Platform`}
            src="/Logos/m300-logo-white.svg"
            className="h-10 w-auto shrink-0 object-contain"
          />
        </Link>
      </div>

      {/* Funding partners — AfDB and the World Bank back the Compact itself,
          shown quietly up top rather than competing with the platform mark. */}
      <div className="flex shrink-0 items-center gap-2.5 border-t border-border-default px-4 py-2">
        <img
          alt="World Bank Group"
          src="/reports/compact-progress/logo-worldbank.png"
          className="h-6 w-auto shrink-0 object-contain"
        />
        <div className="h-4 w-px shrink-0 bg-white/15" aria-hidden="true" />
        <img
          alt="African Development Bank"
          src="/reports/compact-progress/logo-afdb.png"
          className="h-6 w-auto shrink-0 object-contain"
        />
      </div>

      <nav
        aria-label="Primary"
        className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
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

      {/* Partner marks — SEforALL and GEAPP are named to the Compact but have
          no page of their own, so a small, quiet footer strip is the only
          place they'd otherwise appear. The build credit sits alone on the
          right, separate from the partner marks on the left. */}
      <div className="flex shrink-0 items-center justify-between gap-2.5 border-t border-border-default px-4 py-2">
        <div className="flex items-center gap-2.5">
          <img alt="SEforALL" src="/seforall.svg" className="h-5 w-auto shrink-0 object-contain brightness-0 invert" />
          <div className="h-4 w-px shrink-0 bg-white/15" aria-hidden="true" />
          <img alt="GEAPP" src="/reports/compact-progress/logo-geapp.png" className="h-5 w-auto shrink-0 object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          <img alt="EMRC" src="/emrc.png" className="h-4 w-auto shrink-0 object-contain" />
          <span className="text-2xs leading-tight text-text-subtle">Developed by EMRC</span>
        </div>
      </div>

      <div className="shrink-0 border-t border-border-default bg-surface p-3">
        <SidebarUserMenu />
      </div>
    </aside>
  )
}
