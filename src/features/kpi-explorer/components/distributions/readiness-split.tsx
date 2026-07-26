import {
  READINESS_LABELS,
  type ReadinessDistribution,
} from '@/api/schemas/kpi-explorer'
import { Card } from '@/components/ui/card'

/** Indicator count by readiness tier, as proportional bars. */
export function ReadinessSplit({
  rows,
}: {
  rows: readonly ReadinessDistribution[]
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-default">
        Indicators by readiness tier
      </h3>

      <ul className="mt-4 space-y-3">
        {rows.map((row) => {
          const share = total === 0 ? 0 : (row.count / total) * 100

          return (
            <li key={row.tier}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-text-default">
                  {READINESS_LABELS[row.tier]}
                </span>
                <span className="text-text-muted">{row.count}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-pill bg-surface-sunken">
                <div
                  className="h-full rounded-pill bg-brand-500"
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
