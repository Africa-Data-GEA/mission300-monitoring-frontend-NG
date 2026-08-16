import { LineChart, Rows3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BulletMetric } from '../../types'
import { BulletLegend } from './bullet-legend'
import { BulletMetricRow } from './bullet-metric-row'
import { BulletTrendRow } from './bullet-trend-row'

/**
 * Section C — National Performance and Target Progress.
 *
 * Every metric is a horizontal progress chart on its own scale, showing the
 * current value and approved target where one exists. A "Trend" tab beside
 * it swaps to each metric's period-over-period evolution — stakeholder
 * feedback asked to see the trajectory across the reporting cycle, not only
 * the current position. The row and legend live in their own files in this
 * folder.
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
        <Tabs defaultValue="progress" className="mt-3">
          <TabsList aria-label="National performance views">
            <TabsTrigger value="progress" className="inline-flex items-center gap-2">
              <Rows3 className="size-4" aria-hidden="true" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="trend" className="inline-flex items-center gap-2">
              <LineChart className="size-4" aria-hidden="true" />
              Trend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="pt-0">
            <ul
              aria-label="National performance metrics"
              className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3"
            >
              {metrics.map((metric) => (
                <li key={metric.id}>
                  <BulletMetricRow metric={metric} />
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="trend">
            <ul
              aria-label="National performance metric trends"
              className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3"
            >
              {metrics.map((metric) => (
                <li key={metric.id}>
                  <BulletTrendRow metric={metric} />
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  )
}
