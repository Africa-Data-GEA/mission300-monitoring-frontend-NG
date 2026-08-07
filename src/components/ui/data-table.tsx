import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Column definition.
 *
 * `cell` returns a node so a column can render a badge or a link; `sortValue`
 * returns something comparable so sorting works on the underlying value rather
 * than on rendered markup.
 */
export interface Column<T> {
  readonly id: string
  readonly header: string
  readonly cell: (row: T) => ReactNode
  /** Omit to make the column unsortable. */
  readonly sortValue?: (row: T) => string | number | null
  /** Right-align numeric columns. */
  readonly align?: 'left' | 'right'
  readonly className?: string
}

type SortState = { columnId: string; direction: 'asc' | 'desc' } | null

/**
 * Administrative table with client-side sorting.
 *
 * Shared across the table-shaped modules — Users, Access scope, Audit log, and
 * later the Implementation Register and KPI Explorer.
 *
 * Sorting is client-side over the current page only, which is honest for a
 * paginated view: it reorders what you can see, and the header says so through
 * `aria-sort`. Server-side sorting can be added later by lifting `sort` into
 * the query; the column API would not change.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  emptyMessage = 'No records match the current filters.',
  rowActions,
  className,
}: {
  columns: readonly Column<T>[]
  rows: readonly T[]
  getRowId: (row: T) => string
  /** Accessible name for the table. Required — a bare grid is unusable. */
  caption: string
  emptyMessage?: string
  rowActions?: (row: T) => ReactNode
  className?: string
}) {
  const [sort, setSort] = useState<SortState>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows

    const column = columns.find((entry) => entry.id === sort.columnId)
    if (!column?.sortValue) return rows

    const { sortValue } = column

    return [...rows].sort((a, b) => {
      const left = sortValue(a)
      const right = sortValue(b)

      // Nulls sort last regardless of direction — "never signed in" is not a
      // date and should not lead the list.
      if (left === null && right === null) return 0
      if (left === null) return 1
      if (right === null) return -1

      const comparison =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right))

      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [rows, sort, columns])

  function toggleSort(columnId: string) {
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: 'asc' }
      if (current.direction === 'asc') return { columnId, direction: 'desc' }
      // Third click clears the sort and restores the server's ordering, which
      // for the audit log is chronological and meaningful.
      return null
    })
  }

  return (
    // `relative` matters here, not just cosmetically: the sr-only <caption>
    // below is `position: absolute` with no other positioned ancestor, so
    // without this its containing block falls back to the viewport root —
    // it then escapes this div's overflow-x-auto clipping entirely (an
    // absolutely-positioned descendant is clipped by the nearest *positioned*
    // ancestor, not just the nearest overflow:auto one) and inflates
    // document.documentElement.scrollWidth on any page with a wide table.
    <div className={cn('relative w-full max-w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr className="border-b border-border-default">
            {columns.map((column) => {
              const isSorted = sort?.columnId === column.id
              const sortable = Boolean(column.sortValue)

              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    !sortable
                      ? undefined
                      : isSorted
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                  }
                  className={cn(
                    'px-2 py-2 text-xs font-medium whitespace-nowrap text-text-muted sm:px-3',
                    column.align === 'right' && 'text-right',
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-sm transition-colors hover:text-text-default',
                        column.align === 'right' && 'flex-row-reverse',
                      )}
                    >
                      {column.header}
                      {isSorted ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp aria-hidden="true" className="size-3" />
                        ) : (
                          <ArrowDown aria-hidden="true" className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown
                          aria-hidden="true"
                          className="size-3 opacity-40"
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
            {rowActions && (
              <th
                scope={'col'}
                className={'w-10 px-2 py-2 text-right text-xs font-medium text-text-muted sm:w-12 sm:px-3'}
              >
                <span className={'sr-only'}>Actions</span>
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {sorted.map((row) => (
            <tr
              key={getRowId(row)}
              className="border-b border-border-default last:border-0 hover:bg-surface-sunken"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    'px-2 py-2.5 text-sm text-text-default sm:px-3',
                    column.align === 'right' && 'text-right',
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
              {rowActions && (
                <td className={'px-1 py-1.5 text-right sm:px-3'}>
                  {rowActions(row)}
                </td>
              )}
            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="px-3 py-8 text-center text-sm text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
