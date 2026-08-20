import { NavLink } from 'react-router'
import type { NavItem as NavItemData } from '@/config/navigation'
import { cn } from '@/lib/utils'

/**
 * A top-level nav entry that resolves to a single item with no children —
 * rendered as a plain link rather than a dropdown trigger. See top-nav.tsx
 * for how a group is decided to be "single item" (post role-filtering, not
 * from the static config).
 */
export function TopNavLink({ item }: { item: NavItemData }) {
  if (!item.ready) {
    return (
      <button
        type="button"
        disabled
        aria-describedby="nav-not-available"
        className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-control px-3 py-2 text-sm font-medium text-text-subtle"
      >
        <item.icon aria-hidden="true" className="size-4 shrink-0" />
        {item.label}
      </button>
    )
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex shrink-0 items-center gap-1.5 rounded-control border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'border-brand-700 text-brand-700'
            : 'text-text-default hover:bg-brand-50 hover:text-brand-700',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            aria-hidden="true"
            className={cn('size-4 shrink-0', isActive ? 'text-brand-700' : 'text-text-muted')}
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}
