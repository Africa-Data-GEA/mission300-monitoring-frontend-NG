import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

/**
 * Page controls for a paginated table.
 *
 * States the record range in words rather than only offering arrows, because
 * "showing 1–25 of 312" is what tells an administrator whether their filter
 * actually narrowed anything.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 pt-3',
        className,
      )}
    >
      <p aria-live="polite" className="text-xs text-text-muted">
        {total === 0
          ? 'No records'
          : `Showing ${first}–${last} of ${total} records`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
          Previous
        </Button>

        <span className="text-xs text-text-muted">
          Page {page} of {pageCount}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
