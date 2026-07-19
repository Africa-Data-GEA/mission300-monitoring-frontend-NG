import { Fragment } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  readonly label: string
  /** Omit for the current page, which renders as plain text rather than a link. */
  readonly to?: string
}

/**
 * Breadcrumb trail.
 *
 * Each segment sits in a grey chip, as the wireframe shows, rather than being
 * plain inline text. Shared across pages — every module page uses this.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: readonly BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <Fragment key={item.label}>
              <li>
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className={cn(
                      'inline-flex items-center rounded-control bg-surface-sunken px-2.5 py-1 text-xs font-medium text-text-muted transition-colors',
                      'hover:text-text-default',
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    // Marks the current page for assistive technology.
                    aria-current={isLast ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center rounded-control bg-surface-sunken px-2.5 py-1 text-xs font-medium',
                      isLast ? 'text-text-default' : 'text-text-muted',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {!isLast && (
                <li aria-hidden="true" className="text-text-subtle">
                  /
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
