import { SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router'
import { NAVIGATION } from '@/config/navigation'
import { readAuthSession } from '@/features/auth/auth-session'
import { canRoleReachModule } from '@/features/auth/role-access'
import { useBrandConfig } from '@/features/branding/api'
import { cn } from '@/lib/utils'
import { SidebarUserMenu } from './sidebar-user-menu'
import { TopbarNotifications } from './topbar-notifications'
import { TopbarSearch } from './topbar-search'
import { TopNavDropdown } from './top-nav-dropdown'
import { TopNavLink } from './top-nav-link'

/**
 * Desktop (lg+) primary navigation: a horizontal bar rather than the
 * persistent left rail Sidebar renders for the mobile drawer. A NAVIGATION
 * group becomes a plain link when it resolves — after role filtering — to a
 * single childless item; otherwise it becomes a dropdown. That check runs on
 * the filtered result, not the static config, because which groups collapse
 * to one item depends on the signed-in role.
 */
export function TopNav({
  className,
  filtersOpen = false,
  onToggleFilters,
}: {
  className?: string
  filtersOpen?: boolean
  onToggleFilters?: () => void
}) {
  const session = readAuthSession()
  const roleSlug = session?.user.role
  const { data: brand } = useBrandConfig()

  const visibleGroups = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !roleSlug || canRoleReachModule(roleSlug, item.moduleKey),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <header
      className={cn(
        'items-center gap-3 border-b border-border-default bg-surface px-4 py-2.5',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3">
        <Link to="/" aria-label="Go to the public landing page" className="shrink-0">
          <img
            alt={brand?.countryName ?? 'gEApp'}
            src={brand?.logoUrl ?? '/Logos/geapp.png'}
            className="h-8 w-auto max-w-full object-contain"
          />
        </Link>

        <nav aria-label="Primary" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {visibleGroups.map((group) => {
            const onlyItem = group.items.length === 1 ? group.items[0] : undefined
            return onlyItem && !onlyItem.children ? (
              <TopNavLink key={group.label} item={onlyItem} />
            ) : (
              <TopNavDropdown key={group.label} group={group} />
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <TopbarSearch />

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
              <span className="hidden xl:inline">Filters</span>
            </button>
          )}

          <TopbarNotifications />
          <SidebarUserMenu compact />
        </div>
      </div>
    </header>
  )
}
