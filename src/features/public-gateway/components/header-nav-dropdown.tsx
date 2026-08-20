import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/**
 * A primary-nav dropdown for the header — modelled on IEA's "Topics ▾" /
 * "Data ▾" style menus (brainstormed from their header, not copied), but
 * square-cornered and shadow-free to match this page's own register (see
 * public-header.tsx's "SQUARE CORNERS" note) rather than IEA's rounded,
 * shadowed menus.
 *
 * Every link here resolves to something real — an anchor into a section
 * that actually exists on this page, or a real route (`/progress`) — never
 * a placeholder, per docs/public-gateway-home.md's "every link must
 * resolve" rule.
 */
export function HeaderNavDropdown({
  label,
  items,
}: {
  label: string
  items: readonly { label: string; to: string }[]
}) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 text-[0.9375rem] font-semibold text-text-default hover:text-link">
        {label}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 rounded-none border-border-strong p-1 shadow-none"
      >
        <ul>
          {items.map((item) => (
            <li key={item.to}>
              {item.to.startsWith('#') ? (
                <a
                  href={item.to}
                  className="block px-3 py-2 text-[0.9375rem] text-text-default hover:bg-surface-sunken"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  to={item.to}
                  className="block px-3 py-2 text-[0.9375rem] text-text-default hover:bg-surface-sunken"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
