import type { InstitutionExceptions } from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'

/**
 * Section D — open bottlenecks by responsible institution.
 *
 * The specification asks for "ranked bars with exception table" and requires
 * high-or-critical records to be shown first — the mock already ranks
 * institutions by that count, so this renders them in the order given rather
 * than re-sorting.
 */
export function AgencyAccountability({
  rows,
}: {
  rows: readonly InstitutionExceptions[]
}) {
  const maxOpen = Math.max(1, ...rows.map((row) => row.openCount))

  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Open bottlenecks by responsible institution
      </h2>

      <Card className="mt-2 p-4 sm:mt-3">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Open bottlenecks assigned to each responsible institution, ranked by
            high or critical severity
          </caption>
          <thead>
            <tr className="border-b border-border-default">
              <th scope="col" className="px-2 py-2 text-xs font-medium text-text-muted">
                Institution
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-left text-xs font-medium text-text-muted"
              >
                Open bottlenecks
              </th>
              <th
                scope="col"
                className="px-2 py-2 text-right text-xs font-medium whitespace-nowrap text-text-muted"
              >
                High or critical
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.institution} className="border-b border-border-default last:border-0">
                <th
                  scope="row"
                  className="px-2 py-3 text-sm font-medium whitespace-nowrap text-text-default"
                >
                  {row.institution}
                </th>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      role="img"
                      aria-label={`${row.institution}: ${row.openCount} open bottlenecks`}
                      className="h-2 w-32 overflow-hidden rounded-pill bg-surface-sunken"
                    >
                      <div
                        className="h-full rounded-pill bg-brand-600"
                        style={{ width: `${(row.openCount / maxOpen) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-text-muted">{row.openCount}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-right">
                  <span
                    className={
                      row.criticalOrHighCount > 0
                        ? 'text-sm font-medium text-status-at-risk'
                        : 'text-sm text-text-subtle'
                    }
                  >
                    {row.criticalOrHighCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Card>
  )
}
