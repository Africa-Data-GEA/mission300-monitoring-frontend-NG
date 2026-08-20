import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { NavGroup } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { TopNavPanelItem } from './top-nav-panel-item'

/**
 * A top-level nav entry backed by more than one item (or a single item with
 * `children`) — a click-to-open panel listing every item in the group. An
 * item with `children` (e.g. Pillar dashboards) shows them as an
 * always-expanded indented sub-list the moment the panel is open, rather
 * than requiring a second click — the panel itself is already the "opened"
 * state, so there's no vertical-space constraint to save by collapsing them
 * further (contrast NavDropdownItem's persistent-rail version, which does
 * need that).
 */
export function TopNavDropdown({ group }: { group: NavGroup }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isGroupActive = group.items.some(
    (item) =>
      location.pathname.startsWith(item.to) ||
      item.children?.some((child) => location.pathname.startsWith(child.to)),
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-control border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors',
            isGroupActive
              ? 'border-brand-700 text-brand-700'
              : 'text-text-default hover:bg-brand-50 hover:text-brand-700',
          )}
        >
          {group.label}
          <ChevronDown
            aria-hidden="true"
            className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={8} className="w-64 p-1.5">
        <ul className="space-y-0.5">
          {group.items.map((item) =>
            item.children && item.children.length > 0 ? (
              // An item with children is a heading, never a link itself — it
              // expands in place rather than navigating to an index page.
              <li key={item.to}>
                <p className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-text-default">
                  <item.icon aria-hidden="true" className="size-3.5 shrink-0 text-text-muted" />
                  {item.label}
                </p>
                <ul className="mt-0.5 space-y-0.5 border-l border-border-default pl-2">
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <TopNavPanelItem label={child.label} to={child.to} ready={child.ready} indent />
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={item.to}>
                <TopNavPanelItem label={item.label} to={item.to} ready={item.ready} />
              </li>
            ),
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
