import { ChevronDown } from 'lucide-react'
import { NavLink } from 'react-router'
import { NAVIGATION } from '@/config/navigation'
import { cn } from '@/lib/utils'

/**
 * Primary navigation.
 *
 * Per the wireframe, every item is an outlined pill: the active item is filled
 * with the deep brand green and reversed to white, while inactive items are
 * white with a light border. Items whose pages are not yet built render as
 * disabled buttons rather than links, so the full information architecture is
 * reviewable without producing dead routes.
 */
const ITEM_BASE =
  'flex w-full items-center gap-2.5 rounded-control border px-3 py-2 text-sm font-medium transition-colors'

export function Sidebar({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex w-64 shrink-0 flex-col gap-5 bg-surface px-3 py-5',
        className,
      )}
    >
      <div className="px-1">
        <p className="text-base font-semibold text-text-default">Mission 300</p>
        <p className="text-sm text-text-muted">Monitoring Dashboard</p>
      </div>

      {NAVIGATION.map((group) => (
        <div key={group.label}>
          <p className="px-1 pb-2 text-xs font-medium text-text-subtle">
            {group.label}
          </p>

          <ul className="space-y-1.5">
            {group.items.map((item) => (
              <li key={item.label}>
                {item.ready ? (
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        ITEM_BASE,
                        isActive
                          ? 'border-brand-800 bg-brand-800 text-text-inverse'
                          : 'border-border-default bg-surface text-text-default hover:bg-surface-sunken',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          aria-hidden="true"
                          className={cn(
                            'size-4 shrink-0',
                            isActive ? 'text-text-inverse' : 'text-text-muted',
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                        {item.children && (
                          <ChevronDown
                            aria-hidden="true"
                            className="ml-auto size-4 shrink-0 opacity-70"
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
                      'cursor-not-allowed border-border-default bg-surface text-left text-text-subtle',
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-text-subtle"
                    />
                    <span className="truncate">{item.label}</span>
                    {item.children && (
                      <ChevronDown
                        aria-hidden="true"
                        className="ml-auto size-4 shrink-0 opacity-70"
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
