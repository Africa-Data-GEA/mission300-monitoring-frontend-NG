import {
  REGISTER_SEVERITIES,
  SEVERITY_LABELS,
  type LifecycleDistribution,
} from '@/api/schemas/bottlenecks'
import { Card } from '@/components/ui/card'
import { SeverityStackedBar } from './severity-stacked-bar'

const FILL_LEGEND: Record<(typeof REGISTER_SEVERITIES)[number], string> = {
  critical: 'bg-status-at-risk',
  high: 'bg-status-lagging',
  medium: 'bg-brand-400',
  low: 'bg-border-strong',
}

/** Section C, part two — open bottlenecks by lifecycle stage, split by
 * severity within each stage. */
export function LifecycleDistributionCard({
  rows,
}: {
  rows: readonly LifecycleDistribution[]
}) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-default">
          Bottlenecks by lifecycle stage
        </h3>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {REGISTER_SEVERITIES.map((severity) => (
            <li
              key={severity}
              className="flex items-center gap-1.5 text-xs text-text-muted"
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${FILL_LEGEND[severity]}`}
              />
              {SEVERITY_LABELS[severity]}
            </li>
          ))}
        </ul>
      </div>

      <ul aria-label="Bottlenecks by lifecycle stage" className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.stage}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-text-default">
                {row.label}
              </span>
              <span className="text-xs text-text-muted">
                {row.total} open
              </span>
            </div>
            <div className="mt-1.5">
              <SeverityStackedBar
                label={row.label}
                total={row.total}
                bySeverity={row.bySeverity}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
