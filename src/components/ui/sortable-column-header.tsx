import { ArrowDown, ArrowUp } from 'lucide-react'

/**
 * A clickable table header that sorts its column.
 *
 * Carries `aria-sort` so the current sort is announced rather than only
 * shown as an arrow. Click an inactive column to sort by it ascending;
 * click the active column again to reverse it.
 */
export function SortableColumnHeader({
  label,
  active,
  descending,
  onClick,
  className,
}: {
  label: string
  active: boolean
  descending: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <th className={className ?? 'px-3 py-2.5'} aria-sort={active ? (descending ? 'descending' : 'ascending') : 'none'}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-medium transition-colors hover:text-text-default"
      >
        {label}
        {active &&
          (descending ? (
            <ArrowDown aria-hidden="true" className="size-3" />
          ) : (
            <ArrowUp aria-hidden="true" className="size-3" />
          ))}
      </button>
    </th>
  )
}
