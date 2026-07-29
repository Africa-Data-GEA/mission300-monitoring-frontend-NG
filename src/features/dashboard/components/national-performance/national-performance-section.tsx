import { Card } from '@/components/ui/card'
import type { BulletMetric } from '../../types'
import { BulletLegend } from './bullet-legend'
import { BulletMetricRow } from './bullet-metric-row'

/**
 * Section C — National Performance and Target Progress.
 *
 * Every metric is a horizontal bullet chart on its own scale, showing
 * baseline, current value, the expected value for the selected period, and the
 * approved target where one exists. The row and legend live in their own files
 * in this folder.
 */
export function NationalPerformanceSection({
  metrics,
}: {
  metrics: readonly BulletMetric[]
}) {
  return (
    <Card variant="well" className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-text-default">
          National performance and target progress
        </h2>
        <BulletLegend />
      </div>

      {metrics.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border-default bg-surface-card px-4 py-8 text-center text-sm text-text-muted">
          No national performance metrics match the selected filters.
        </p>
      ) : (
        <ul
          aria-label="National performance metrics"
          className="mt-3 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3"
        >
          {metrics.map((metric) => (
            <li key={metric.id}>
              <BulletMetricRow metric={metric} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
