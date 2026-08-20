import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import type { NavItem as NavItemData } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEM_BASE } from './nav-item'

/**
 * A sidebar entry with children — expands in place to reveal each child as
 * its own nav link, rather than navigating anywhere itself.
 */
export function NavDropdownItem({ item }: { item: NavItemData }) {
  const location = useLocation()
  const hasActiveChild = Boolean(
    item.children?.some((child) => location.pathname.startsWith(child.to)),
  )
  const [open, setOpen] = useState(hasActiveChild)

  return (
    <div>
      {/*
        A dropdown trigger is never itself the active page — one of its
        children is — so it gets a light gold tint rather than the solid
        gold fill reserved for an actually-active link. That solid fill is
        used one level down, on the active child itself, so "a child of this
        group is open" and "this is the page you're on" stay visually
        distinct instead of looking like the same state at two levels.
      */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={cn(
          NAV_ITEM_BASE,
          hasActiveChild
            ? 'bg-chart-accent/20 text-text-default'
            : 'bg-surface-sunken/10 text-text-default hover:bg-border-default',
        )}
      >
        <item.icon
          aria-hidden="true"
          className={cn('size-3.5 shrink-0', hasActiveChild ? 'text-chart-accent' : 'text-text-muted')}
        />
        <span className="truncate">{item.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn('ml-auto size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-border-default pl-3.5">
          {item.children?.map((child) =>
            child.ready ? (
              <li key={child.to}>
                <NavLink
                  to={child.to}
                  className={({ isActive }) =>
                    cn(
                      'block truncate rounded-control px-2.5 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-chart-accent font-semibold text-brand-900'
                        : 'text-text-muted hover:bg-border-default hover:text-text-default',
                    )
                  }
                >
                  {child.label}
                </NavLink>
              </li>
            ) : (
              <li key={child.to}>
                <button
                  type="button"
                  disabled
                  aria-describedby="nav-not-available"
                  className="block w-full cursor-not-allowed truncate rounded-control px-2.5 py-1.5 text-left text-sm text-text-subtle"
                >
                  {child.label}
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  )
}
