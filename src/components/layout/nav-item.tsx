import { NavLink } from 'react-router'
import type { NavItem as NavItemData } from '@/config/navigation'
import { cn } from '@/lib/utils'

export const NAV_ITEM_BASE =
  'flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-sm font-medium transition-colors'

/** A single sidebar entry with no children — either a live link or a disabled placeholder. */
export function NavItem({
  item,
  onNavigate,
}: {
  item: NavItemData
  onNavigate?: () => void
}) {
  if (!item.ready) {
    return (
      <button
        type="button"
        disabled
        // Communicates "planned, not broken" to everyone reviewing the
        // build, including screen-reader users.
        aria-describedby="nav-not-available"
        className={cn(
          NAV_ITEM_BASE,
          'cursor-not-allowed bg-surface-sunken text-left text-text-subtle',
        )}
      >
        <item.icon aria-hidden="true" className="size-3.5 shrink-0 text-text-subtle" />
        <span className="truncate">{item.label}</span>
      </button>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          NAV_ITEM_BASE,
          // Gold is a light fill, so the active item needs genuinely dark
          // text/icon for contrast — text-text-default resolves to white
          // inside this sidebar's `.dark` scope, which would be white-on-gold.
          isActive
            ? 'bg-chart-accent text-brand-900'
            : 'bg-surface-sunken/10 text-text-default hover:bg-border-default',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            aria-hidden="true"
            className={cn('size-3.5 shrink-0', isActive ? 'text-brand-900' : 'text-text-muted')}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}
