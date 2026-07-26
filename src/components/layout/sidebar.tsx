import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router'
import { NAVIGATION } from '@/config/navigation'
import { cn } from '@/lib/utils'

/**
 * Primary navigation.
 *
 * Active items are filled with the deep brand green and reversed to white.
 * Inactive items sit on a very light tint rather than carrying a border — at
 * this density a border per row draws more attention to the chrome than to the
 * content. Items whose pages are not yet built render as disabled buttons
 * rather than links, so the full information architecture is reviewable
 * without producing dead routes.
 */
const ITEM_BASE =
  'flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-sm font-medium transition-colors'

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
        <p className="text-sm font-semibold text-text-default">Mission 300</p>
        <p className="text-xs text-text-muted">Monitoring Dashboard</p>
      </div>

      {NAVIGATION.map((group) => (
        <div key={group.label}>
          <p className="px-1.5 pb-1.5 text-2xs font-medium tracking-wide text-text-subtle uppercase">
            {group.label}
          </p>

          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                {item.ready ? (
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        ITEM_BASE,
                        isActive
                          ? 'bg-brand-800 text-text-inverse'
                          : 'bg-surface-sunken/10 text-text-default hover:bg-border-default',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          aria-hidden="true"
                          className={cn(
                            'size-3.5 shrink-0',
                            isActive ? 'text-text-inverse' : 'text-text-muted',
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                        {item.children && (
                          <ChevronDown
                            aria-hidden="true"
                            className="ml-auto size-3.5 shrink-0 opacity-70"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    disabled
                    // Communicates "planned, not broken" to everyone reviewing
                    // the build, including screen-reader users.
                    aria-describedby="nav-not-available"
                    className={cn(
                      ITEM_BASE,
                      'cursor-not-allowed bg-surface-sunken text-left text-text-subtle',
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-text-subtle"
                    />
                    <span className="truncate">{item.label}</span>
                    {item.children && (
                      <ChevronDown
                        aria-hidden="true"
                        className="ml-auto size-3.5 shrink-0 opacity-70"
                      />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p id="nav-not-available" className="sr-only">
        This section is not yet available.
      </p>
    </nav>
  )
}
