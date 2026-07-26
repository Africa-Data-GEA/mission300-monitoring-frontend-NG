import {
  VALIDATION_LABELS,
  type PillarDistribution,
} from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STATUS_FILL, STATUS_ORDER } from './validation-legend'

/** Indicators per pillar, split by value-availability, as stacked bars. */
export function PillarCoverage({ rows }: { rows: readonly PillarDistribution[] }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-default">
          Indicators by pillar
        </h3>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {STATUS_ORDER.map((status) => (
            <li
              key={status}
              className="flex items-center gap-1.5 text-xs text-text-muted"
            >
              <span
                aria-hidden="true"
                className={cn('size-2 rounded-full', STATUS_FILL[status])}
              />
              {VALIDATION_LABELS[status]}
            </li>
          ))}
        </ul>
      </div>

      <ul aria-label="Indicators by pillar" className="mt-4 space-y-3">
        {rows.map((row) => {
          const description = STATUS_ORDER.map(
            (status) =>
              `${row.byStatus.find((s) => s.status === status)?.count ?? 0} ${VALIDATION_LABELS[status].toLowerCase()}`,
          ).join(', ')

          return (
            <li key={row.pillar}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-text-default">
                  {row.label}
                </span>
                <span className="text-xs text-text-muted">
                  {row.total} indicator{row.total === 1 ? '' : 's'}
                </span>
              </div>

              {row.total === 0 ? (
                <p className="mt-1 text-xs text-text-subtle">
                  No indicators assigned
                </p>
              ) : (
                <div
                  role="img"
                  aria-label={`${row.label}: ${description}`}
                  className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-pill"
                >
                  {STATUS_ORDER.map((status) => {
                    const count =
                      row.byStatus.find((s) => s.status === status)?.count ?? 0
                    if (count === 0) return null
                    return (
                      <div
                        key={status}
                        className={STATUS_FILL[status]}
                        style={{ width: `${(count / row.total) * 100}%` }}
                      />
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
