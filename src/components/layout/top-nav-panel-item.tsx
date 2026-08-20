import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

/**
 * One row inside a TopNavDropdown panel — a leaf item, or one of an item's
 * `children` shown as an indented sub-row. Either a live link or, when
 * `ready` is false, a disabled placeholder communicating "planned, not
 * broken" (see `nav-not-available` in Sidebar/NavItem).
 */
export function TopNavPanelItem({
  label,
  to,
  ready,
  indent = false,
}: {
  label: string
  to: string
  ready: boolean
  indent?: boolean
}) {
  if (!ready) {
    return (
      <button
        type="button"
        disabled
        aria-describedby="nav-not-available"
        className={cn(
          'block w-full cursor-not-allowed truncate rounded-control px-2.5 py-1.5 text-left text-sm text-text-subtle',
          indent && 'pl-5',
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'block truncate rounded-control px-2.5 py-1.5 text-sm transition-colors',
          indent && 'pl-5',
          isActive
            ? 'bg-brand-50 font-semibold text-brand-700'
            : 'text-text-default hover:bg-surface-sunken',
        )
      }
    >
      {label}
    </NavLink>
  )
}
